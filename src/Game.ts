
import WebSocket from 'ws';
import { BLACK, CHECK, CHECKMATE, DRAW, ERROR, GAME_OVER, INSUFFICIENT_MATERIAL, INVALID_MOVE, MOVE, NONE, RESIGN, STALEMATE, THREEFOLD_REPETITION, TIMEOUT, WHITE } from './helpers/messages';
import { Chess } from 'chess.js';
const GAME_DURATION_MS = 6000; 

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  private movesCount: number


  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.movesCount = 0;
  }

  private resetGame() {
    this.board.reset();
    this.movesCount = 0;
  }

  handleMove(socket: WebSocket, move: { from: string; to: string }) {
    const currentPlayer = this.getCurrentPlayer(socket);

    if (!currentPlayer) {
        socket.send(JSON.stringify({ type: ERROR, message: 'Player not found in game.' }));
        return;
    }

    const isPlayer1Turn = this.movesCount % 2 === 0 && currentPlayer === this.player1;
    const isPlayer2Turn = this.movesCount % 2 === 1 && currentPlayer === this.player2;

    if (!isPlayer1Turn && !isPlayer2Turn) {
        socket.send(JSON.stringify({ type: ERROR, message: 'Not your turn to move.' }));
        return;
    }

    try {
        const isValidMove = this.board.move({
            from: move.from,
            to: move.to,
            promotion: 'q' // default to promoting to queen for simplicity
        });

        if (isValidMove) {
          this.checkIfCheck(socket);
          this.player2.send(JSON.stringify({ type: MOVE, move }));
          this.player1.send(JSON.stringify({ type: MOVE, move }));

            if (this.board.isGameOver()) {
                this.endGame();
            }
        } else {
            socket.send(JSON.stringify({ type: INVALID_MOVE }));
            return;
        }
    } catch (error) {
        socket.send(JSON.stringify({ type: INVALID_MOVE }));
        return;
    }

    this.movesCount++;
  }

  private checkIfCheck(socket: WebSocket) {
    const currentPlayer = this.getCurrentPlayer(socket);

    if (!currentPlayer) {
        socket.send(JSON.stringify({ type: ERROR, message: 'Player not found in game.' }));
        return;
    }

    if (this.board.isCheck()) {
        currentPlayer.send(JSON.stringify({ type: CHECK }));
    }
  }


  handleResign(socket: WebSocket) {
    const currentPlayer = this.getCurrentPlayer(socket);

    if (!currentPlayer) {
        socket.send(JSON.stringify({ type: ERROR, message: 'Player not found in game.' }));
        return;
    }

    const opponent = currentPlayer === this.player1 ? this.player2 : this.player1;
    const winner = currentPlayer === this.player1 ? BLACK : WHITE;

    const payload = {
      result: RESIGN,
      winner: winner
    }

    this.player1.send(JSON.stringify({ type: GAME_OVER, payload }));
    this.player2.send(JSON.stringify({ type: GAME_OVER, payload }));

    this.resetGame();
    return;
  }

  handleTimeout(socket: WebSocket) {
    const currentPlayer = this.getCurrentPlayer(socket);

    if (!currentPlayer) {
        socket.send(JSON.stringify({ type: ERROR, message: 'Player not found in game.' }));
        return;
    }

    const opponent = currentPlayer === this.player1 ? this.player2 : this.player1;
    const winner = currentPlayer === this.player1 ? BLACK : WHITE;

    const payload = {
      result: TIMEOUT,
      winner: winner
    }

    this.player1.send(JSON.stringify({ type: GAME_OVER, payload }));
    this.player2.send(JSON.stringify({ type: GAME_OVER, payload }));

    this.resetGame();
    return;
  }

  private getCurrentPlayer(socket: WebSocket): WebSocket | null {
    return this.player1 === socket ? this.player1 : this.player2;
  }

  private endGame() {
    let payload = {};
    let result;
    let winner;
  
    if (this.board.isCheckmate()) {
      result = CHECKMATE;
      winner = this.board.turn() === 'w' ? BLACK : WHITE;
    } else if (this.board.isDraw()) {
      result = DRAW;
      winner = NONE;
    } else if (this.board.isStalemate()) {
      result = STALEMATE;
      winner = NONE;
    } else if (this.board.isInsufficientMaterial()) {
      result = INSUFFICIENT_MATERIAL;
      winner = NONE;
    } else if (this.board.isThreefoldRepetition()) {
      result = THREEFOLD_REPETITION;
      winner = NONE;
    } else {
      result = 'UNKNOWN';
      winner = NONE;
    }
  
    payload = {
      result: result,
      winner: winner
    }
  
    this.player1.send(JSON.stringify({ type: GAME_OVER, payload }));
    this.player2.send(JSON.stringify({ type: GAME_OVER, payload }));

    this.resetGame();
    return;
  }
  

}
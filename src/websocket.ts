// src/websocket.ts
import WebSocket from 'ws';
import { createGame, handleMove, handleResign, Game } from './Game';

const games: Map<string, Game> = new Map();

export const handleWebSocketConnection = (wss: WebSocket.Server): void => {
  wss.on('connection', (ws: WebSocket) => {
    
    ws.on('message', (message: string) => {
        console.log('recieved msg ', message);
        
      const data = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case 'join_game':
          const { gameId, player1, player2 } = payload;
          createGame(gameId, player1, player2);
          break;
        case 'make_move':
          const { gameId: moveGameId, move } = payload;
          const isValidMove = handleMove(moveGameId, move);
          if (!isValidMove) {
            // Handle invalid move
          }
          break;
        case 'resign':
          const { gameId: resignGameId, player } = payload;
          handleResign(resignGameId, player);
          break;
        default:
          // Handle unknown message types
          break;
      }

      // Send updated game state to all players
      games.forEach((game: Game, gameId: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'game_state', payload: game.chessInstance.fen() }));
        }
      });
    });

    ws.send('e4 e5');
  });
};

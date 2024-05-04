import { Game } from "./Game";
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { BLACK, GAME_START, INIT_GAME, MOVE, RESIGN, TIMEOUT, WHITE } from "./messages";

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor () {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    adduser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
    }

    handleMessage(socket: WebSocket, data: string) {
        const message = JSON.parse(data.toString());

        if (message.type === INIT_GAME) {
            this.handleInitGame(socket);
        }

        if (message.type === MOVE) {
            this.handleMove(socket, message.move);
        }

        if (message.type === RESIGN) {
            this.handleResign(socket);
        }

        if (message.type === TIMEOUT) {
            this.handleTimeout(socket);
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', (data: string) => {
            this.handleMessage(socket, data);
        });
    }

    private handleInitGame(socket: WebSocket) {
        if (this.pendingUser) {
            const game = new Game(this.pendingUser, socket);
            this.games.push(game);  

            const whiteSocketId = uuidv4().toString();
            const blackSocketId = uuidv4().toString();

            this.pendingUser.send(JSON.stringify({ type: GAME_START, color: WHITE, socketId: whiteSocketId }));
            socket.send(JSON.stringify({ type: GAME_START, color: BLACK, socketId: blackSocketId }));
            this.pendingUser = null;
        } else {
            this.pendingUser = socket;
        }
    }

    private handleMove(socket: WebSocket, move: { from: string; to: string }) {
        const game = this.findGameBySocket(socket);

        if (game) {
            game.handleMove(socket, move);
        }
    }

    private handleResign(socket: WebSocket) {
        const game = this.findGameBySocket(socket);
        if (game) {
            game.handleResign(socket);
        }
    }

    private handleTimeout(socket: WebSocket) {
        const game = this.findGameBySocket(socket);
        if (game) {
            game.handleTimeout(socket);
        }
    }

    // Helper function to find the game associated with a socket
    private findGameBySocket(socket: WebSocket) {
        const game = this.games.find(
            (game) => game.player1 === socket || game.player2 === socket
        );

        return game;
    }
}
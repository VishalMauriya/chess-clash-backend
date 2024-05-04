import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { GameManager } from './GameManager';
import connectDB from './connections/db';
import redisClient from './connections/redis';
dotenv.config();


const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const gameManager = new GameManager();

wss.on('connection', (ws) => {
  gameManager.adduser(ws);

  ws.on('close', () => gameManager.removeUser(ws));
});

connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

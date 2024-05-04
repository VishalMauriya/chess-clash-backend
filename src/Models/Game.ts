import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
    player1: string;
    player2: string;
    moves: { from: string; to: string }[];
    winner: string | null;
}

const GameSchema: Schema = new Schema({
    player1: { type: String, required: true },
    player2: { type: String, required: true },
    moves: [{ from: String, to: String }],
    winner: { type: String, default: null },
});

const GameModel = mongoose.model<IGame>('Game', GameSchema);

export default GameModel;

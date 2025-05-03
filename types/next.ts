import { NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface Game {
  id: string;
  players: Player[];
  currentWord: string;
  isStarted: boolean;
  round: number;
  maxRounds: number;
}

export interface GameEvent {
  gameId: string;
  playerName?: string;
  guess?: string;
}

export interface GameState {
  players: Player[];
  currentWord?: string;
  round?: number;
  maxRounds?: number;
}

export interface ErrorEvent {
  message: string;
}

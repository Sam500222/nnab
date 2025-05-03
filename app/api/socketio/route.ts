import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextRequest } from "next/server";
import { getRandomWord } from "../../../lib/words";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Game state management
interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

interface Game {
  id: string;
  players: Player[];
  currentWord: string;
  isStarted: boolean;
  round: number;
  maxRounds: number;
  isNoNothingAssBitch: boolean;
  phase: "countdown" | "word-reveal" | "clue-giving" | "voting" | "results";
  clues?: Record<string, string>;
  votes?: Record<string, string>;
  noNothingAssBitchId?: string;
  winner?: "normal" | "imposter";
}

const games: Map<string, Game> = new Map();

export async function GET(req: NextRequest) {
  if (!global.io) {
    const httpServer = global.httpServer;
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Socket.IO event handlers
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Create a new game
      socket.on("createGame", ({ playerName }) => {
        const gameId = uuidv4();
        const game: Game = {
          id: gameId,
          players: [{
            id: socket.id,
            name: playerName,
            score: 0,
            isHost: true
          }],
          currentWord: "",
          isStarted: false,
          round: 0,
          maxRounds: 5,
          isNoNothingAssBitch: false,
          phase: "countdown"
        };
        games.set(gameId, game);
        socket.join(gameId);
        socket.emit("gameCreated", { gameId });
      });

      // Join an existing game
      socket.on("joinGame", ({ gameId, playerName }) => {
        const game = games.get(gameId);
        if (!game) {
          socket.emit("error", { message: "Game not found" });
          return;
        }

        if (game.isStarted) {
          socket.emit("error", { message: "Game has already started" });
          return;
        }

        const player: Player = {
          id: socket.id,
          name: playerName,
          score: 0,
          isHost: false
        };

        game.players.push(player);
        socket.join(gameId);
        io.to(gameId).emit("playerJoined", { players: game.players });
      });

      // Start the game
      socket.on("startGame", ({ gameId }) => {
        const game = games.get(gameId);
        if (!game) {
          socket.emit("error", { message: "Game not found" });
          return;
        }

        const player = game.players.find(p => p.id === socket.id);
        if (!player?.isHost) {
          socket.emit("error", { message: "Only the host can start the game" });
          return;
        }

        game.isStarted = true;
        game.currentWord = getRandomWord();
        io.to(gameId).emit("gameStarted", {
          currentWord: game.currentWord,
          round: game.round,
          maxRounds: game.maxRounds,
          isNoNothingAssBitch: game.isNoNothingAssBitch,
          phase: game.phase,
          clues: game.clues,
          votes: game.votes,
          noNothingAssBitchId: game.noNothingAssBitchId,
          winner: game.winner
        });
      });

      // Handle player guesses
      socket.on("guess", ({ gameId, guess }) => {
        const game = games.get(gameId);
        if (!game) {
          socket.emit("error", { message: "Game not found" });
          return;
        }

        if (guess.toLowerCase() === game.currentWord.toLowerCase()) {
          const player = game.players.find(p => p.id === socket.id);
          if (player) {
            player.score += 1;
            io.to(gameId).emit("correctGuess", {
              playerId: socket.id,
              playerName: player.name,
              score: player.score
            });
          }
        }
      });

      // Handle disconnections
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        // Clean up game state if needed
        games.forEach((game, gameId) => {
          game.players = game.players.filter(p => p.id !== socket.id);
          if (game.players.length === 0) {
            games.delete(gameId);
          } else {
            io.to(gameId).emit("playerLeft", { players: game.players });
          }
        });
      });
    });

    global.io = io;
  }

  return new Response("Socket.IO server is running", { status: 200 });
}

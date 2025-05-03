import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Game, GameEvent, GameState, Player } from '../types/next';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socketio',
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('error', (error: { message: string }) => {
      setError(error.message);
    });

    socketInstance.on('playerJoined', (state: GameState) => {
      setGameState(state);
    });

    socketInstance.on('playerLeft', (state: GameState) => {
      setGameState(state);
    });

    socketInstance.on('gameStarted', (state: GameState) => {
      setGameState(state);
    });

    socketInstance.on('correctGuess', (state: GameState) => {
      setGameState(state);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createGame = (playerName: string) => {
    if (!socket) return;
    socket.emit('createGame', { playerName });
  };

  const joinGame = (gameId: string, playerName: string) => {
    if (!socket) return;
    socket.emit('joinGame', { gameId, playerName });
  };

  const startGame = (gameId: string) => {
    if (!socket) return;
    socket.emit('startGame', { gameId });
  };

  const makeGuess = (gameId: string, guess: string) => {
    if (!socket) return;
    socket.emit('guess', { gameId, guess });
  };

  return {
    socket,
    isConnected,
    error,
    gameState,
    createGame,
    joinGame,
    startGame,
    makeGuess,
  };
} 
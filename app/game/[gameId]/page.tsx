"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Clock, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { Crown } from "lucide-react"

type Player = {
  id: string
  username: string
  isHost: boolean
}

type GameState = {
  phase: "countdown" | "word-reveal" | "clue-giving" | "voting" | "results"
  word?: string
  isNoNothingAssBitch: boolean
  currentTurn?: string
  countdown?: number
  clues?: Record<string, string>
  votes?: Record<string, string>
  noNothingAssBitchId?: string
  winner?: "normal" | "imposter"
  round?: number
  maxRounds?: number
  currentWord?: string
  isStarted?: boolean
}

interface PageProps {
  params: {
    gameId: string
  }
}

export default function Game({ params }: PageProps) {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameState, setGameState] = useState<GameState>({
    phase: "countdown",
    isNoNothingAssBitch: false
  })
  const [playerInfo, setPlayerInfo] = useState<any>(null)
  const [myClue, setMyClue] = useState("")
  const [selectedVote, setSelectedVote] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Get player info from session storage
    const storedPlayerInfo = sessionStorage.getItem("playerInfo")
    if (!storedPlayerInfo) {
      router.push("/")
      return
    }

    const parsedPlayerInfo = JSON.parse(storedPlayerInfo)
    if (parsedPlayerInfo.gameId !== params.gameId) {
      router.push("/")
      return
    }

    setPlayerInfo(parsedPlayerInfo)

    // Connect to Socket.io server
    const socketInstance = io({
      path: "/api/socketio",
    })

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.io server")

      // Join the game room
      socketInstance.emit("joinGame", {
        gameId: params.gameId,
        username: parsedPlayerInfo.username,
      })
    })

    socketInstance.on("roomPlayers", (roomPlayers: Player[]) => {
      setPlayers(roomPlayers)
    })

    socketInstance.on("gameState", (state: GameState) => {
      setGameState({
        ...state,
        isNoNothingAssBitch: state.isNoNothingAssBitch ?? false
      })
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setError("Failed to connect to game server. Please try again.")
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [params.gameId, router])

  const handleSubmitClue = () => {
    if (socket && myClue) {
      socket.emit("submitClue", {
        gameId: params.gameId,
        clue: myClue,
      })
      setMyClue("")
    }
  }

  const handleSubmitVote = () => {
    if (socket && selectedVote) {
      socket.emit("submitVote", {
        gameId: params.gameId,
        votedPlayerId: selectedVote,
      })
    }
  }

  const handlePlayAgain = () => {
    if (socket && playerInfo?.isHost) {
      socket.emit("resetGame", { gameId: params.gameId })
    } else {
      router.push(`/lobby/${params.gameId}`)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Render different game phases
  const renderGameContent = () => {
    switch (gameState.phase) {
      case "countdown":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">Get Ready!</h2>
            <div className="countdown mb-8">{gameState.countdown || 10}</div>
            <p className="text-gossip">The word will be revealed soon...</p>
          </div>
        )

      case "word-reveal":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-6">
              {gameState.isNoNothingAssBitch ? "You are the No Nothing Ass Bitch!" : "The Secret Word Is:"}
            </h2>

            {gameState.isNoNothingAssBitch ? (
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-fuchsia rounded-full flex items-center justify-center">
                  <Crown className="w-16 h-16 text-white" />
                </div>
                <p className="mt-6 text-lg">You don't know the word! Blend in and don't get caught.</p>
              </div>
            ) : (
              <div className="card bg-fuchsia/10 border-fuchsia mb-8">
                <p className="text-4xl font-serif text-fuchsia">{gameState.word}</p>
              </div>
            )}

            <p className="text-gossip">Everyone will take turns giving ONE-WORD clues</p>
          </div>
        )

      case "clue-giving":
        const currentPlayer = players.find((p) => p.id === gameState.currentTurn)
        const isMyTurn = currentPlayer?.id === socket?.id

        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif mb-4">
                {isMyTurn ? "Your Turn!" : `${currentPlayer?.username}'s Turn`}
              </h2>

              {isMyTurn ? (
                <div className="space-y-4">
                  <p className="text-lg">
                    Give a ONE-WORD clue for:
                    {!gameState.isNoNothingAssBitch && (
                      <span className="block text-2xl font-serif text-fuchsia mt-2">{gameState.word}</span>
                    )}
                  </p>

                  <input
                    type="text"
                    value={myClue}
                    onChange={(e) => {
                      // Only allow one word
                      const value = e.target.value.trim()
                      if (!value.includes(" ")) {
                        setMyClue(value)
                      }
                    }}
                    className="input-field text-center text-xl"
                    placeholder="Your one-word clue"
                    maxLength={20}
                  />

                  <button onClick={handleSubmitClue} className="btn-primary" disabled={!myClue}>
                    Submit Clue
                  </button>
                </div>
              ) : (
                <p className="text-lg">Waiting for {currentPlayer?.username} to give a clue...</p>
              )}
            </div>

            <div>
              <h3 className="text-sm text-gossip mb-2">Clues Given:</h3>
              <div className="space-y-2">
                {gameState.clues &&
                  Object.entries(gameState.clues).map(([playerId, clue]) => {
                    const player = players.find((p) => p.id === playerId)
                    return (
                      <div key={playerId} className="flex items-center justify-between p-3 bg-champagne rounded-lg">
                        <span>{player?.username}</span>
                        <span className="font-medium text-fuchsia">{clue}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )

      case "voting":
        return (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif mb-2">Voting Time</h2>
              <div className="flex items-center justify-center text-gossip mb-4">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-mono">{gameState.countdown}s</span>
              </div>
              <p className="text-lg mb-6">Who is the No Nothing Ass Bitch?</p>
            </div>

            <div className="space-y-3 mb-6">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                    selectedVote === player.id
                      ? "bg-fuchsia/20 border-2 border-fuchsia"
                      : "bg-champagne hover:bg-fuchsia/10"
                  }`}
                  onClick={() => player.id !== socket?.id && setSelectedVote(player.id)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center mr-3">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{player.username}</span>
                    {player.id === socket?.id && <span className="text-xs text-gossip ml-2">(You)</span>}
                  </div>

                  {selectedVote === player.id && <Check className="w-5 h-5 text-fuchsia" />}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitVote}
              className="btn-primary w-full"
              disabled={!selectedVote || Boolean(gameState.votes?.[socket?.id || ""])}
            >
              {gameState.votes?.[socket?.id || ""] ? "Vote Submitted" : "Submit Vote"}
            </button>
          </div>
        )

      case "results":
        const noNothingAssBitch = players.find((p) => p.id === gameState.noNothingAssBitchId)
        const voteResults: Record<string, number> = {}

        if (gameState.votes) {
          Object.values(gameState.votes).forEach((votedId) => {
            voteResults[votedId] = (voteResults[votedId] || 0) + 1
          })
        }

        // Sort players by votes received
        const sortedPlayers = [...players].sort((a, b) => {
          return (voteResults[b.id] || 0) - (voteResults[a.id] || 0)
        })

        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif mb-4">
                {gameState.winner === "normal" ? "The Group Wins!" : "The No Nothing Ass Bitch Wins!"}
              </h2>

              <div className="card bg-fuchsia/10 border-fuchsia mb-6">
                <p className="text-sm text-gossip mb-1">The secret word was:</p>
                <p className="text-3xl font-serif text-fuchsia">{gameState.word}</p>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-lilac flex items-center justify-center">
                  {noNothingAssBitch?.username.charAt(0).toUpperCase()}
                </div>
                <p className="text-lg">
                  <span className="font-medium">{noNothingAssBitch?.username}</span> was the No Nothing Ass Bitch!
                </p>
              </div>

              {gameState.winner === "normal" ? (
                <div className="flex items-center justify-center text-green-500 mb-4">
                  <ThumbsUp className="w-6 h-6 mr-2" />
                  <span>The group successfully identified the imposter!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-red-500 mb-4">
                  <ThumbsDown className="w-6 h-6 mr-2" />
                  <span>The No Nothing Ass Bitch fooled everyone!</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-sm text-gossip mb-2">Voting Results:</h3>
              <div className="space-y-2">
                {sortedPlayers.map((player) => {
                  const voteCount = voteResults[player.id] || 0
                  const isNoNothingAssBitch = player.id === gameState.noNothingAssBitchId

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isNoNothingAssBitch ? "bg-fuchsia/20 border border-fuchsia" : "bg-champagne"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center mr-3">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{player.username}</span>
                        {isNoNothingAssBitch && (
                          <span className="text-xs text-fuchsia ml-2">(No Nothing Ass Bitch)</span>
                        )}
                      </div>
                      <div className="font-mono">
                        {voteCount} {voteCount === 1 ? "vote" : "votes"}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button onClick={handlePlayAgain} className="btn-primary w-full">
              {playerInfo?.isHost ? "Play Again" : "Back to Lobby"}
            </button>
          </div>
        )

      default:
        return <div>Loading game...</div>
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full card">{renderGameContent()}</div>
    </main>
  )
}

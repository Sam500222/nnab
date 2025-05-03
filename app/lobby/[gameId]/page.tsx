"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Users, Crown, Play } from "lucide-react"

type Player = {
  id: string
  username: string
  isHost: boolean
}

type PlayerInfo = {
  gameId: string
  username: string
  isHost: boolean
}

export default function Lobby({ params }: { params: { gameId: string } }) {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Get player info from session storage
    const storedPlayerInfo = sessionStorage.getItem("playerInfo")
    if (!storedPlayerInfo) {
      router.push("/")
      return
    }

    const parsedPlayerInfo = JSON.parse(storedPlayerInfo) as PlayerInfo
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
      setIsConnecting(false)

      // Join the game room
      socketInstance.emit("joinRoom", {
        gameId: params.gameId,
        username: parsedPlayerInfo.username,
        isHost: parsedPlayerInfo.isHost,
      })
    })

    socketInstance.on("roomPlayers", (roomPlayers: Player[]) => {
      setPlayers(roomPlayers)
    })

    socketInstance.on("gameStarted", () => {
      router.push(`/game/${params.gameId}`)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setError("Failed to connect to game server. Please try again.")
      setIsConnecting(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [params.gameId, router])

  const handleStartGame = () => {
    if (socket && playerInfo?.isHost) {
      socket.emit("startGame", { gameId: params.gameId })
    }
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia mx-auto mb-4"></div>
          <p className="text-lg">Connecting to game...</p>
        </div>
      </div>
    )
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif">Waiting Room</h1>
          <div className="flex items-center text-gossip">
            <Users className="w-5 h-5 mr-2" />
            <span>{players.length}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm text-gossip mb-2">Room Password</div>
          <div className="font-mono text-lg bg-champagne p-3 rounded-lg text-center">
            {/* This would come from the API in a real implementation */}
            {params.gameId.substring(0, 6).toUpperCase()}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm text-gossip mb-2">Players</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-champagne rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center mr-3">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span>{player.username}</span>
                </div>
                {player.isHost && <Crown className="w-5 h-5 text-fuchsia" />}
              </div>
            ))}
          </div>
        </div>

        {playerInfo?.isHost ? (
          <button
            onClick={handleStartGame}
            className="btn-primary w-full flex items-center justify-center"
            disabled={players.length < 3}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
            {players.length < 3 && <span className="text-xs ml-2">(Need at least 3 players)</span>}
          </button>
        ) : (
          <div className="text-center text-gossip">Waiting for host to start the game...</div>
        )}
      </div>
    </main>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function JoinGame() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !username) return

    setIsJoining(true)
    setError("")

    try {
      const response = await fetch("/api/games/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          username,
        }),
      })

      if (response.ok) {
        const { gameId } = await response.json()
        // Save player info to session storage
        sessionStorage.setItem(
          "playerInfo",
          JSON.stringify({
            gameId,
            username,
            isHost: false,
          }),
        )

        router.push(`/lobby/${gameId}`)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to join game")
        setIsJoining(false)
      }
    } catch (error) {
      console.error("Error joining game:", error)
      setError("Something went wrong. Please try again.")
      setIsJoining(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center text-fuchsia mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>

        <h1 className="text-4xl font-serif mb-8">Join a Game</h1>

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2 font-medium">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="What should we call you?"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-medium">
              Room Password
            </label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter the room password"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}

          <button type="submit" className="btn-primary w-full" disabled={isJoining || !password || !username}>
            {isJoining ? "Joining..." : "Join Game"}
          </button>
        </form>
      </div>
    </main>
  )
}

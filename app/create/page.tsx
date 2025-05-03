"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const difficultyLevels = [
  { id: "baby", name: "ur just a baby", description: "Simple words, longer timer" },
  { id: "bigboy", name: "okay big boy pants", description: "Medium difficulty, standard timer" },
  { id: "queen", name: "now we're talking queen", description: "Challenging words, shorter timer" },
  { id: "crazy", name: "holy shit fuck your crazy", description: "Expert level, minimal time" },
]

export default function CreateGame() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [difficulty, setDifficulty] = useState("bigboy")
  const [username, setUsername] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !username) return

    setIsCreating(true)

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          difficulty,
          hostName: username,
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
            isHost: true,
          }),
        )

        router.push(`/lobby/${gameId}`)
      } else {
        console.error("Failed to create game")
        setIsCreating(false)
      }
    } catch (error) {
      console.error("Error creating game:", error)
      setIsCreating(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center text-fuchsia mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>

        <h1 className="text-4xl font-serif mb-8">Create a Game</h1>

        <form onSubmit={handleCreateGame} className="space-y-6">
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
              placeholder="Make it simple for your friends"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Difficulty</label>
            <div className="grid grid-cols-1 gap-3">
              {difficultyLevels.map((level) => (
                <div
                  key={level.id}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    difficulty === level.id ? "border-fuchsia bg-fuchsia/10" : "border-gossip hover:border-fuchsia/50"
                  }`}
                  onClick={() => setDifficulty(level.id)}
                >
                  <div className="font-medium">{level.name}</div>
                  <div className="text-sm text-gossip">{level.description}</div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isCreating || !password || !username}>
            {isCreating ? "Creating..." : "Create Game"}
          </button>
        </form>
      </div>
    </main>
  )
}

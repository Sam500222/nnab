import Link from "next/link"
import { Crown } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Crown className="w-16 h-16 text-fuchsia" />
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-lilac rounded-full animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-5xl font-serif mb-2">No Nothing Ass Bitch</h1>
        <p className="text-lg mb-12 text-gossip italic">"Fake it 'til you make it… or fuck off."</p>

        <div className="space-y-4">
          <Link href="/create" className="btn-primary block">
            Create Game
          </Link>
          <Link href="/join" className="btn-secondary block">
            Join Game
          </Link>
        </div>

        <p className="mt-12 text-sm text-gossip">No logins. No accounts. Just drama.</p>
      </div>
    </main>
  )
}

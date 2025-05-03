import { Metadata } from 'next'
import Game from './page'

export async function generateMetadata({ params }: { params: { gameId: string } }): Promise<Metadata> {
  return {
    title: `Game Room ${params.gameId}`,
    description: 'Join the game and have fun!',
  }
}

export default async function GamePage({ params }: { params: { gameId: string } }) {
  return <Game params={params} />
} 
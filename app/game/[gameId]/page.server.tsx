import { Metadata } from 'next'
import Game from './page'
import { GamePageMetadata } from './types'

export async function generateMetadata({ params }: GamePageMetadata): Promise<Metadata> {
  return {
    title: `Game Room ${params.gameId}`,
    description: 'Join the game and have fun!',
  }
}

export default async function GamePage({ params }: GamePageMetadata) {
  return <Game params={params} />
} 
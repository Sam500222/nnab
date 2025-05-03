import { Metadata } from 'next'
import Game from './page'
import { GamePageProps } from './types'

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  return {
    title: `Game Room ${params.gameId}`,
    description: 'Join the game and have fun!',
  }
}

export default async function GamePage({ params }: GamePageProps) {
  return <Game params={params} />
} 
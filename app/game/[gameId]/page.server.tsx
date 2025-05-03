import { Metadata } from 'next'
import Game from './page'

type PageProps = {
  params: {
    gameId: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Game Room ${params.gameId}`,
    description: 'Join the game and have fun!',
  }
}

export default async function GamePage({ params }: PageProps) {
  return <Game params={params} />
} 
import { Metadata } from 'next'
import Game from './page'

interface Props {
  params: {
    gameId: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Game Room ${params.gameId}`,
    description: 'Join the game and have fun!',
  }
}

export default async function GamePage(props: Props) {
  return <Game {...props} />
} 
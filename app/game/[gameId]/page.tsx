import { Metadata } from 'next'
import GameClient from './GameClient'

type Props = {
  params: { gameId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Game ${params.gameId} | No Nothing Ass Bitch`,
    description: 'Join the game and find out who is the No Nothing Ass Bitch!',
  }
}

export default function Page({ params }: Props) {
  return <GameClient gameId={params.gameId} />
}

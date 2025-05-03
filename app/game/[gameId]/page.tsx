import GameClient from './GameClient'

export default function Page({ params }: { params: { gameId: string } }) {
  return <GameClient gameId={params.gameId} />
}

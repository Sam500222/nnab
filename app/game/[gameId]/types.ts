import { Metadata } from 'next'

export type GamePageProps = {
  params: {
    gameId: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export type GamePageMetadata = {
  params: {
    gameId: string
  }
} 
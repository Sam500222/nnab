import type { NextApiResponse } from "next"
import type { Server as ServerIO } from "socket.io"
import type { Server as NetServer } from "http"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

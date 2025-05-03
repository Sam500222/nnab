import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../types/next";
import { getRandomWord } from "../../lib/words";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Rest of your file...

// Make sure to use the imported ServerIO:
const io = new ServerIO(httpServer, {
  path: "/api/socketio",
  addTrailingSlash: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

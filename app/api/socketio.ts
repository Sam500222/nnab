const io = new ServerIO(httpServer, {
  path: "/api/socketio",
  addTrailingSlash: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

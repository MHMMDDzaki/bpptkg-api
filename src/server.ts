// d:\Dev\bpptkg-api\src\server.ts
import app from './app';
import dotenv from 'dotenv';
import http from 'http'; // Import modul http Node.js
import { Server as SocketIOServer } from 'socket.io'; // Import Server dari socket.io
import { configureSockets } from './socket'; // Kita akan membuat file ini

dotenv.config();

const HOST = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 3000;

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // TODO: Di produksi, ganti dengan URL Flutter app Anda, misal "http://localhost:YOUR_FLUTTER_PORT" atau domain produksi
    methods: ["GET", "POST"]
  }
});

configureSockets(io);

httpServer.listen(PORT, HOST, () => {
  console.log(`Server (HTTP dan WebSocket) berjalan di http://${HOST}:${PORT}`);
});
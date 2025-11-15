import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
// import app from './app';
import app from "./app";
import connectDB from './config/db';
import ChatMessage from './models/ChatMessage';
import { setupChatSocket } from './socket/chatSocket';
import { getDashboardStats } from './services/adminService';

const PORT = process.env.PORT || 4000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

setupChatSocket(io);

if (ChatMessage.watch) {
  const changeStream = ChatMessage.watch([], { fullDocument: 'updateLookup' });
  changeStream.on('change', async () => {
    try {
      const stats = await getDashboardStats();
      io.emit('dashboard_update', stats);
    } catch (err) {
      console.error('Failed to update dashboard stats', err);
    }
  });
  changeStream.on('error', (err) => console.error('ChangeStream error:', err));
}

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import { Server } from 'socket.io';
import { ChatService } from '../services/chatService';
import { moderateText } from '../services/moderationService';
import { getDashboardStats } from '../services/adminService';

const svc = new ChatService();

export const setupChatSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('authenticate', (userId: string) => {
      (socket as any).userId = userId;
      socket.emit('authenticated', { userId });
    });

    socket.on('join_conversation', (conversationId: string) => socket.join(conversationId));

    socket.on('send_message', async (data: any) => {
      try {
        if (!(socket as any).userId) return socket.emit('error', 'Not auth');
        const { conversationId, receiverId, text, targetLang } = data;
        const mod = moderateText(text);
        if (mod.flagged) return socket.emit('message_blocked', { reason: mod.reason });
        const msg = await svc.sendMessage((socket as any).userId, receiverId, conversationId || null, text, targetLang);
        io.to(msg.conversationId).emit('receive_message', msg);
        // emit dashboard update
        const stats = await getDashboardStats();
        io.emit('dashboard_update', stats);
      } catch (e: any) {
        socket.emit('error', e.message);
      }
    });

    socket.on('disconnect', () => console.log('socket disconnect', socket.id));
  });
};

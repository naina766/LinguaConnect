import { Router } from 'express';
import { createChat, getChats, sendMessage, endConversation, exportConversation } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const r = Router();
r.use(authMiddleware);
r.post('/', createChat);
r.get('/', getChats);
r.post('/message', sendMessage);
r.post('/end/:conversationId', endConversation);
r.get('/export/:conversationId', exportConversation);
export default r;

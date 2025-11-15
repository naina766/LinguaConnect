import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import { sendResponse } from '../utils/responseHandler';

const svc = new ChatService();

export const createChat = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;
    const out = await svc.createChat(senderId, receiverId);
    sendResponse(res, 200, 'OK', out);
  } catch (e: any) { sendResponse(res, 500, 'Create chat failed', { error: e.message }); }
};

export const getChats = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const out = await svc.getChats(userId);
    sendResponse(res, 200, 'OK', out);
  } catch (e: any) { sendResponse(res, 500, 'Get chats failed', { error: e.message }); }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, conversationId, text, targetLang } = req.body;
    if (!senderId || !receiverId || !text) {
      return sendResponse(res, 400, 'senderId, receiverId, and text are required');
    }
    const msg = await svc.sendMessage(senderId, receiverId, conversationId || null, text, targetLang);
    sendResponse(res, 200, 'Message sent', msg);
  } catch (e: any) { sendResponse(res, 500, 'Send failed', { error: e.message }); }
};

export const endConversation = async (req: Request, res: Response) => {
  try {
    await svc.endConversation(req.params.conversationId);
    sendResponse(res, 200, 'Ended');
  } catch (e: any) { sendResponse(res, 500, 'End failed', { error: e.message }); }
};

// export const exportConversation = async (req: Request, res: Response) => {
//   try {
//     const msgs = await svc.exportConversation(req.params.conversationId);
//     res.header('Content-Type', 'application/json');
//     res.attachment(`conversation_${req.params.conversationId}on`);
//     res.send(msgs);
//   } catch (e: any) { sendResponse(res, 500, 'Export failed', { error: e.message }); }
// };

export const exportConversation = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      return sendResponse(res, 400, "Conversation ID is required");
    }

    const msgs = await svc.exportConversation(conversationId);

    if (!msgs.length) {
      return sendResponse(res, 404, "No messages found for this conversation");
    }

    res.header("Content-Type", "application/json");
    res.attachment(`conversation_${conversationId}.json`);
    res.send(msgs);
  } catch (err: any) {
    sendResponse(res, 500, "Export failed", { error: err.message });
  }

// export const exportConversation = async (req: Request, res: Response) => {
//   try {
//     const { conversationId } = req.params;

//     if (!conversationId) {
//       return sendResponse(res, 400, "conversationId is required");
//     }

//     const msgs = await svc.exportConversation(conversationId);

//     res.header("Content-Type", "application/json");
//     res.attachment(`conversation_${conversationId}.json`);
//     res.send(msgs);
//   } catch (e: any) {
//     sendResponse(res, 500, "Export failed", { error: e.message });
//   }

};

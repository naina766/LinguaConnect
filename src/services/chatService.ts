import Conversation from "../models/Conversation";
import ChatMessage from "../models/ChatMessage";
import { translateText } from "./translateService";
import { detectLanguage, mapToNLLB } from "./detectService";
import { queryLingoModel } from "./lingoModelService";
export class ChatService {
  async createChat(senderId: string, receiverId: string) {
    const conv = await Conversation.create({
      participants: [senderId, receiverId],
      meta: { unreadCounts: { [senderId]: 0, [receiverId]: 0 } },
    });

    return { conversationId: conv._id.toString(), participants: conv.participants };
  }

  async getChats(userId: string) {
    const convs = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .lean();

    return convs.map((c: any) => ({
      ...c,
      unreadCount: c.meta?.unreadCounts?.[userId] || 0,
    }));
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    conversationId: string | null,
    text: string,
    targetLangIso?: string
  ) {
    let conv = conversationId ? await Conversation.findById(conversationId) : null;
    if (!conv) {
      conv = await Conversation.create({
        participants: [senderId, receiverId],
        meta: { unreadCounts: { [senderId]: 0, [receiverId]: 0 } },
      });
      conversationId = conv._id.toString();
    }

    const convId = conversationId!;
    const sourceLangIso = detectLanguage(text);
    let translatedText = text;

    // Lingo bot logic
    if (receiverId === "lingo-bot") {
      try {
        const botResp = await queryLingoModel(text, convId);
        translatedText = typeof botResp?.reply === "string" ? botResp.reply : text;

        if (targetLangIso && targetLangIso !== "en") {
          const t = await translateText(translatedText, mapToNLLB("en"), mapToNLLB(targetLangIso));
          translatedText = t.translated || "";
        }
      } catch (e) {
        console.error("Bot error", e);
        translatedText = text;
      }
    } else if (targetLangIso && targetLangIso !== sourceLangIso) {
      try {
        const t = await translateText(text, mapToNLLB(sourceLangIso), mapToNLLB(targetLangIso));
        translatedText = t.translated || "";
      } catch (e) {
        console.error("Translation error", e);
        translatedText = text;
      }
    }

    const msg = await ChatMessage.create({
      conversationId: convId,
      senderId,
      receiverId,
      text,
      translatedText,
      sourceLang: sourceLangIso,
      targetLang: targetLangIso || sourceLangIso,
      status: "active",
    });

    // Update conversation meta
    try {
      conv.meta = conv.meta || {};
      conv.meta.unreadCounts = conv.meta.unreadCounts || {};
      conv.meta.unreadCounts[receiverId] = (conv.meta.unreadCounts[receiverId] || 0) + 1;
      conv.lastMessage = { text, translatedText, senderId, createdAt: new Date() };
      await conv.save();
    } catch (e) {
      console.warn("Failed conv meta update", e);
    }

    return msg;
  }

  async endConversation(conversationId: string) {
    await ChatMessage.updateMany({ conversationId }, { status: "ended" });
    await Conversation.findByIdAndUpdate(conversationId, { "meta.closedAt": new Date() });
  }

  // async exportConversation(conversationId: string) {
  //   return ChatMessage.find({ conversationId }).sort({ createdAt: 1 }).lean();
  // }
async exportConversation(conversationId: string) {
    return ChatMessage.find({conversationId})
      .sort({ createdAt: 1 })
      .lean();
  }
//  async exportConversation(conversationId: string) {
//     if (!mongoose.Types.ObjectId.isValid(conversationId)) {
//       throw new Error("Invalid conversationId");
//     }

//     return ChatMessage.find({ conversationId }).sort({ createdAt: 1 }).lean();
//   }
  async resetUnread(conversationId: string, userId: string) {
    const conv = await Conversation.findById(conversationId);
    if (!conv) throw new Error("Conversation not found");

    conv.meta = conv.meta || {};
    conv.meta.unreadCounts = conv.meta.unreadCounts || {};
    conv.meta.unreadCounts[userId] = 0;
    await conv.save();
    return conv;
  }
}

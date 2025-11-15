import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  translatedText?: string;
  sourceLang: string;
  targetLang?: string;
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    translatedText: { type: String },
    sourceLang: { type: String, default: 'auto' },
    targetLang: { type: String, default: 'en' },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: string[];
  meta: {
    unreadCounts: Record<string, number>;
    closedAt?: Date;
  };
  lastMessage?: {
    text: string;
    translatedText?: string;
    senderId: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: { type: [String], required: true },
    meta: {
      type: Object,
      default: { unreadCounts: {} },
    },
    lastMessage: {
      text: { type: String },
      translatedText: { type: String },
      senderId: { type: String },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

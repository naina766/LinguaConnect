import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  title: string;
  content: string;
  category?: string;
  defaultLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  defaultLanguage: { type: String, default: 'en' },
}, { timestamps: true });

export default mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);

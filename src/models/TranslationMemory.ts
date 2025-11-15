import mongoose, { Schema, Document } from 'mongoose';

export interface ITranslationMemory extends Document {
  source: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<ITranslationMemory>({
  source: { type: String, required: true, index: true },
  translated: { type: String, required: true },
  sourceLang: { type: String, required: true },
  targetLang: { type: String, required: true },
  usageCount: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.models.TranslationMemory || mongoose.model<ITranslationMemory>('TranslationMemory', MemorySchema);

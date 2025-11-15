import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFAQTranslation extends Document {
  faqId: Types.ObjectId;
  language: string;
  translatedText: string;
  createdAt: Date;
  updatedAt: Date;
}

const FAQTranslationSchema = new Schema<IFAQTranslation>({
  faqId: { type: Schema.Types.ObjectId, ref: 'FAQ', required: true },
  language: { type: String, required: true },
  translatedText: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.FAQTranslation || mongoose.model<IFAQTranslation>('FAQTranslation', FAQTranslationSchema);

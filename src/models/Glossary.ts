import mongoose, { Schema, Document } from 'mongoose';

export interface IGlossary extends Document {
  sourceTerm: string;
  targetTerm: string;
  sourceLang: string;
  targetLang: string;
  createdAt: Date;
  updatedAt: Date;
}

const GlossarySchema = new Schema<IGlossary>({
  sourceTerm: { type: String, required: true },
  targetTerm: { type: String, required: true },
  sourceLang: { type: String, required: true },
  targetLang: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Glossary || mongoose.model<IGlossary>('Glossary', GlossarySchema);

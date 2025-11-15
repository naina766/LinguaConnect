import mongoose, { Schema, Document } from 'mongoose';

export interface ILanguage extends Document {
  code: string; // e.g. hi_IN
  name: string; // Hindi
  enabled: boolean;
}

const LanguageSchema = new Schema<ILanguage>({
  code: { type: String, required: true, unique: true },
  name: { type: String },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Language || mongoose.model<ILanguage>('Language', LanguageSchema);

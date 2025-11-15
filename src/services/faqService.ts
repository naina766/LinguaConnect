// src/services/faqService.ts
import FAQ from "../models/FAQ";
import FAQTranslation from "../models/FAQTranslation";
import Language from "../models/Language";
import {  mapToNLLB, detectLanguage } from "./detectService";
import { translateText } from "./translationService";
export const createFAQ = async (title: string, content: string, category?: string, language?: string) => {
  if (!title || !content) throw new Error("Title and content are required");

  const defaultLang = language || detectLanguage(content);
  const faq = await FAQ.create({ title, content, category, defaultLanguage: defaultLang });

  // Translate FAQ to all enabled languages
  const langs = await Language.find({ enabled: true });
  await Promise.all(
    langs.map(async (l) => {
      if (l.code === defaultLang) return;

      try {
        const t = await translateText(content, mapToNLLB(defaultLang), mapToNLLB(l.code));
        await FAQTranslation.create({
          faqId: faq._id,
          language: l.code,
          translatedText: t.translated,
        });
      } catch (e) {
        console.error(`Translation failed for ${l.code}:`, e);
      }
    })
  );

  return faq;
};

export const getFAQById = async (id: string, lang?: string) => {
  if (!id) throw new Error("FAQ id required");

  if (lang) {
    const tr = await FAQTranslation.findOne({ faqId: id, language: lang });
    if (tr) return tr;
  }

  const faq = await FAQ.findById(id);
  if (!faq) throw new Error("FAQ not found");
  return faq;
};

export const bulkUploadFAQs = async (faqs: { question: string; answer: string }[]) => {
  if (!faqs || faqs.length === 0) return { message: "No FAQs provided.", count: 0 };
  const inserted = await FAQ.insertMany(faqs);
  return { message: "FAQs uploaded successfully", count: inserted.length };
};

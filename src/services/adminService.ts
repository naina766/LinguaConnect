import ChatMessage from "../models/ChatMessage";
import Conversation from "../models/Conversation";
import FAQ from "../models/FAQ";
import FAQTranslation from "../models/FAQTranslation";
import Language from "../models/Language";
import { Parser } from "json2csv";
import NodeCache from "node-cache";
import { translateText } from "./translateService";
import { detectLanguage, mapToNLLB } from "./detectService";
// Cache stats for 30 seconds
const cache = new NodeCache({ stdTTL: 30 });

// ---------------------- DASHBOARD UTILS ----------------------

// Parse period string to milliseconds
const parsePeriod = (period: string): number => {
  switch (period) {
    case "24h": return 24 * 60 * 60 * 1000;
    case "7d": return 7 * 24 * 60 * 60 * 1000;
    case "30d": return 30 * 24 * 60 * 60 * 1000;
    case "90d": return 90 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
};

// Calculate average response time for messages
const calculateAvgResponseTime = async (start: Date, end: Date) => {
  const messages = await ChatMessage.find({ createdAt: { $gte: start, $lte: end } })
    .sort({ conversationId: 1, createdAt: 1 })
    .lean();

  const convMap: Record<string, Date[]> = {};
  messages.forEach(msg => {
    if (!convMap[msg.conversationId]) convMap[msg.conversationId] = [];
    convMap[msg.conversationId].push(new Date(msg.createdAt));
  });

  let totalDiff = 0;
  let totalPairs = 0;

  Object.values(convMap).forEach(times => {
    for (let i = 1; i < times.length; i++) {
      totalDiff += times[i].getTime() - times[i - 1].getTime();
      totalPairs++;
    }
  });

  return totalPairs > 0 ? totalDiff / totalPairs / 1000 : 0; // seconds
};

// ---------------------- DASHBOARD STATS ----------------------

export const getDashboardStats = async (period: string = "24h") => {
  const cached = cache.get(`dashboardStats_${period}`);
  if (cached) return cached;

  const now = new Date();
  const periodMs = parsePeriod(period);
  const prevPeriodStart = new Date(now.getTime() - 2 * periodMs);
  const prevPeriodEnd = new Date(now.getTime() - periodMs);
  const periodStart = new Date(now.getTime() - periodMs);

  // Current period
  const currentConversations = await ChatMessage.distinct("conversationId", { createdAt: { $gte: periodStart } });
  const currentActiveUsers = await ChatMessage.distinct("senderId", { createdAt: { $gte: periodStart } });
  const currentTopLanguagesAgg = await ChatMessage.aggregate([
    { $match: { createdAt: { $gte: periodStart } } },
    { $group: { _id: "$targetLang", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  const currentAvgResponseTime = await calculateAvgResponseTime(periodStart, now);

  // Previous period
  const prevConversations = await ChatMessage.distinct("conversationId", { createdAt: { $gte: prevPeriodStart, $lt: prevPeriodEnd } });
  const prevActiveUsers = await ChatMessage.distinct("senderId", { createdAt: { $gte: prevPeriodStart, $lt: prevPeriodEnd } });
  const prevTopLanguagesAgg = await ChatMessage.aggregate([
    { $match: { createdAt: { $gte: prevPeriodStart, $lt: prevPeriodEnd } } },
    { $group: { _id: "$targetLang", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  const prevAvgResponseTime = await calculateAvgResponseTime(prevPeriodStart, prevPeriodEnd);

  const calcChange = (current: number, prev: number) =>
    prev === 0 ? 0 : +(((current - prev) / prev) * 100).toFixed(1);

  const stats = {
    totalConversations: {
      value: currentConversations.length,
      change: calcChange(currentConversations.length, prevConversations.length)
    },
    activeUsers: {
      value: currentActiveUsers.length,
      change: calcChange(currentActiveUsers.length, prevActiveUsers.length)
    },
    topLanguagesUsed: {
      value: currentTopLanguagesAgg.length,
      change: calcChange(currentTopLanguagesAgg.length, prevTopLanguagesAgg.length)
    },
    avgResponseTime: {
      value: +currentAvgResponseTime.toFixed(2),
      change: +(currentAvgResponseTime - prevAvgResponseTime).toFixed(2)
    }
  };

  cache.set(`dashboardStats_${period}`, stats);
  return stats;
};

// ---------------------- LANGUAGE ----------------------

export const addLanguage = async (language: string) => {
  const exists = await Language.findOne({ code: language });
  if (exists) return { message: `Language '${language}' already exists.` };
  const newLang = await Language.create({ code: language });
  return {
    message: `Language '${language}' added successfully.`,
    language: newLang,
  };
};

// ---------------------- FAQ ----------------------

// / Upload single or bulk FAQs
export const uploadFAQs = async (faqs: any[]) => {
  if (!faqs || !faqs.length) return { message: "No FAQs provided.", count: 0 };

  const langs = await Language.find({ enabled: true });
  const insertedFAQs = [];

  for (const f of faqs) {
    // Map bulk format (question -> title, answer -> content)
    const title = f.title || f.question;
    const content = f.content || f.answer;
    if (!title || !content) continue;

    const defaultLang = f.language || detectLanguage(content);
    const faq = await FAQ.create({ title, content, category: f.category || "general", defaultLanguage: defaultLang });
    insertedFAQs.push(faq);

    // Translate FAQ to all enabled languages
    await Promise.all(langs.map(async l => {
      if (l.code === defaultLang) return;
      try {
        const t = await translateText(content, mapToNLLB(defaultLang), mapToNLLB(l.code));
        await FAQTranslation.create({ faqId: faq._id, language: l.code, translatedText: t.translated });
      } catch (e) {
        console.error(`Translation failed for ${l.code}`, e);
      }
    }));
  }

  return { message: "FAQs uploaded successfully", count: insertedFAQs.length, faqs: insertedFAQs };
};


// ---------------------- REPORTS ----------------------

export const getReports = async () => {
  const languageDistribution = await ChatMessage.aggregate([
    { $group: { _id: "$targetLang", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const activeUsers = await ChatMessage.distinct("senderId");
  const totalConversations = await ChatMessage.distinct("conversationId").then(c => c.length);

  return {
    totalConversations,
    activeUsersCount: activeUsers.length,
    languageDistribution: languageDistribution.map(l => ({ language: l._id, count: l.count })),
  };
};

export const getLanguageUsageStats = async () => {
  const languageStats = await ChatMessage.aggregate([
    { $group: { _id: "$targetLang", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return languageStats.map(stat => ({ language: stat._id, count: stat.count }));
};

export const getWeeklyActivityStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const stats = await ChatMessage.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  return stats.map(s => {
    const { year, month, day } = s._id;
    return {
      date: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
      count: s.count,
    };
  });
};

// ---------------------- EXPORT CSV ----------------------

export const exportReportsCSV = async () => {
  const reports = await getReports();
  const parser = new Parser();
  const csv = parser.parse(reports.languageDistribution);
  return csv;
};

// ---------------------- CACHE ----------------------
export const resetStatsCache = () => cache.flushAll();

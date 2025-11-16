import express from 'express';
import path from "path";
import bodyParser from 'body-parser';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import translationRoutes from './routes/translationRoutes';
import transcriptionRoutes from "./routes/transcriptionRoutes";
import audioRoutes from "./routes/audioRoutes";
import exportRoutes from "./routes/exportRoutes";
import faqRoutes from './routes/faqRoutes';
import chatBotRoutes from './routes/chatbotRoutes';

const app = express();

const allowedOrigins = [
  "https://linguaconnectfrontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

// CORS MIDDLEWARE FIX
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin || "")) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health route
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/translation', translationRoutes);
app.use("/api", transcriptionRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/export", exportRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chatbot', chatBotRoutes);

export default app;

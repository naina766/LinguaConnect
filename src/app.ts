import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import translationRoutes from './routes/translationRoutes';
import transcriptionRoutes from "./routes/transcriptionRoutes";
import audioRoutes from "./routes/audioRoutes";
import exportRoutes from "./routes/exportRoutes";
import path from "path";
import faqRoutes from './routes/faqRoutes'
import chatBotRoutes from './routes/chatbotRoutes'
const app = express();

const allowedOrigins = [
  "https://linguaconnectfrontend.vercel.app",
  "http://localhost:3000"
]

app.use(cors({
  origin: allowedOrigins, // your frontend
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/translation', translationRoutes);
app.use("/api", transcriptionRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/export", exportRoutes);
app.use('/api/faqs', faqRoutes)
app.use('/api/chatbot', chatBotRoutes)
export default app;

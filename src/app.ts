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
import cors from "cors";

const app = express();

// CORS CONFIG
const allowedOrigins = [
  "https://linguaconnectfrontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile/postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


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

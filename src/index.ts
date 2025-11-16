import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import connectDB from "./config/db";
import ChatMessage from "./models/ChatMessage";
import { setupChatSocket } from "./socket/chatSocket";
import { getDashboardStats } from "./services/adminService";

const PORT = process.env.PORT || 4000;

connectDB();

const server = http.createServer(app);

const allowedOrigins = [
  "https://linguaconnectfrontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Setup chat sockets
setupChatSocket(io);

// MongoDB Change Stream
if (ChatMessage.watch) {
  const changeStream = ChatMessage.watch([], { fullDocument: "updateLookup" });

  changeStream.on("change", async () => {
    try {
      const stats = await getDashboardStats();
      io.emit("dashboard_update", stats);
    } catch (err) {
      console.error("Failed to update dashboard stats", err);
    }
  });

  changeStream.on("error", (err) => console.error("ChangeStream error:", err));
}

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import { Socket } from "socket.io";

export interface ChatSocketData {
  userId?: string;
}

export interface ChatSocket extends Socket {
  data: ChatSocketData;
}

export interface SendMessageData {
  senderId: string;
  receiverId: string;
  text: string;
  targetLang: string;
}

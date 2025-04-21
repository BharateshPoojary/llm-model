import mongoose, { Schema, Document } from "mongoose";

export interface Message {
  sender: string;
  text: string;
  timestamp: Date;
}

const MessageSchema = new Schema<Message>({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
interface ChatItem {
  chatNumber: number;
  messages: Message[];
}

export interface Chat extends Document {
  chatId: string;
  useremail: string;
  ArrayOfChats: ChatItem[];
}

const ChatItemSchema = new Schema<ChatItem>({
  chatNumber: { type: Number },
  messages: [MessageSchema],
});

const ChatSchema = new Schema<Chat>(
  {
    chatId: { type: String, unique: true },
    useremail: { type: String, unique: true },
    ArrayOfChats: [ChatItemSchema],
  },
  { timestamps: true }
);

export const ChatModel =
  mongoose.models.Chat || mongoose.model<Chat>("Chat", ChatSchema);

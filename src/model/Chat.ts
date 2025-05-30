import mongoose, { Schema, Document } from "mongoose";

export interface Message {
  id: string;
  role: "assistant" | "user" | string;
  content: string;
}

const MessageSchema = new Schema<Message>({
  id: { type: String, unique: true },
  role: { type: String },
  content: { type: String },
});

export interface ChatItem {
  chatNumber: string;
  messages: Message[];
}
const ChatItemSchema = new Schema<ChatItem>({
  chatNumber: { type: String, unique: true },
  messages: [MessageSchema],
});
export interface Chat extends Document {
  chatId: string;
  useremail: string;
  ArrayOfChats: ChatItem[];
}

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

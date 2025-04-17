import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MessageSchema: Schema<Message> = new Schema({
  id: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "assistant"] },
  content: { type: String, required: true },
});

export interface Chat extends Document {
  chatId: string;
  useremail: string;
  messages: Message[];
}

const ChatSchema: Schema<Chat> = new Schema(
  {
    chatId: { type: String, unique: true },
    useremail: { type: String, unique: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export const ChatModel =
  mongoose.models.Chat || mongoose.model<Chat>("Chat", ChatSchema);

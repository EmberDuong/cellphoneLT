import { Schema } from "mongoose";
import { baseSchema, model, ref } from "./_base";

export interface IChatSession {
  _id: string;
  id: string;
  customerId?: string | null; // null for guests
  type: "customer" | "admin";
  status: "active" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = baseSchema({
  customerId: ref("Customer"),
  type: { type: String, required: true },
  status: { type: String, default: "active", required: true },
});
export const ChatSession = model<IChatSession>("ChatSession", chatSessionSchema, "chat_sessions");

export interface IChatMessage {
  _id: string;
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: any;
  toolResultId?: string | null;
  createdAt: Date;
}

const chatMessageSchema = baseSchema(
  {
    sessionId: ref("ChatSession", true),
    role: { type: String, required: true },
    content: { type: String, required: true },
    toolCalls: { type: Schema.Types.Mixed, default: null },
    toolResultId: { type: String, default: null },
  },
  { updatedAt: false }
);
export const ChatMessage = model<IChatMessage>("ChatMessage", chatMessageSchema, "chat_messages");

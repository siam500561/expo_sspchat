import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

interface ChatState {
  reply_message: string;
  message_for_update: string;
  message_for_update_id: Id<"messages">;
}

export const useChat = create<ChatState>((set) => ({
  reply_message: "",
  message_for_update: "",
  message_for_update_id: "" as any,
}));

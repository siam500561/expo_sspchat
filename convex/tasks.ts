import { api } from "./_generated/api";
import { action } from "./_generated/server";

type MessageContent = string | string[];

export const sendMessage = action(
  async (
    { runMutation },
    { message, username }: { message: MessageContent; username: string }
  ) => {
    if (Array.isArray(message)) {
      for (const text of message) {
        await runMutation(api.message.send, {
          format: "text",
          text: text,
          username: username,
        });
      }
    } else {
      await runMutation(api.message.send, {
        format: "text",
        text: message,
        username: username,
      });
    }
  }
);

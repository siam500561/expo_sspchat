import { api } from "./_generated/api";
import { action } from "./_generated/server";

type MessageContent = string | string[];

export const sendRandomDelayedMessage = action(
  async (
    { scheduler },
    {
      maxDelayMinutes,
      messages,
      username,
    }: { maxDelayMinutes: number; messages: MessageContent[]; username: string }
  ) => {
    // Generate a random delay between 0 and maxDelayMinutes
    const delayMinutes = Math.floor(Math.random() * (maxDelayMinutes + 1));
    const delayMs = delayMinutes * 60 * 1000;

    // Select a random message from the array
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Schedule the message(s) to be sent after the random delay
    await scheduler.runAfter(delayMs, api.tasks.sendMessage, {
      message: randomMessage,
      username: username,
    });

    console.log(
      `Message(s) scheduled to be sent after ${delayMinutes} minutes.`
    );
  }
);

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

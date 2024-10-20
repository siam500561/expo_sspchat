import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

const messages = ["Good morning 🌞", ["O medam 🥹", "Uthen nai 🥹"]];

crons.daily(
  "daily random message",
  { hourUTC: 5, minuteUTC: 0 }, // Every day at 5:00 AM UTC
  api.tasks.sendRandomDelayedMessage,
  {
    maxDelayMinutes: 30, // Maximum delay of 30 minutes
    messages,
    username: "Siam",
  }
);

export default crons;

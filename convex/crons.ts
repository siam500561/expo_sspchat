import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

const messages = ["Good morning 🌞", ["O medam 🥹", "Uthen nai 🥹"]];

// Bangladesh time (UTC+6)
const localHour = 5;
const localMinute = 32;
const utcOffset = 6; // Bangladesh is UTC+6

// Calculate the correct UTC time
const utcHour = (localHour - utcOffset + 24) % 24;

crons.daily(
  "daily message at 5:32 AM Bangladesh time",
  { hourUTC: utcHour, minuteUTC: localMinute },
  api.tasks.sendMessage,
  {
    message: messages[Math.floor(Math.random() * messages.length)],
    username: "Siam",
  }
);

export default crons;

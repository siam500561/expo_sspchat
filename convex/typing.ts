import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const typingUsers = await ctx.db.query("typing").collect();

    return typingUsers;
  },
});

export const set = mutation({
  args: {
    id: v.id("typing"),
    typing: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { typing: args.typing });
  },
});

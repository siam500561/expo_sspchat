import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const set = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("js7f0yb246yr5q043ydmnatxm972a43b" as Id<"expoToken">, {
      token: args.token,
    });
  },
});

export const get = query({
  args: {},
  handler: (ctx) => {
    return ctx.db.query("expoToken").unique();
  },
});

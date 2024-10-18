import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const set = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(
      "jx7b685b575xxp0xnz2xdcaj9s72wg8y" as Id<"sohana_typing">,
      {
        text: args.text,
      }
    );
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sohana_typing").unique();
  },
});

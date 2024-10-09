import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const onlineUsers = await ctx.db.query("online").collect();

    return {
      siam: onlineUsers.find((user) => user.username === "Siam"),
      sohana: onlineUsers.find((user) => user.username === "Sohana"),
    };
  },
});

export const set = mutation({
  args: {
    id: v.id("online"),
    online: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      online: args.online,
    });
  },
});

export const clear_presence = action({
  handler: async (ctx) => {
    const users = await ctx.runQuery(api.online.get);
    await Promise.all(
      [users.siam?._id, users.sohana?._id].map((id) => {
        ctx.runMutation(api.online.set, {
          id: id as Id<"online">,
          online: false,
        });
      })
    );
  },
});

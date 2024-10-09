import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const get_mobile = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("messages").order("desc").take(500);
  },
});

export const update = mutation({
  args: {
    _id: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, { text: args.text });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const send = mutation({
  args: {
    text: v.string(),
    username: v.string(),
    replyingMessage: v.optional(v.string()),
    format: v.union(v.literal("image"), v.literal("text")),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const imageUrl =
      args.format === "image"
        ? await ctx.storage.getUrl(args.imageId!)
        : undefined;
    return await ctx.db.insert("messages", {
      ...args,
      imageUrl: imageUrl as string | undefined,
    });
  },
});

export const remove = mutation({
  args: {
    _id: v.id("messages"),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (args.imageId) {
      await ctx.storage.delete(args.imageId);
    }
    return await ctx.db.delete(args._id);
  },
});

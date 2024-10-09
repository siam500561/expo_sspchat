import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    username: v.string(),
    imageId: v.optional(v.id("_storage")),
    format: v.union(v.literal("image"), v.literal("text")),
    replyingMessage: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }),
  online: defineTable({
    online: v.boolean(),
    username: v.string(),
  }),
  typing: defineTable({
    typing: v.boolean(),
    username: v.string(),
  }),
  expoToken: defineTable({
    token: v.string(),
  }),
});

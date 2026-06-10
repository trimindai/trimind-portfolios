import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const generateUploadUrl = mutation(async (ctx) => {
  await requireUser(ctx);
  return await ctx.storage.generateUploadUrl();
});

// Raster image types only. SVG is deliberately excluded: an uploaded
// image/svg+xml served inline from the storage origin can carry scripts,
// and nothing in the product needs SVG uploads.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await requireUser(ctx);
    const meta = await ctx.db.system.get(storageId);
    if (!meta) return null;
    if (!meta.contentType || !ALLOWED_IMAGE_TYPES.has(meta.contentType)) {
      throw new Error("Unsupported file type — upload a JPEG, PNG, or WebP image.");
    }
    return await ctx.storage.getUrl(storageId);
  },
});

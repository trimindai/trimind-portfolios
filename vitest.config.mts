import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    {
      // Mirror next.config.mjs's `asset/source` rule: import .hbs as raw text.
      name: "hbs-raw-source",
      transform(src, id) {
        if (id.endsWith(".hbs")) {
          return { code: `export default ${JSON.stringify(src)};`, map: null };
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@convex": resolve(__dirname, "convex"),
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

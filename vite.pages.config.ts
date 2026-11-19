import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const path = (projectPath: string) => fileURLToPath(new URL(projectPath, import.meta.url));

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/muutoksen-kartta/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/murros.functions", replacement: path("./src/lib/murros.pages.ts") },
      { find: "@", replacement: path("./src") },
    ],
  },
  build: { outDir: "dist-pages" },
});

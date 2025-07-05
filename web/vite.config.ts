import { defineConfig } from "rolldown-vite"
import path from "path"

export default defineConfig({
  build: {
    outDir: "../server/public"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
})

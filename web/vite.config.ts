import { defineConfig } from "rolldown-vite"
import tailwindcss from "@tailwindcss/vite"
import preact from '@preact/preset-vite'
import path from "path"

export default defineConfig({
  plugins: [
    tailwindcss(),
    preact(),
  ],
  build: {
    outDir: "../server/public"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    }
  }
})

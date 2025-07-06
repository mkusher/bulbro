import { defineConfig } from "rolldown-vite"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: "../server/public"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat', // Must be below test-utils
			'react/jsx-runtime': 'preact/jsx-runtime'
    }
  }
})

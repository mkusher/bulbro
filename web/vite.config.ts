import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "rolldown-vite";

export default defineConfig({
	plugins: [tailwindcss(), preact()],
	build: {
		outDir: "../server/public",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	appType: "spa",
});

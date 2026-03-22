import path from "node:path";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const backendHost =
	process
		.env
		.BACKEND_HOST ??
	"https://bulbro.lol";

export default defineConfig(
	{
		plugins:
			[
				tailwindcss(),
				preact(),
			],
		build:
			{
				target:
					[
						"es2022",
						"safari16",
					],
				minify:
					"terser",
				outDir:
					"../server/public",
				emptyOutDir: true,
			},
		resolve:
			{
				alias:
					{
						"@": path.resolve(
							__dirname,
							"src",
						),
					},
			},
		server:
			{
				proxy:
					{
						"/api":
							{
								target:
									backendHost,
								changeOrigin: true,
							},
						"/ws":
							{
								target:
									backendHost,
								changeOrigin: true,
								ws: true,
							},
					},
			},
		appType:
			"spa",
	},
);

import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

const backendHost =
	process.env.BACKEND_HOST ??
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
				outDir:
					"../server/public",
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
								target: backendHost,
								changeOrigin:
									true,
							},
						"/ws":
							{
								target: backendHost,
								changeOrigin:
									true,
								ws: true,
							},
					},
			},
		appType:
			"spa",
	},
);

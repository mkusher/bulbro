import type { StorybookConfig } from "@storybook/preact-vite";

import { join, dirname, resolve } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
	return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [],
	framework: {
		name: getAbsolutePath("@storybook/preact-vite"),
		options: {
		},
	},
	async viteFinal (config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return {
      ...config,
      plugins: [...config.plugins ?? [], tailwindcss()],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@": resolve(__dirname, "../src"),
          react: "preact/compat",
          "react-dom/test-utils": "preact/test-utils",
          "react-dom": "preact/compat", // Must be below test-utils
          "react/jsx-runtime": "preact/jsx-runtime",
        },
      },
    };
	},
};
export default config;

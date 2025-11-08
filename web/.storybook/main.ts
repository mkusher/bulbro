import type { StorybookConfig } from "@storybook/preact-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [],
	framework: {
		name: "@storybook/preact-vite",
		options: {},
	},
};
export default config;

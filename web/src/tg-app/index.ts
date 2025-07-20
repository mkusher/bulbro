import { logger } from "@/logger";
import { computed, signal } from "@preact/signals";

declare global {
	interface Window {
		Telegram: {
			WebApp: any;
		};
	}
}

export async function fetchWebApp() {
	await import("https://telegram.org/js/telegram-web-app.js?58" as any);

	const WebApp = window.Telegram.WebApp;

	if (!WebApp) {
		logger.error("Telegram web app was not loaded");
		return;
	}

	await WebApp.ready();
	await WebApp.expand();
  await WebApp.requestFullscreen();

	if (!WebApp.WebAppUser) {
		logger.error("Telegram web app user was not loaded");
		return;
	}

	tgUser.value = WebApp.WebAppUser;

	return WebApp;
}

export type TgUser = {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
};

export const tgUser = signal<TgUser>({ id: 0, first_name: "..." });

export const tgUserName = computed(() => `${tgUser.value.first_name}`);

export const isTgApp = computed(() => tgUser.value.id > 0);

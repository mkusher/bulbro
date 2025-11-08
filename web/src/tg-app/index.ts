import {
	computed,
	signal,
} from "@preact/signals";
import { type } from "arktype";
import { logger } from "@/logger";
import { joinLobby } from "@/network/currentLobby";
import {
	createUser,
	currentUser,
} from "@/network/currentUser";

declare global {
	interface Window {
		Telegram: {
			WebApp: any;
		};
	}
}

const getWebApp =
	() =>
		window
			.Telegram
			.WebApp;

export async function initWebApp() {
	await import(
		"https://telegram.org/js/telegram-web-app.js?58" as any
	);

	const WebApp =
		getWebApp();

	if (
		!WebApp
	) {
		logger.error(
			"Telegram web app was not loaded",
		);
		return;
	}

	await WebApp.ready();
	await WebApp.expand();
	await WebApp.disableVerticalSwipes();

	const initData =
		WebApp.initDataUnsafe;

	if (
		!initData.user
	) {
		logger.error(
			"Telegram web app user was not loaded",
		);
		return;
	}

	tgUser.value =
		initData.user;

	currentUser.value =
		{
			...currentUser.value,
			username:
				tgUserName.value,
		};

	await createUser();

	const command =
		await parseStartApp(
			initData.start_param,
		);

	return command;
}

const joinLobbyCommand =
	type(
		{
			type: "'joinlobby'",
			lobbyId:
				"string",
		},
	);
async function parseStartApp(
	startParamRaw?: string,
) {
	try {
		const param =
			JSON.parse(
				window.atob(
					startParamRaw ??
						"",
				),
			);
		const command =
			joinLobbyCommand(
				param,
			);
		if (
			command instanceof
			type.errors
		) {
			return;
		}

		return command;
	} catch (err) {
		logger.warn(
			{
				err,
			},
			"Unable to parse tg start app params",
		);
		return;
	}
}

export type TgUser =
	{
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		photo_url?: string;
	};

export const tgUser =
	signal<TgUser>(
		{
			id: 0,
			first_name:
				"...",
		},
	);

export const tgUserName =
	computed(
		() =>
			`${tgUser.value.first_name}`,
	);

export const isTgApp =
	computed(
		() =>
			tgUser
				.value
				.id >
			0,
	);

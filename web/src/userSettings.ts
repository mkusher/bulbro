import {
	computed,
	effect,
	signal,
} from "@preact/signals";
import type { Locale } from "@/i18n";

export type UserSettings =
	{
		locale: Locale | null;
		audio: {
			enabled: boolean;
			bgmEnabled: boolean;
			effectsVolume: number;
			bgmVolume: number;
		};
	};

const STORAGE_KEY =
	"userSettings";

const defaultSettings: UserSettings =
	{
		locale:
			null,
		audio:
			{
				enabled: true,
				bgmEnabled: true,
				effectsVolume: 0.75,
				bgmVolume: 0.5,
			},
	};

function loadFromStorage(): UserSettings {
	try {
		const stored =
			localStorage.getItem(
				STORAGE_KEY,
			);
		if (
			stored
		) {
			const parsed =
				JSON.parse(
					stored,
				) as Partial<UserSettings>;
			return {
				locale:
					parsed.locale ??
					defaultSettings.locale,
				audio:
					{
						enabled:
							parsed
								.audio
								?.enabled ??
							defaultSettings
								.audio
								.enabled,
						bgmEnabled:
							parsed
								.audio
								?.bgmEnabled ??
							defaultSettings
								.audio
								.bgmEnabled,
						effectsVolume:
							parsed
								.audio
								?.effectsVolume ??
							defaultSettings
								.audio
								.effectsVolume,
						bgmVolume:
							parsed
								.audio
								?.bgmVolume ??
							defaultSettings
								.audio
								.bgmVolume,
					},
			};
		}
	} catch {
		console.warn(
			"Failed to load user settings from localStorage",
		);
	}
	return defaultSettings;
}

function saveToStorage(
	settings: UserSettings,
): void {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(
				settings,
			),
		);
	} catch {
		console.warn(
			"Failed to save user settings to localStorage",
		);
	}
}

export const userSettings =
	signal<UserSettings>(
		loadFromStorage(),
	);

effect(
	() => {
		saveToStorage(
			userSettings.value,
		);
	},
);

export function updateLocale(
	locale: Locale,
): void {
	userSettings.value =
		{
			...userSettings.value,
			locale,
		};
}

export function updateAudioEnabled(
	enabled: boolean,
): void {
	userSettings.value =
		{
			...userSettings.value,
			audio:
				{
					...userSettings
						.value
						.audio,
					enabled,
				},
		};
}

export function updateBgmEnabled(
	enabled: boolean,
): void {
	userSettings.value =
		{
			...userSettings.value,
			audio:
				{
					...userSettings
						.value
						.audio,
					bgmEnabled:
						enabled,
				},
		};
}

export function updateEffectsVolume(
	volume: number,
): void {
	userSettings.value =
		{
			...userSettings.value,
			audio:
				{
					...userSettings
						.value
						.audio,
					effectsVolume:
						volume,
				},
		};
}

export function updateBgmVolume(
	volume: number,
): void {
	userSettings.value =
		{
			...userSettings.value,
			audio:
				{
					...userSettings
						.value
						.audio,
					bgmVolume:
						volume,
				},
		};
}

export const audioEnabled =
	computed(
		() =>
			userSettings
				.value
				.audio
				.enabled,
	);
export const bgmEnabled =
	computed(
		() =>
			userSettings
				.value
				.audio
				.bgmEnabled,
	);
export const effectsVolume =
	computed(
		() =>
			userSettings
				.value
				.audio
				.effectsVolume,
	);
export const bgmVolume =
	computed(
		() =>
			userSettings
				.value
				.audio
				.bgmVolume,
	);

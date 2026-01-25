import {
	computed,
	signal,
} from "@preact/signals";

// User preferences
export const audioEnabled =
	signal(
		true,
	);

// Background music toggle (independent of master)
export const bgmEnabled =
	signal(
		true,
	);

// Volume controls (0.0 - 1.0)
export const effectsVolume =
	signal(
		0.7,
	);
export const bgmVolume =
	signal(
		0.5,
	);

// Engine state signals
export const isAudioEngineInitialized =
	signal(
		false,
	);
export const isBgmPlaying =
	signal(
		false,
	);

// Computed: effective volumes (respects master toggle)
export const effectiveEffectsVolume =
	computed(
		() =>
			audioEnabled.value
				? effectsVolume.value
				: 0,
	);

export const effectiveBgmVolume =
	computed(
		() =>
			audioEnabled.value &&
			bgmEnabled.value
				? bgmVolume.value
				: 0,
	);

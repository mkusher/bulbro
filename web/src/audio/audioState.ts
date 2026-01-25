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
		0.5,
	);
export const bgmVolume =
	signal(
		0.35,
	);

// BGM volume modifier for game state (1.0 = full, 0.8 = reduced for menus)
const bgmVolumeModifier =
	signal(
		0.8,
	);

/**
 * Set BGM to full volume (for in-game)
 */
export function setFullBgmVolume(): void {
	bgmVolumeModifier.value = 1;
}

/**
 * Set BGM to quiet volume (for menus/setup screens)
 */
export function setQuietBgmVolume(): void {
	bgmVolumeModifier.value = 0.1;
}

// Engine state signals
export const isAudioEngineInitialized =
	signal(
		false,
	);
export const isBgmPlaying =
	signal(
		false,
	);

// Computed: effective volumes (respects master toggle and modifier)
export const effectiveEffectsVolume =
	computed(
		() =>
			audioEnabled.value
				? effectsVolume.value
				: 0,
	);

export const effectiveBgmVolume =
	computed(
		() => {
			if (
				!audioEnabled.value ||
				!bgmEnabled.value
			) {
				return 0;
			}
			return (
				bgmVolume.value *
				bgmVolumeModifier.value
			);
		},
	);

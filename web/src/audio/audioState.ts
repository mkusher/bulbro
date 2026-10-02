import {
	computed,
	signal,
} from "@preact/signals";
import {
	audioEnabled,
	bgmEnabled,
	bgmVolume,
	effectsVolume,
} from "@/userSettings";

export {
	audioEnabled,
	bgmEnabled,
	bgmVolume,
	effectsVolume,
};

export const isAudioEngineInitialized =
	signal(
		false,
	);
export const isBgmPlaying =
	signal(
		false,
	);
const bgmVolumeModifier =
	signal(
		0.8,
	);
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

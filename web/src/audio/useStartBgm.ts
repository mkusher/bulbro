import { useEffect } from "preact/hooks";
import { audioEngine } from "./AudioEngine";
import {
	bgmEnabled,
	setQuietBgmVolume,
} from "./audioState";

/**
 * Hook to initialize audio engine and start BGM playback.
 * Should be used in setup screens to start background music.
 */
export function useStartBgm(): void {
	useEffect(() => {
		const initAudio =
			async () => {
				await audioEngine.init();
				await audioEngine.resume();
				setQuietBgmVolume();
				if (
					bgmEnabled.value
				) {
					audioEngine.playBgm();
				}
			};
		initAudio();
	}, []);
}

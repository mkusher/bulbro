import { effect } from "@preact/signals";
import type { SoundName } from "@/AudioAssets";
import {
	type AudioBufferMap,
	preloadAllAudio,
} from "@/audio/audioPreloader";
import {
	effectiveBgmVolume,
	effectiveEffectsVolume,
	isAudioEngineInitialized,
	isBgmPlaying,
} from "@/audio/audioState";

/**
 * Audio Engine using Web Audio API
 *
 * Handles playback of sound effects and background music with
 * reactive volume control via signals.
 */
class AudioEngine {
	#context: AudioContext | null =
		null;
	#buffers: AudioBufferMap =
		new Map();

	// Gain nodes for volume control
	#effectsGain: GainNode | null =
		null;
	#bgmGain: GainNode | null =
		null;

	// BGM state
	#bgmSource: AudioBufferSourceNode | null =
		null;
	#bgmStartTime = 0;
	#bgmOffset = 0;

	#initPromise: Promise<void> | null =
		null;

	/**
	 * Initialize the audio engine.
	 * Must be called after user interaction due to browser autoplay policies.
	 */
	async init(): Promise<void> {
		if (
			isAudioEngineInitialized.value
		)
			return;
		if (
			this
				.#initPromise
		)
			return this
				.#initPromise;

		this.#initPromise =
			this.#doInit();
		return this
			.#initPromise;
	}

	async #doInit(): Promise<void> {
		// Create audio context
		this.#context =
			new AudioContext();

		// Create gain nodes for independent volume control
		this.#effectsGain =
			this.#context.createGain();
		this.#effectsGain.connect(
			this
				.#context
				.destination,
		);

		this.#bgmGain =
			this.#context.createGain();
		this.#bgmGain.connect(
			this
				.#context
				.destination,
		);

		// Set initial volumes from signals
		this.#effectsGain.gain.value =
			effectiveEffectsVolume.value;
		this.#bgmGain.gain.value =
			effectiveBgmVolume.value;

		// Setup reactive volume control
		this.#setupVolumeReactivity();

		// Preload all audio files
		this.#buffers =
			await preloadAllAudio(
				this
					.#context,
			);

		isAudioEngineInitialized.value = true;
	}

	/**
	 * Setup signal effects to automatically update gain nodes when volume signals change
	 */
	#setupVolumeReactivity(): void {
		effect(
			() => {
				if (
					this
						.#effectsGain
				) {
					this.#effectsGain.gain.value =
						effectiveEffectsVolume.value;
				}
			},
		);

		effect(
			() => {
				if (
					this
						.#bgmGain
				) {
					this.#bgmGain.gain.value =
						effectiveBgmVolume.value;
				}
			},
		);
	}

	/**
	 * Resume audio context if suspended (required after user interaction)
	 */
	async resume(): Promise<void> {
		if (
			this
				.#context
				?.state ===
			"suspended"
		) {
			await this.#context.resume();
		}
	}

	/**
	 * Play a sound effect (one-shot, non-looping)
	 */
	playEffect(
		name: SoundName,
	): void {
		if (
			!this
				.#context ||
			!this
				.#effectsGain
		)
			return;

		const buffer =
			this.#buffers.get(
				name,
			);
		if (
			!buffer
		) {
			console.warn(
				`Audio buffer not found for: ${name}`,
			);
			return;
		}

		// Resume context if needed (handles autoplay policy)
		if (
			this
				.#context
				.state ===
			"suspended"
		) {
			this.#context.resume();
		}

		const source =
			this.#context.createBufferSource();
		source.buffer =
			buffer;
		source.connect(
			this
				.#effectsGain,
		);
		source.start();
	}

	/**
	 * Start playing background music (loops continuously)
	 */
	playBgm(): void {
		if (
			!this
				.#context ||
			!this
				.#bgmGain
		)
			return;

		// Stop existing BGM if playing
		this.stopBgm();

		const buffer =
			this.#buffers.get(
				"bgm",
			);
		if (
			!buffer
		) {
			console.warn(
				"BGM buffer not found",
			);
			return;
		}

		// Resume context if needed
		if (
			this
				.#context
				.state ===
			"suspended"
		) {
			this.#context.resume();
		}

		this.#bgmSource =
			this.#context.createBufferSource();
		this.#bgmSource.buffer =
			buffer;
		this.#bgmSource.loop = true;
		this.#bgmSource.connect(
			this
				.#bgmGain,
		);
		this.#bgmSource.start(
			0,
			this
				.#bgmOffset,
		);

		isBgmPlaying.value = true;
	}

	/**
	 * Stop background music
	 */
	stopBgm(): void {
		if (
			this
				.#bgmSource
		) {
			// Save current position for potential resume
			if (
				this
					.#context
			) {
				const buffer =
					this.#buffers.get(
						"bgm",
					);
				if (
					buffer
				) {
					const elapsed =
						this
							.#context
							.currentTime -
						this
							.#bgmStartTime;
					this.#bgmOffset =
						(this
							.#bgmOffset +
							elapsed) %
						buffer.duration;
				}
			}

			this.#bgmSource.stop();
			this.#bgmSource.disconnect();
			this.#bgmSource =
				null;
			isBgmPlaying.value = false;
		}
	}

	/**
	 * Check if BGM is currently playing (reactive signal)
	 */
	isBgmPlaying(): boolean {
		return isBgmPlaying.value;
	}

	/**
	 * Check if the engine is initialized (reactive signal)
	 */
	isInitialized(): boolean {
		return isAudioEngineInitialized.value;
	}

	/**
	 * Get the AudioContext (for advanced use cases)
	 */
	getContext(): AudioContext | null {
		return this
			.#context;
	}
}

// Singleton instance
export const audioEngine =
	new AudioEngine();

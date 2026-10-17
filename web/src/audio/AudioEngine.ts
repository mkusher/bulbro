import { effect } from "@preact/signals";
import {
	type SoundName,
	soundPitchVariation,
} from "@/AudioAssets";
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
	#isUnlocked = false;
	#needsRecovery = false;
	#recoveryPromise: Promise<void> | null =
		null;

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
	 * Preloading can run before interaction; playback is unlocked by a user gesture.
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
		try {
			return await this
				.#initPromise;
		} finally {
			this.#initPromise =
				null;
		}
	}

	async #doInit(): Promise<void> {
		// Use media playback so iOS Silent mode does not mute game audio.
		const {
			audioSession,
		} =
			navigator as Navigator & {
				audioSession?: {
					type: string;
				};
			};
		if (
			audioSession
		) {
			audioSession.type =
				"playback";
		}

		// Create audio context
		this.#context =
			new AudioContext();

		// Resume directly in user gestures, before fetching/decoding can lose
		// Safari’s user activation. Keep listening to recover after interruptions.
		for (const event of [
			"click",
			"touchend",
			"keydown",
		]) {
			document.addEventListener(
				event,
				this
					.#unlockFromInteraction,
				true,
			);
		}
		document.addEventListener(
			"visibilitychange",
			this
				.#resumeWhenVisible,
		);
		window.addEventListener(
			"pageshow",
			this
				.#resumeWhenVisible,
		);
		window.addEventListener(
			"focus",
			this
				.#resumeWhenVisible,
		);

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

		// Preload all audio files
		this.#buffers =
			await preloadAllAudio(
				this
					.#context,
			);

		// Setup reactive volume control
		this.#setupVolumeReactivity();
		// Set initial volumes from signals
		this.#effectsGain.gain.value =
			effectiveEffectsVolume.value;
		this.#bgmGain.gain.value =
			effectiveBgmVolume.value;

		isAudioEngineInitialized.value = true;
	}

	/**
	 * Setup signal effects to automatically update gain nodes when volume signals change
	 */
	#setupVolumeReactivity(): void {
		effect(
			() => {
				const value =
					effectiveEffectsVolume.value;
				if (
					this
						.#effectsGain
				) {
					this.#effectsGain.gain.value =
						value;
				}
			},
		);

		effect(
			() => {
				const value =
					effectiveBgmVolume.value;
				if (
					this
						.#bgmGain
				) {
					this.#bgmGain.gain.value =
						value;
				}
			},
		);
	}

	#unlockFromInteraction =
		(): void => {
			const context =
				this
					.#context;
			if (
				!context ||
				context.state ===
					"closed"
			)
				return;
			this.#resumeFromInteraction();
			if (
				this
					.#isUnlocked &&
				context.state ===
					"running"
			)
				return;

			// Start inside the gesture, without awaiting resume or asset decoding.
			// A newly created buffer contains silence and needs no network request.
			const source =
				context.createBufferSource();
			source.buffer =
				context.createBuffer(
					1,
					1,
					context.sampleRate,
				);
			source.connect(
				context.destination,
			);
			source.onended =
				() => {
					this.#isUnlocked = true;
					source.disconnect();
				};
			source.start(
				0,
			);
		};

	#resumeWhenVisible =
		(): void => {
			if (
				document.visibilityState ===
				"hidden"
			) {
				this.#needsRecovery = true;
				this.#isUnlocked = false;
				return;
			}
			if (
				document.visibilityState ===
				"visible"
			)
				this.#resumeFromInteraction();
		};

	#resumeFromInteraction =
		(): void => {
			void this.resume().catch(
				(
					error,
				) => {
					console.warn(
						"Failed to resume audio context",
						error,
					);
				},
			);
		};

	/** Recover audio after screen lock, including Safari's stalled running state. */
	async resume(): Promise<void> {
		const context =
			this
				.#context;
		if (
			!context ||
			context.state ===
				"closed" ||
			document.visibilityState ===
				"hidden"
		)
			return;

		if (
			this
				.#recoveryPromise
		) {
			// A foreground recovery may still be pending when a gesture arrives.
			// Keep resume inside that gesture so Safari receives user activation.
			await context.resume();
			return this
				.#recoveryPromise;
		}

		if (
			this
				.#needsRecovery ||
			(context.state as string) ===
				"interrupted"
		) {
			// resume() alone can leave Safari silent after locking the screen,
			// even when the context reports running. Keep the graph and BGM intact.
			this.#needsRecovery = true;
			this.#recoveryPromise =
				this.#recoverContext(
					context,
				);
			try {
				await this
					.#recoveryPromise;
			} finally {
				this.#recoveryPromise =
					null;
			}
		} else if (
			context.state !==
			"running"
		) {
			await context.resume();
		}
	}

	async #recoverContext(
		context: AudioContext,
	): Promise<void> {
		await context.suspend();
		if (
			document.visibilityState ===
			"hidden"
		)
			return;
		await context.resume();
		if (
			document.visibilityState ===
				"visible" &&
			context.state ===
				"running"
		) {
			this.#needsRecovery = false;
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

		this.#resumeFromInteraction();

		const source =
			this.#context.createBufferSource();
		source.buffer =
			buffer;
		const variation =
			soundPitchVariation[
				name
			] ??
			0;
		source.playbackRate.value =
			1 +
			(Math.random() *
				2 -
				1) *
				variation;
		source.connect(
			this
				.#effectsGain,
		);
		source.start();
	}

	/**
	 * Start playing background music (loops continuously)
	 */
	async playBgm(): Promise<void> {
		if (
			!this
				.#context ||
			!this
				.#bgmGain
		)
			await this.init();

		if (
			!this
				.#context ||
			!this
				.#bgmGain
		)
			return;

		if (
			isBgmPlaying.value
		)
			return;

		const buffer =
			this.#buffers.get(
				"bgm1",
			);
		if (
			!buffer
		) {
			console.warn(
				"BGM buffer not found",
			);
			return;
		}

		this.#resumeFromInteraction();

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
						"bgm1",
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

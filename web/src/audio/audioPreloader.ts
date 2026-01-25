import {
	type SoundName,
	soundUrls,
} from "@/AudioAssets";

export type AudioBufferMap =
	Map<
		SoundName,
		AudioBuffer
	>;

/**
 * Preloads all audio files and decodes them into AudioBuffers
 * @param context - The AudioContext to use for decoding
 * @returns A map of sound names to their decoded AudioBuffers
 */
export async function preloadAllAudio(
	context: AudioContext,
): Promise<AudioBufferMap> {
	const buffers: AudioBufferMap =
		new Map();

	const entries =
		Object.entries(
			soundUrls,
		) as [
			SoundName,
			string,
		][];

	await Promise.all(
		entries.map(
			async ([
				name,
				url,
			]) => {
				const response =
					await fetch(
						url,
					);
				const arrayBuffer =
					await response.arrayBuffer();
				const audioBuffer =
					await context.decodeAudioData(
						arrayBuffer,
					);
				buffers.set(
					name,
					audioBuffer,
				);
			},
		),
	);

	return buffers;
}

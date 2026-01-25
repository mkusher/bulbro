export const soundUrls =
	{
		gunshot:
			new URL(
				"../sounds/gunshot.mp3",
				import.meta
					.url,
			).toString(),
		kick: new URL(
			"../sounds/kick.mp3",
			import.meta
				.url,
		).toString(),
		laser:
			new URL(
				"../sounds/laser.mp3",
				import.meta
					.url,
			).toString(),
		explosion:
			new URL(
				"../sounds/explosion.mp3",
				import.meta
					.url,
			).toString(),
		bgm: new URL(
			"../sounds/bgm.mp3",
			import.meta
				.url,
		).toString(),
	} as const;

export type SoundName =
	keyof typeof soundUrls;

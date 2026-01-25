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
		collectCoins:
			new URL(
				"../sounds/collect-coins.mp3",
				import.meta
					.url,
			).toString(),
		scream:
			new URL(
				"../sounds/scream.mp3",
				import.meta
					.url,
			).toString(),
		ouch: new URL(
			"../sounds/ouch.mp3",
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

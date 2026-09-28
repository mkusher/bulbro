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
		enemyShot:
			new URL(
				"../sounds/enemy-shot.mp3",
				import.meta
					.url,
			).toString(),
		treeBreak:
			new URL(
				"../sounds/tree-break.mp3",
				import.meta
					.url,
			).toString(),
		chestOpen:
			new URL(
				"../sounds/chest-open.mp3",
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
		bgm1: new URL(
			"../sounds/neon_genesis_protocol.mp3",
			import.meta
				.url,
		).toString(),
		bgm2: new URL(
			"../sounds/neon_grid_runner.mp3",
			import.meta
				.url,
		).toString(),
	} as const;

export type SoundName =
	keyof typeof soundUrls;

/**
 * Max random pitch deviation applied on each playback of a sound effect,
 * so rapidly repeated effects don't sound identical.
 */
export const soundPitchVariation: Partial<
	Record<
		SoundName,
		number
	>
> =
	{
		gunshot: 0.07,
		kick: 0.1,
		scream: 0.12,
		laser: 0.05,
		enemyShot: 0.1,
		explosion: 0.08,
		treeBreak: 0.08,
		chestOpen: 0.04,
		ouch: 0.06,
		collectCoins: 0.05,
	};

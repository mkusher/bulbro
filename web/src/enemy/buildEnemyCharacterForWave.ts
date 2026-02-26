import type {
	EnemyCharacter,
	EnemyStats,
} from "./";

export function buildWaveStats(
	stats: EnemyStats,
	waveIncreaseStats: Partial<EnemyStats>,
	waveNumber: number,
): EnemyStats {
	const newStats: EnemyStats =
		{
			...stats,
		};

	for (const stat of Object.keys(
		waveIncreaseStats,
	) as (keyof EnemyStats)[]) {
		const increase =
			waveIncreaseStats[
				stat
			];
		if (
			increase !==
			undefined
		) {
			newStats[
				stat
			] =
				(stats[
					stat
				] ??
					0) +
				increase *
					waveNumber;
		}
	}

	return newStats;
}

export function buildEnemyCharacterForWave(
	enemy: EnemyCharacter,
	waveNumber: number,
): EnemyCharacter {
	return {
		...enemy,
		stats:
			buildWaveStats(
				enemy.stats,
				enemy.waveIncreaseStats,
				waveNumber,
			),
	};
}

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
					(waveNumber -
						1);
		}
	}

	return newStats;
}

/**
 * Enemies keep the linear wave growth up to this wave. After it the
 * endless factor multiplies their HP, damage and speed, like Brotato does
 * after wave 20. It matches the last hand-made wave.
 */
export const ENDLESS_START_WAVE = 30;

/**
 * Brotato's endless factor shifted to start after {@link ENDLESS_START_WAVE}:
 * 0.02 on the first endless wave, 1.1 after 10 and 6.3 after 20 waves.
 * See https://brotato.wiki.spellsandguns.com/Endless_Mode
 */
export function getEndlessFactor(
	waveNumber: number,
): number {
	const endlessWave =
		Math.max(
			0,
			waveNumber -
				ENDLESS_START_WAVE,
		);
	const multiplier =
		2 +
		Math.max(
			0,
			(endlessWave -
				15) *
				0.2,
		);
	return (
		((endlessWave *
			(endlessWave +
				1)) /
			2 /
			100) *
		multiplier
	);
}

const ENDLESS_HP_MULTIPLIER = 2.25;
const ENDLESS_SPEED_DIVIDER = 13.33;
const ENDLESS_MAX_SPEED_BONUS = 1.75;

export function buildEnemyCharacterForWave(
	enemy: EnemyCharacter,
	waveNumber: number,
): EnemyCharacter {
	const stats =
		buildWaveStats(
			enemy.stats,
			enemy.waveIncreaseStats,
			waveNumber,
		);
	const factor =
		getEndlessFactor(
			waveNumber,
		);
	if (
		factor ===
		0
	) {
		return {
			...enemy,
			stats,
		};
	}
	const speedMultiplier =
		1 +
		Math.min(
			ENDLESS_MAX_SPEED_BONUS,
			factor /
				ENDLESS_SPEED_DIVIDER,
		);
	return {
		...enemy,
		stats:
			{
				...stats,
				maxHp:
					stats.maxHp *
					(1 +
						factor *
							ENDLESS_HP_MULTIPLIER),
				damage:
					stats.damage *
					(1 +
						factor),
				speed:
					stats.speed *
					speedMultiplier,
			},
		speedRange:
			enemy.speedRange && {
				from:
					enemy
						.speedRange
						.from *
					speedMultiplier,
				to:
					enemy
						.speedRange
						.to *
					speedMultiplier,
			},
	};
}

import { signal } from "@preact/signals";
import type { WaveStats } from "@/shop/PrevWaveStats";
import type { GameEvent } from "@/game-events/GameEvents";

/**
 * Total game stats accumulated across all waves.
 */
export interface TotalGameStats {
	wavesCompleted: number;
	enemiesKilled: number;
	damageDealt: number;
	damageTaken: number;
	materialsCollected: number;
	totalSurvivalTime: number;
	materialsSpent: number;
	rerolls: number;
}

/**
 * Creates empty total game stats.
 */
function createEmptyGameStats(): TotalGameStats {
	return {
		wavesCompleted: 0,
		enemiesKilled: 0,
		damageDealt: 0,
		damageTaken: 0,
		materialsCollected: 0,
		totalSurvivalTime: 0,
		materialsSpent: 0,
		rerolls: 0,
	};
}

/**
 * Creates empty wave stats.
 */
function createEmptyWaveStats(
	wave: number,
): WaveStats {
	return {
		wave,
		enemiesKilled: 0,
		damageDealt: 0,
		damageTaken: 0,
		materialsCollected: 0,
		survivalTime: 0,
	};
}

/**
 * Signal holding the current total game stats.
 */
export const gameStats =
	signal<TotalGameStats>(
		createEmptyGameStats(),
	);

/**
 * Signal holding the current wave stats being tracked.
 */
export const waveStats =
	signal<WaveStats>(
		createEmptyWaveStats(
			1,
		),
	);

/**
 * Signal holding the last completed wave stats for display on failed/success screens.
 */
export const lastWaveStats =
	signal<
		| WaveStats
		| undefined
	>(
		undefined,
	);

/**
 * Resets all game stats to initial values. Call when starting a new game.
 */
export function resetGameStats(): void {
	gameStats.value =
		createEmptyGameStats();
	waveStats.value =
		createEmptyWaveStats(
			1,
		);
	lastWaveStats.value =
		undefined;
}

/**
 * Starts tracking a new wave. Call at the beginning of each wave.
 */
export function startWaveTracking(
	wave: number,
): void {
	waveStats.value =
		createEmptyWaveStats(
			wave,
		);
}

/**
 * Finalizes the current wave and accumulates stats into total game stats.
 * Call at the end of each wave.
 */
export function finalizeWaveStats(
	survivalTimeMs: number,
): void {
	const currentWaveStats =
		{
			...waveStats.value,
			survivalTime:
				Math.floor(
					survivalTimeMs /
						1000,
				),
		};
	lastWaveStats.value =
		currentWaveStats;

	const current =
		gameStats.value;
	gameStats.value =
		{
			...current,
			wavesCompleted:
				current.wavesCompleted +
				1,
			enemiesKilled:
				current.enemiesKilled +
				currentWaveStats.enemiesKilled,
			damageDealt:
				current.damageDealt +
				currentWaveStats.damageDealt,
			damageTaken:
				current.damageTaken +
				currentWaveStats.damageTaken,
			materialsCollected:
				current.materialsCollected +
				currentWaveStats.materialsCollected,
			totalSurvivalTime:
				current.totalSurvivalTime +
				currentWaveStats.survivalTime,
		};
}

/**
 * Records a shop reroll in the total game stats.
 */
export function recordReroll(
	cost: number,
): void {
	const current =
		gameStats.value;
	gameStats.value =
		{
			...current,
			materialsSpent:
				current.materialsSpent +
				cost,
			rerolls:
				current.rerolls +
				1,
		};
}

/**
 * Updates wave stats by processing game events directly.
 */
export function updateStatsFromEvents(
	events: GameEvent[],
): void {
	let enemiesKilled = 0;
	let damageDealt = 0;
	let damageTaken = 0;
	let materialsCollected = 0;

	for (const event of events) {
		switch (
			event.type
		) {
			case "enemyDied":
				enemiesKilled++;
				damageDealt +=
					event.damage;
				break;
			case "enemyReceivedHit":
				damageDealt +=
					event.damage;
				break;
			case "bulbroReceivedHit":
				damageTaken +=
					event.damage;
				break;
			case "bulbroDied":
				damageTaken +=
					event.damage;
				break;
			case "materialCollected":
				materialsCollected++;
				break;
			case "shopRerolled":
				recordReroll(
					event.cost,
				);
				break;
		}
	}

	if (
		enemiesKilled >
			0 ||
		damageDealt >
			0 ||
		damageTaken >
			0 ||
		materialsCollected >
			0
	) {
		const current =
			waveStats.value;
		waveStats.value =
			{
				...current,
				enemiesKilled:
					current.enemiesKilled +
					enemiesKilled,
				damageDealt:
					current.damageDealt +
					Math.round(
						damageDealt,
					),
				damageTaken:
					current.damageTaken +
					Math.round(
						damageTaken,
					),
				materialsCollected:
					current.materialsCollected +
					materialsCollected,
			};
	}
}

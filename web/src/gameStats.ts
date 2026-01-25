import { signal } from "@preact/signals";
import type { WaveStats } from "@/shop/PrevWaveStats";
import type { WaveState } from "@/waveState";

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
 * Updates wave stats by comparing state before and after a tick.
 * This approach catches all changes including those from internal event processing.
 */
export function updateStatsFromStateChange(
	prevState: WaveState,
	newState: WaveState,
): void {
	let enemiesKilled = 0;
	let damageDealt = 0;
	let damageTaken = 0;
	let materialsCollected = 0;

	// Count newly killed enemies
	for (const enemy of newState.enemies) {
		if (
			enemy.killedAt
		) {
			const prevEnemy =
				prevState.enemies.find(
					(
						e,
					) =>
						e.id ===
						enemy.id,
				);
			if (
				prevEnemy &&
				!prevEnemy.killedAt
			) {
				enemiesKilled++;
				// Damage dealt is the enemy's max HP (they're dead now)
				damageDealt +=
					prevEnemy.healthPoints;
			}
		} else {
			// Enemy still alive, check if they took damage
			const prevEnemy =
				prevState.enemies.find(
					(
						e,
					) =>
						e.id ===
						enemy.id,
				);
			if (
				prevEnemy &&
				prevEnemy.healthPoints >
					enemy.healthPoints
			) {
				damageDealt +=
					prevEnemy.healthPoints -
					enemy.healthPoints;
			}
		}
	}

	// Count damage taken by players
	for (const player of newState.players) {
		const prevPlayer =
			prevState.players.find(
				(
					p,
				) =>
					p.id ===
					player.id,
			);
		if (
			prevPlayer &&
			prevPlayer.healthPoints >
				player.healthPoints
		) {
			damageTaken +=
				prevPlayer.healthPoints -
				player.healthPoints;
		}
	}

	// Count materials collected (materials that disappeared from objects)
	const prevMaterialCount =
		prevState.objects.filter(
			(
				o,
			) =>
				o.type ===
				"material",
		).length;
	const newMaterialCount =
		newState.objects.filter(
			(
				o,
			) =>
				o.type ===
				"material",
		).length;
	// Materials are removed when collected, and new ones spawn when enemies die
	// We need to track the difference accounting for spawned materials
	const materialsSpawned =
		enemiesKilled; // One material per kill
	const materialsDelta =
		prevMaterialCount -
		newMaterialCount;
	if (
		materialsDelta >
		0
	) {
		// More materials were removed than appeared, so some were collected
		materialsCollected =
			materialsDelta +
			materialsSpawned;
	}

	// Only update if there are changes
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

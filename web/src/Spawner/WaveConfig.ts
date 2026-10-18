import type { EnemyCharacter } from "@/enemy";
import type { EnemyEvent } from "@/game-events/GameEvents";
import type { Range } from "@/geometry";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";

export type AmountRange =
	[
		number,
		number,
	];

/**
 * A repeating spawn of one enemy type during a wave,
 * similar to Brotato's wave groups.
 */
export interface SpawnGroup {
	enemy: EnemyCharacter;
	/** Second of the wave when the group spawns first */
	firstSpawn: number;
	/** Seconds between repeated spawns */
	interval: number;
	/** Second of the wave after which the group stops spawning */
	lastSpawn?: number;
	/** Base enemies per cluster; one of the two values is picked */
	amount: AmountRange;
	/** Distance from the spawn center */
	spawnRange: Range;
	/** Width of the cluster angle in radians */
	spread: number;
	/** Spawns a second cluster on the opposite side */
	mirrored: boolean;
}

export type WaveDefinition =
	SpawnGroup[];

export interface WaveSpawner {
	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[];
}

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

export interface WaveConfig {
	firstSpawn: number;
	interval: number;
	amount: AmountRange;
	spawnRange: Range;
}

export interface WaveSpawner {
	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[];
}

export const noSpawn: WaveConfig =
	{
		firstSpawn:
			Infinity,
		interval:
			Infinity,
		amount:
			[
				0,
				0,
			],
		spawnRange:
			{
				from: Infinity,
				to: Infinity,
			},
	};

import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { babyEnemy } from "../enemies-definitions";
import { hasSecondPassedAfter } from "./hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
	spawnCount,
} from "./spawnCluster";
import { shortRange } from "./spawnRanges";
import type { WaveSpawner } from "./WaveSpawner";

const secondForBaby =
	[
		0,
		3,
		6,
		9,
		12,
		15,
		18,
		21,
		24,
		27,
		30,
		33,
		36,
		39,
		42,
		45,
		48,
		51,
		54,
		57,
	];

export class SecondWaveSpawner
	implements
		WaveSpawner
{
	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[] {
		const passedSecond =
			hasSecondPassedAfter(
				now,
				deltaTime,
			);
		if (
			!passedSecond.hasSecondPassed
		) {
			return [];
		}

		if (
			secondForBaby.indexOf(
				passedSecond.currentSecond,
			) >
			-1
		) {
			const angle =
				randomAngle();
			return spawnCluster(
				[
					babyEnemy,
				],
				spawnCount(
					5,
					waveState,
				),
				shortRange,
				{
					from: angle,
					to:
						angle +
						Math.PI /
							4,
				},
				waveState,
			);
		}

		return [];
	}
}

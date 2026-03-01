import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import {
	aphidEnemy,
	babyEnemy,
} from "../enemies-definitions";
import { hasSecondPassedAfter } from "./hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
	spawnCount,
} from "./spawnCluster";
import {
	longRange,
	mediumRange,
	shortRange,
} from "./spawnRanges";
import type { WaveSpawner } from "./WaveSpawner";

const secondForBaby =
	[
		0,
		3,
		6,
		9,
		12,
		18,
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

export class FourthWaveSpawner
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

		const angle =
			randomAngle();
		const count =
			spawnCount(
				5,
				waveState,
			);

		if (
			secondForBaby.indexOf(
				passedSecond.currentSecond,
			) >
			-1
		) {
			return spawnCluster(
				[
					babyEnemy,
				],
				count,
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
		if (
			passedSecond.currentSecond ===
			15
		) {
			return spawnCluster(
				[
					babyEnemy,
					aphidEnemy,
				],
				count,
				mediumRange,
				{
					from: angle,
					to:
						angle +
						Math.PI /
							2,
				},
				waveState,
			);
		}
		if (
			passedSecond.currentSecond ===
			21
		) {
			return [
				...spawnCluster(
					[
						aphidEnemy,
					],
					count,
					longRange,
					{
						from: angle,
						to:
							angle +
							Math.PI /
								2,
					},
					waveState,
				),
				...spawnCluster(
					[
						babyEnemy,
					],
					count,
					shortRange,
					{
						from:
							angle +
							Math.PI,
						to:
							angle +
							(Math.PI *
								3) /
								2,
					},
					waveState,
				),
			];
		}

		return [];
	}
}

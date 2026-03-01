import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { babyEnemy } from "../../enemies-definitions";
import { hasSecondPassedAfter } from "../hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import {
	mediumRange,
	shortRange,
} from "../spawnRanges";
import type { WaveSpawner } from "../WaveSpawner";
import { range } from "@/geometry";

export class BabySpawner
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
			passedSecond.currentSecond %
				6 ===
			0
		) {
			const angle =
				randomAngle();
			return [
				...spawnCluster(
					[
						babyEnemy,
					],
					3,
					mediumRange,
					range(
						angle,
						Math.PI /
							4,
					),
					waveState,
				),
				...spawnCluster(
					[
						babyEnemy,
					],
					3,
					mediumRange,
					range(
						angle +
							Math.PI,
						Math.PI /
							4,
					),
					waveState,
				),
			];
		}

		if (
			passedSecond.currentSecond %
				3 ===
			0
		) {
			return spawnCluster(
				[
					babyEnemy,
				],
				5,
				shortRange,
				range(
					randomAngle(),
					Math.PI /
						4,
				),
				waveState,
			);
		}

		return [];
	}
}

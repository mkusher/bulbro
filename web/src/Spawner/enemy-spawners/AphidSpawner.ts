import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { aphidEnemy } from "../../enemies-definitions";
import { hasSecondPassedAfter } from "../hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { mediumRange } from "../spawnRanges";
import type { WaveSpawner } from "../WaveSpawner";
import { range } from "@/geometry";

export class AphidSpawner
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
			!passedSecond.hasSecondPassed ||
			passedSecond.currentSecond <
				1
		) {
			return [];
		}

		if (
			passedSecond.currentSecond %
				12 ===
			0
		) {
			const angle =
				randomAngle();
			return [
				...spawnCluster(
					[
						aphidEnemy,
					],
					2,
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
						aphidEnemy,
					],
					1,
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
			(passedSecond.currentSecond +
				1) %
				8 ===
			0
		) {
			return spawnCluster(
				[
					aphidEnemy,
				],
				2,
				mediumRange,
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

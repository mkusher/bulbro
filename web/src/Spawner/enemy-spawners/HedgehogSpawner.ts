import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { hedghehog } from "../../enemies-definitions";
import { hasSecondPassedAfter } from "../hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { mediumRange } from "../spawnRanges";
import type { WaveSpawner } from "../WaveSpawner";
import { range } from "@/geometry";

export class HedgehogSpawner
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
			(passedSecond.currentSecond -
				1) %
				5 ===
			0
		) {
			return spawnCluster(
				[
					hedghehog,
				],
				1,
				mediumRange,
				range(
					randomAngle(),
					Math.PI /
						2,
				),
				waveState,
			);
		}

		return [];
	}
}

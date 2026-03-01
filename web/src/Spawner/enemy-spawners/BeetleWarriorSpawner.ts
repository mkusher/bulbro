import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { beetleWarrior } from "../../enemies-definitions";
import { hasSecondPassedAfter } from "../hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { longRange } from "../spawnRanges";
import type { WaveSpawner } from "../WaveSpawner";
import { range } from "@/geometry";

export class BeetleWarriorSpawner
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
				6 ===
			0
		) {
			return spawnCluster(
				[
					beetleWarrior,
				],
				2,
				longRange,
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

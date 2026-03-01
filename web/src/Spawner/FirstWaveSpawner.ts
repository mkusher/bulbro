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

export class FirstWaveSpawner
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
				3 ===
			0
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

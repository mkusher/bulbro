import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { coloradoBeetle } from "../../enemies-definitions";
import { hasSecondPassedAfter } from "../hasSecondPassedAfter";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { shortRange } from "../spawnRanges";
import type { WaveSpawner } from "../WaveSpawner";
import {
	range,
	type Range,
} from "@/geometry";

export class ColoradoBeetleSpawner
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
				5 ===
			0
		) {
			const angle =
				randomAngle();
			return [
				...this.#spawnCluster(
					2,
					shortRange,
					range(
						angle,
						Math.PI /
							4,
					),
					waveState,
				),
				...this.#spawnCluster(
					1,
					shortRange,
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
				3 ===
			0
		) {
			return this.#spawnCluster(
				3,
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

	#spawnCluster(
		amount: number,
		range: Range,
		angle: Range,
		waveState: WaveState,
	) {
		return spawnCluster(
			[
				coloradoBeetle,
			],
			amount,
			range,
			angle,
			waveState,
		);
	}
}

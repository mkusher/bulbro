import type { EnemyEvent } from "@/game-events/GameEvents";
import { range } from "@/geometry";
import { pickRandom } from "@/random";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import type {
	SpawnGroup,
	WaveSpawner,
} from "../WaveConfig";
import {
	getWaveDefinition,
	isGroupSpawnSecond,
} from "../waves";

/**
 * Spawns enemies of the current wave's groups once per second.
 */
export class WaveGroupsSpawner
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

		return getWaveDefinition(
			waveState
				.round
				.wave,
		)
			.filter(
				(
					group,
				) =>
					isGroupSpawnSecond(
						group,
						passedSecond.currentSecond,
					),
			)
			.flatMap(
				(
					group,
				) =>
					spawnGroup(
						group,
						waveState,
					),
			);
	}
}

function spawnGroup(
	group: SpawnGroup,
	waveState: WaveState,
): EnemyEvent[] {
	const angle =
		randomAngle();
	const amount =
		pickRandom(
			group.amount,
		);
	const sides =
		group.mirrored
			? [
					angle,
					angle +
						Math.PI,
				]
			: [
					angle,
				];
	return sides.flatMap(
		(
			side,
		) =>
			spawnCluster(
				[
					group.enemy,
				],
				amount,
				group.spawnRange,
				range(
					side,
					group.spread,
				),
				waveState,
			),
	);
}

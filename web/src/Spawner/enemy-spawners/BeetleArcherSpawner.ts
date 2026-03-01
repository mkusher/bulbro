import type { EnemyEvent } from "@/game-events/GameEvents";
import { range } from "@/geometry";
import { pickRandom } from "@/random";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import { beetleArcher } from "../../enemies-definitions";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { mediumRange } from "../spawnRanges";
import type {
	WaveConfig,
	WaveSpawner,
} from "../WaveConfig";

const waveConfigs =
	new Map<
		number,
		WaveConfig
	>(
		[
			[
				8,
				{
					firstSpawn: 8,
					interval: 10,
					amount:
						[
							1,
							2,
						],
					spawnRange:
						mediumRange,
				},
			],
		],
	);

const getWaveConfig =
	(
		wave: number,
	):
		| WaveConfig
		| undefined => {
		return waveConfigs.get(
			wave,
		);
	};

export class BeetleArcherSpawner
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

		const wave =
			waveState
				.round
				.wave;
		const config =
			getWaveConfig(
				wave,
			);
		if (
			!config
		) {
			return [];
		}

		const currentSecond =
			passedSecond.currentSecond;

		if (
			currentSecond <
			config.firstSpawn
		) {
			return [];
		}

		const timeSinceFirstSpawn =
			currentSecond -
			config.firstSpawn;

		if (
			timeSinceFirstSpawn %
				config.interval ===
			0
		) {
			const amount =
				pickRandom(
					config.amount,
				);
			return spawnCluster(
				[
					beetleArcher,
				],
				amount,
				config.spawnRange,
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

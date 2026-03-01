import type { EnemyEvent } from "@/game-events/GameEvents";
import { range } from "@/geometry";
import { pickRandom } from "@/random";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import { beetleWarrior } from "../../enemies-definitions";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { longRange } from "../spawnRanges";
import {
	noSpawn,
	type WaveConfig,
	type WaveSpawner,
} from "../WaveConfig";

const waveConfigs =
	new Map<
		number,
		WaveConfig
	>(
		[
			[
				6,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							4,
							5,
						],
					spawnRange:
						longRange,
				},
			],
			[
				7,
				{
					firstSpawn: 10,
					interval: 5,
					amount:
						[
							6,
							6,
						],
					spawnRange:
						longRange,
				},
			],
			[
				8,
				noSpawn,
			],
			[
				9,
				{
					firstSpawn: 10,
					interval: 3,
					amount:
						[
							2,
							3,
						],
					spawnRange:
						longRange,
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
					beetleWarrior,
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

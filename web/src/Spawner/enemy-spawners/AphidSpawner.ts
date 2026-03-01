import type { EnemyEvent } from "@/game-events/GameEvents";
import { range } from "@/geometry";
import { pickRandom } from "@/random";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import { aphidEnemy } from "../../enemies-definitions";
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
				4,
				{
					firstSpawn: 1,
					interval: 5,
					amount:
						[
							2,
							2,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				5,
				{
					firstSpawn: 25,
					interval: 6,
					amount:
						[
							1,
							2,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				7,
				{
					firstSpawn: 30,
					interval: 5,
					amount:
						[
							2,
							3,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				8,
				{
					firstSpawn: 4,
					interval: 2,
					amount:
						[
							1,
							2,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				11,
				{
					firstSpawn: 25,
					interval: 3,
					amount:
						[
							2,
							3,
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
			const angle =
				randomAngle();
			const amount =
				pickRandom(
					config.amount,
				);
			return [
				...spawnCluster(
					[
						aphidEnemy,
					],
					amount,
					config.spawnRange,
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
					amount,
					config.spawnRange,
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

		return [];
	}
}

import type { EnemyEvent } from "@/game-events/GameEvents";
import type { Range } from "@/geometry";
import { range } from "@/geometry";
import { pickRandom } from "@/random";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import { babyEnemy } from "../../enemies-definitions";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import {
	longRange,
	mediumRange,
	shortRange,
} from "../spawnRanges";
import type {
	AmountRange,
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
				1,
				{
					firstSpawn: 1,
					interval: 3,
					amount:
						[
							4,
							5,
						],
					spawnRange:
						shortRange,
				},
			],
			[
				2,
				{
					firstSpawn: 10,
					interval: 5,
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
				3,
				{
					firstSpawn: 1,
					interval: 3,
					amount:
						[
							5,
							6,
						],
					spawnRange:
						longRange,
				},
			],
			[
				4,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							6,
							7,
						],
					spawnRange:
						shortRange,
				},
			],
			[
				5,
				{
					firstSpawn: 1,
					interval: 3,
					amount:
						[
							8,
							8,
						],
					spawnRange:
						longRange,
				},
			],
			[
				6,
				{
					firstSpawn: 20,
					interval: 4,
					amount:
						[
							5,
							6,
						],
					spawnRange:
						shortRange,
				},
			],
			[
				7,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							6,
							7,
						],
					spawnRange:
						longRange,
				},
			],
			[
				8,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							3,
							3,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				9,
				{
					firstSpawn:
						Infinity,
					interval: 1,
					amount:
						[
							3,
							3,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				10,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							8,
							9,
						],
					spawnRange:
						longRange,
				},
			],
			[
				11,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							3,
							4,
						],
					spawnRange:
						mediumRange,
				},
			],
			[
				12,
				{
					firstSpawn: 4,
					interval: 3,
					amount:
						[
							3,
							4,
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
	): WaveConfig => {
		const config =
			waveConfigs.get(
				wave,
			);
		if (
			config
		) {
			return config;
		}
		return waveConfigs.get(
			4,
		)!;
	};

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

		const wave =
			waveState
				.round
				.wave;
		const config =
			getWaveConfig(
				wave,
			);
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
				...this.#spawn(
					amount,
					angle,
					config.spawnRange,
					waveState,
				),
				...this.#spawn(
					amount,
					angle +
						Math.PI,
					config.spawnRange,
					waveState,
				),
			];
		}

		return [];
	}

	#spawn(
		amount: number,
		angle: number,
		spawnRange: Range,
		waveState: WaveState,
	) {
		return spawnCluster(
			[
				babyEnemy,
			],
			amount,
			spawnRange,
			range(
				angle,
				Math.PI /
					4,
			),
			waveState,
		);
	}
}

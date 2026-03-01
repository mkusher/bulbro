import type { EnemyEvent } from "@/game-events/GameEvents";
import {
	type Range,
	range,
} from "@/geometry";
import { pickRandom } from "@/random";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import { coloradoBeetle } from "../../enemies-definitions";
import {
	randomAngle,
	spawnCluster,
} from "../spawnCluster";
import { shortRange } from "../spawnRanges";
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
				2,
				{
					firstSpawn: 1,
					interval: 3,
					amount:
						[
							3,
							4,
						],
					spawnRange:
						shortRange,
				},
			],
			[
				3,
				{
					firstSpawn: 10,
					interval: 6,
					amount:
						[
							3,
							4,
						],
					spawnRange:
						shortRange,
				},
			],
			[
				5,
				{
					firstSpawn: 3,
					interval: 5,
					amount:
						[
							3,
							4,
						],
					spawnRange:
						shortRange,
				},
			],
			[
				6,
				{
					firstSpawn: 3,
					interval: 3,
					amount:
						[
							3,
							4,
						],
					spawnRange:
						shortRange,
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
				...this.#spawnCluster(
					amount,
					shortRange,
					range(
						angle,
						Math.PI /
							4,
					),
					waveState,
				),
				...this.#spawnCluster(
					amount,
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

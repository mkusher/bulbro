import type { Logger } from "pino";
import { v4 as uuidv4 } from "uuid";
import type { EnemyEvent } from "@/game-events/GameEvents";
import { shouldSpawnEnemy } from "@/game-formulas";
import {
	addition,
	type Point,
	type Position,
	type Range,
	zeroPoint,
} from "@/geometry";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import {
	allEnemies,
	aphidEnemy,
	babyEnemy,
} from "../enemies-definitions";
import type { EnemyCharacter } from ".";
import {
	type EnemyState,
	spawnEnemy,
} from "./EnemyState";

const hasSecondPassedAfter =
	(
		now: NowTime,
		deltaTime: DeltaTime,
	) =>
	(
		second: number,
	) =>
		now >=
			second *
				1000 &&
		now -
			deltaTime <
			second *
				1000;

export class EnemySpawner {
	#logger: Logger;
	constructor(
		logger: Logger,
	) {
		this.#logger =
			logger;
	}

	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[] {
		const currentWave =
			waveState
				.round
				.wave;
		const difficulty =
			waveState
				.round
				.difficulty;
		const hasSecondPassed =
			hasSecondPassedAfter(
				now,
				deltaTime,
			);
		const shortRange =
			{
				from: 200,
				to: 400,
			};
		const mediumRange =
			{
				from: 400,
				to: 600,
			};
		const longRange =
			{
				from: 600,
				to: 900,
			};
		if (
			hasSecondPassed(
				0,
			) ||
			hasSecondPassed(
				3,
			) ||
			hasSecondPassed(
				6,
			) ||
			hasSecondPassed(
				9,
			) ||
			hasSecondPassed(
				12,
			) ||
			hasSecondPassed(
				18,
			) ||
			hasSecondPassed(
				24,
			) ||
			hasSecondPassed(
				27,
			) ||
			hasSecondPassed(
				30,
			) ||
			hasSecondPassed(
				33,
			) ||
			hasSecondPassed(
				36,
			) ||
			hasSecondPassed(
				39,
			) ||
			hasSecondPassed(
				42,
			) ||
			hasSecondPassed(
				45,
			) ||
			hasSecondPassed(
				48,
			) ||
			hasSecondPassed(
				51,
			) ||
			hasSecondPassed(
				54,
			) ||
			hasSecondPassed(
				57,
			)
		) {
			const center =
				waveState
					.players[0]!
					.position;
			const numberOfEnemies =
				5 +
				difficulty;
			const angle =
				this.#randomInRange(
					0,
					Math.PI *
						2,
				);
			return this.#spawnCluster(
				[
					babyEnemy,
				],
				numberOfEnemies,
				shortRange,
				{
					from: angle,
					to:
						angle +
						Math.PI /
							4,
				},
				center,
			);
		} else if (
			hasSecondPassed(
				15,
			)
		) {
			const center =
				waveState
					.players[0]!
					.position;
			const numberOfEnemies =
				5 +
				difficulty;
			const angle =
				this.#randomInRange(
					0,
					Math.PI *
						2,
				);
			return this.#spawnCluster(
				[
					babyEnemy,
					aphidEnemy,
				],
				numberOfEnemies,
				mediumRange,
				{
					from: angle,
					to:
						angle +
						Math.PI /
							2,
				},
				center,
			);
		} else if (
			hasSecondPassed(
				21,
			)
		) {
			const center =
				waveState
					.players[0]!
					.position;
			const numberOfEnemies =
				5 +
				difficulty;
			const angle =
				this.#randomInRange(
					0,
					Math.PI *
						2,
				);
			return [
				...this.#spawnCluster(
					[
						aphidEnemy,
					],
					numberOfEnemies,
					longRange,
					{
						from: angle,
						to:
							angle +
							Math.PI /
								2,
					},
					center,
				),
				...this.#spawnCluster(
					[
						babyEnemy,
					],
					numberOfEnemies,
					shortRange,
					{
						from:
							angle +
							Math.PI,
						to:
							angle +
							(Math.PI *
								3) /
								2,
					},
					center,
				),
			];
		}

		return [];
	}

	#spawnCluster(
		enemiesToSpawn: EnemyCharacter[],
		amount: number,
		radius: Range,
		angle: Range,
		center: Position,
	) {
		return new Array(
			amount,
		)
			.fill(
				0,
			)
			.map(
				() => {
					const position =
						this.#randomPositionInRadius(
							radius,
							angle,
							center,
						);
					return this.#spawnEnemy(
						enemiesToSpawn,
						position,
					);
				},
			);
	}

	#spawnEnemy(
		enemiesToSpawn: EnemyCharacter[],
		position: Position,
	) {
		const id =
			uuidv4();
		const randomEnemy =
			this.#pickRandom(
				enemiesToSpawn,
			);
		const enemy: EnemyState =
			spawnEnemy(
				id,
				position,
				randomEnemy,
			);

		this.#logger.debug(
			{
				event:
					"spawnEnemy",
				id,
				position,
				enemy,
			},
			"spawning enemy",
		);

		return {
			type: "spawnEnemy" as const,
			enemy,
		};
	}

	#pickRandom<
		T,
	>(
		list: T[],
	) {
		return list[
			Math.floor(
				list.length *
					Math.random(),
			)
		]!;
	}

	#randomPositionInRadius(
		radius: Range,
		angle: Range,
		center: Point,
	) {
		const r =
			this.#randomInRange(
				radius.from,
				radius.to,
			);
		const a =
			this.#randomInRange(
				angle.from,
				angle.to,
			);
		return addition(
			center,
			{
				x:
					Math.cos(
						a,
					) *
					r,
				y:
					Math.sin(
						a,
					) *
					r,
			},
		);
	}

	#randomInRange(
		from: number,
		to: number,
	) {
		return (
			from +
			Math.random() *
				(to -
					from)
		);
	}
}

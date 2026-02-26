import type { Logger } from "pino";
import { v4 as uuidv4 } from "uuid";
import type { EnemyEvent } from "@/game-events/GameEvents";
import { shouldSpawnEnemy } from "@/game-formulas";
import {
	addition,
	type Point,
	type Position,
	type Range,
	type Size,
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
	buildEnemyCharacterForWave,
	ENEMY_SIZE,
} from ".";
import {
	type EnemyState,
	spawnEnemy,
} from "./EnemyState";

const hasSecondPassedAfter =
	(
		now: NowTime,
		deltaTime: DeltaTime,
	) => {
		const currentSecond =
			Math.floor(
				now /
					1000,
			);
		const previousSecond =
			Math.floor(
				(now -
					deltaTime) /
					1000,
			);
		const hasSecondPassed =
			currentSecond -
				previousSecond >
			0;
		return {
			hasSecondPassed,
			currentSecond,
		};
	};
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
		const passedSecond =
			hasSecondPassedAfter(
				now,
				deltaTime,
			);

		const secondForBaby =
			[
				0,
				3,
				6,
				9,
				12,
				18,
				24,
				27,
				30,
				33,
				36,
				39,
				42,
				45,
				48,
				51,
				54,
				57,
			];

		if (
			!passedSecond.hasSecondPassed
		) {
			return [];
		}

		if (
			secondForBaby.find(
				(
					second,
				) =>
					passedSecond.currentSecond ===
					second,
			) !==
			undefined
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
				this.#prepareEnemies(
					[
						babyEnemy,
					],
					waveState
						.round
						.wave,
				),
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
				waveState.mapSize,
			);
		} else if (
			passedSecond.currentSecond ===
			15
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
				this.#prepareEnemies(
					[
						babyEnemy,
						aphidEnemy,
					],
					waveState
						.round
						.wave,
				),
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
				waveState.mapSize,
			);
		} else if (
			passedSecond.currentSecond ===
			21
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
					this.#prepareEnemies(
						[
							aphidEnemy,
						],
						waveState
							.round
							.wave,
					),
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
					waveState.mapSize,
				),
				...this.#spawnCluster(
					this.#prepareEnemies(
						[
							babyEnemy,
						],
						waveState
							.round
							.wave,
					),
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
					waveState.mapSize,
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
		mapSize: Size,
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
							mapSize,
						);
					return this.#spawnEnemies(
						enemiesToSpawn,
						position,
					);
				},
			);
	}

	#spawnEnemies(
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
		mapSize: Size,
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
		const position =
			addition(
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
		// Clamp to map boundaries (accounting for enemy hitbox)
		const halfW =
			ENEMY_SIZE.width /
			2;
		const halfH =
			ENEMY_SIZE.height /
			2;
		return {
			x: Math.max(
				halfW,
				Math.min(
					mapSize.width -
						halfW,
					position.x,
				),
			),
			y: Math.max(
				halfH,
				Math.min(
					mapSize.height -
						halfH,
					position.y,
				),
			),
		};
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

	#prepareEnemies(
		enemies: EnemyCharacter[],
		waveNumber: number,
	) {
		return enemies.map(
			(
				e,
			) =>
				buildEnemyCharacterForWave(
					e,
					waveNumber,
				),
		);
	}
}

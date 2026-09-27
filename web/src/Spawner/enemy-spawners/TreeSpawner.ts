import { v4 as uuidv4 } from "uuid";
import {
	buildEnemyCharacterForWave,
	ENEMY_SIZE,
	spawnEnemy,
} from "@/enemy";
import type { EnemyEvent } from "@/game-events/GameEvents";
import {
	distance,
	type Position,
	type Size,
} from "@/geometry";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { hasSecondPassedAfter } from "@/time";
import type { WaveState } from "@/waveState";
import { tree } from "../../enemies-definitions";

/** Trees get a chance to spawn every N seconds, starting at N seconds */
export const TREE_SPAWN_INTERVAL = 10;
/** Chance for a single tree spawn attempt to succeed */
export const TREE_SPAWN_CHANCE = 0.33;
/** Trees are not spawned closer than this to any player */
export const TREE_MIN_PLAYER_DISTANCE = 300;
/** Margin from map borders where trees are not spawned */
const MAP_MARGIN = 100;
const MAX_POSITION_ATTEMPTS = 10;

type Random =
	() => number;

/**
 * Amount of trees to spawn during one spawn check.
 *
 * Brotato rolls `randInt(1, 2) + treeStat` attempts with 33% chance each.
 * To smooth out variance ("spawn smoother") the average of that
 * distribution is used instead, and the fractional part becomes
 * the probability of spawning one extra tree.
 */
export function treeSpawnAmount(
	treeStat: number,
	random: Random = Math.random,
): number {
	const averageAttempts =
		1.5 +
		Math.max(
			0,
			treeStat,
		);
	const average =
		averageAttempts *
		TREE_SPAWN_CHANCE;
	const guaranteed =
		Math.floor(
			average,
		);
	const extraChance =
		average -
		guaranteed;
	return (
		guaranteed +
		(random() <
		extraChance
			? 1
			: 0)
	);
}

export function isTreeSpawnSecond(
	second: number,
): boolean {
	return (
		second >=
			TREE_SPAWN_INTERVAL &&
		second %
			TREE_SPAWN_INTERVAL ===
			0
	);
}

/**
 * Spawns trees at random positions of the map with some chance
 * every {@link TREE_SPAWN_INTERVAL} seconds.
 */
export class TreeSpawner {
	#random: Random;

	constructor(
		random: Random = Math.random,
	) {
		this.#random =
			random;
	}

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
			!passedSecond.hasSecondPassed ||
			!isTreeSpawnSecond(
				passedSecond.currentSecond,
			)
		) {
			return [];
		}

		// TODO: add trees secondary stat to bulbros
		const treeStat = 0;
		const amount =
			treeSpawnAmount(
				treeStat,
				this
					.#random,
			);
		if (
			amount ===
			0
		) {
			return [];
		}

		const character =
			buildEnemyCharacterForWave(
				tree,
				waveState
					.round
					.wave,
			);
		return Array.from(
			{
				length:
					amount,
			},
			() => ({
				type: "spawnEnemy" as const,
				enemy:
					spawnEnemy(
						uuidv4(),
						this.#randomPosition(
							waveState,
						),
						character,
					),
			}),
		);
	}

	#randomPosition(
		waveState: WaveState,
	): Position {
		let position =
			this.#randomPositionInMap(
				waveState.mapSize,
			);
		for (
			let attempt = 1;
			attempt <
				MAX_POSITION_ATTEMPTS &&
			isTooCloseToPlayers(
				position,
				waveState,
			);
			attempt++
		) {
			position =
				this.#randomPositionInMap(
					waveState.mapSize,
				);
		}
		return position;
	}

	#randomPositionInMap(
		mapSize: Size,
	): Position {
		const marginX =
			MAP_MARGIN +
			ENEMY_SIZE.width /
				2;
		const marginY =
			MAP_MARGIN +
			ENEMY_SIZE.height /
				2;
		return {
			x:
				marginX +
				this.#random() *
					Math.max(
						0,
						mapSize.width -
							marginX *
								2,
					),
			y:
				marginY +
				this.#random() *
					Math.max(
						0,
						mapSize.height -
							marginY *
								2,
					),
		};
	}
}

function isTooCloseToPlayers(
	position: Position,
	waveState: WaveState,
): boolean {
	return waveState.players.some(
		(
			player,
		) =>
			distance(
				position,
				player.position,
			) <
			TREE_MIN_PLAYER_DISTANCE,
	);
}

import { v4 as uuidv4 } from "uuid";
import type { EnemyCharacter } from "@/enemy";
import {
	buildEnemyCharacterForWave,
	ENEMY_SIZE,
} from "@/enemy";
import {
	type EnemyState,
	spawnEnemy,
} from "@/enemy/EnemyState";
import type { EnemyEvent } from "@/game-events/GameEvents";
import {
	addition,
	type Point,
	type Position,
	type Range,
	type Size,
} from "@/geometry";
import {
	pickRandom,
	randomAngle,
	randomInRange,
} from "@/random";
import type { WaveState } from "@/waveState";

function spawnCount(
	base: number,
	waveState: WaveState,
): number {
	return (
		base +
		waveState
			.round
			.difficulty +
		waveState
			.players
			.length
	);
}

export {
	randomAngle,
};

export function spawnCluster(
	enemies: EnemyCharacter[],
	baseAmount: number,
	radius: Range,
	angle: Range,
	waveState: WaveState,
): EnemyEvent[] {
	const amount =
		spawnCount(
			baseAmount,
			waveState,
		);
	const center =
		getSpawnCenter(
			waveState,
		);
	const prepared =
		prepareEnemies(
			enemies,
			waveState
				.round
				.wave,
		);
	return new Array(
		amount,
	)
		.fill(
			0,
		)
		.map(
			() => {
				const position =
					randomPositionInRadius(
						radius,
						angle,
						center,
						waveState.mapSize,
					);
				return spawnSingleEnemy(
					prepared,
					position,
				);
			},
		);
}

export function getSpawnCenter(
	waveState: WaveState,
): Position {
	return waveState
		.players[0]!
		.position;
}

function prepareEnemies(
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

function spawnSingleEnemy(
	enemiesToSpawn: EnemyCharacter[],
	position: Position,
): EnemyEvent {
	const id =
		uuidv4();
	const randomEnemy =
		pickRandom(
			enemiesToSpawn,
		);
	const enemy: EnemyState =
		spawnEnemy(
			id,
			position,
			randomEnemy,
		);

	return {
		type: "spawnEnemy" as const,
		enemy,
	};
}

function randomPositionInRadius(
	radius: Range,
	angle: Range,
	center: Point,
	mapSize: Size,
) {
	const r =
		randomInRange(
			radius.from,
			radius.to,
		);
	const a =
		randomInRange(
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

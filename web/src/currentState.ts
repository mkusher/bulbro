import {
	type Position,
	type Size,
	type Direction,
	type Rectangle,
	rectContainsPoint,
	rectIntersectsLine,
	distance,
	rectFromCenter,
	isEqual,
	direction,
	rectsIntersect,
	zeroPoint,
} from "./geometry";
import { movePosition } from "./physics";
import { Movement } from "./movement/Movement";
import type { MovableObject, Shape } from "./movement/Movement";
import { BULBRO_SIZE, BulbroState, spawnBulbro } from "./bulbro";
import type { Player } from "./player";
import { ENEMY_SIZE } from "./enemy";
import type { StatsBonus } from "./weapon";
import { EnemyState } from "./enemy/EnemyState";
import { findClosest, type Difficulty } from "./game-formulas";
import { signal } from "@preact/signals";
import type { ShotState } from "./shot/ShotState";
import type { MapObject } from "./object";
import type {
	BulbroMovedEvent,
	BulbroHealedEvent,
	BulbroAttackedEvent,
	EnemyAttackedEvent,
	EnemyMovedEvent,
	MaterialMovedEvent,
	MaterialCollectedEvent,
	GameEvent,
	TickEvent,
} from "./game-events/GameEvents";
import { withEventMeta } from "./game-events/GameEvents";

/**
 * Runtime state of a single weapon in play.
 */
export interface WeaponState {
	/** Weapon identifier */
	id: string;
	/** Timestamp of the last time this weapon struck */
	lastStrikedAt: number;
	statsBonus: StatsBonus;
	shotSpeed: number;
}

export interface RoundState {
	isRunning: boolean;
	duration: number;
	wave: number;
	difficulty: number;
	startedAt?: number;
	endedAt?: number;
}

/**
 * The current live state of the game.
 */
export interface CurrentState {
	/** The game map size for clamping positions */
	mapSize: Size;
	players: BulbroState[];
	enemies: EnemyState[];
	objects: MapObject[];
	/** Active shots in play */
	shots: ShotState[];
	/** Timestamp of last enemy spawn */
	lastSpawnAt?: number;
	round: RoundState;
}

type Action = GameEvent | SelectWeaponAction;

export const nextWave = (
	currentState: CurrentState,
	{ occurredAt: now }: Extract<GameEvent, { type: "tick" }>,
): CurrentState => ({
	...currentState,
	shots: [],
	objects: [],
	enemies: [],
	players: currentState.players.map((player, i) =>
		player.applyEvent({
			...player.moveFromDirection(
				startPosition(currentState.mapSize, i),
				zeroPoint(),
				now,
			),
			deltaTime: 0,
			occurredAt: now,
		}),
	),
	round: {
		...currentState.round,
		isRunning: true,
		endedAt: undefined,
		startedAt: now,
		wave: currentState.round.wave + 1,
	},
});

const startPosition = (mapSize: Size, i = 0) => ({
	x:
		mapSize.width / 2 +
		-3 * i * (BULBRO_SIZE.width + 5) +
		(i - 1) * -3 * (BULBRO_SIZE.width + 5),
	y: mapSize.height / 2,
});

export const createInitialState = (
	currentPlayers: Player[],
	mapSize: Size,
	difficulty: Difficulty,
	wave = 1,
	duration = 60,
	level = 1,
	experience = 0,
): CurrentState => {
	return {
		mapSize,
		objects: [],
		players: currentPlayers.map((currentPlayer, i) =>
			spawnBulbro(
				currentPlayer.id,
				currentPlayer.sprite,
				startPosition(mapSize, i),
				level,
				experience,
				currentPlayer.bulbro,
			),
		),
		enemies: [],
		shots: [],
		round: {
			isRunning: true,
			duration,
			difficulty,
			wave,
			startedAt: Date.now(),
		},
	};
};

// movePosition and keysToDirection moved to physics.ts and direction-vector.ts

type SelectWeaponAction = {
	type: "select-weapons";
	playerId: string;
	weapons: WeaponState[];
	now: number;
};
/**
 * Actions for updating game state.
 */

// Individual state update functions for each action type
export function movePlayer(
	state: CurrentState,
	action: Extract<GameEvent, { type: "bulbroMoved" }>,
): CurrentState {
	return {
		...state,
		players: state.players.map((p) => {
			if (p.id !== action.bulbroId) return p;
			return p.applyEvent(action);
		}),
	};
}

export function handleEnemyMoved(
	state: CurrentState,
	action: Extract<GameEvent, { type: "enemyMoved" }>,
): CurrentState {
	const { enemyId } = action;
	return {
		...state,
		enemies: state.enemies.map((enemy) => {
			if (enemy.id !== enemyId) return enemy;
			return enemy.applyEvent(action);
		}),
	};
}

export function generateEnemyMovementEvents(
	state: CurrentState,
	deltaTime: number,
): EnemyMovedEvent[] {
	const players = state.players;
	const enemies = [...state.enemies];
	const alive = players.filter((p) => p.isAlive());

	if (alive.length === 0) {
		return [];
	}

	const events: EnemyMovedEvent[] = [];
	const mapSize = state.mapSize;
	const playersObjects = alive.map((p2) => p2.toMovableObject());

	for (const enemy of enemies) {
		const obstacles: MovableObject[] = [
			...enemies
				.filter((e2) => e2.id !== enemy.id && !e2.killedAt)
				.map((e2) => e2.toMovableObject()),
			...playersObjects,
		];

		const newEnemy = enemy.moveToClosestBulbro(
			alive,
			obstacles,
			mapSize,
			deltaTime,
			Date.now(),
		);
		if (
			newEnemy.position.x !== enemy.position.x ||
			newEnemy.position.y !== enemy.position.y
		) {
			events.push({
				type: "enemyMoved",
				enemyId: enemy.id,
				from: enemy.position,
				to: newEnemy.position,
				direction: newEnemy.lastDirection || { x: 0, y: 0 },
			});
		}
	}

	return events;
}

export function handleMaterialMoved(
	state: CurrentState,
	action: Extract<GameEvent, { type: "materialMoved" }>,
): CurrentState {
	const { materialId, to } = action;
	return {
		...state,
		objects: state.objects.map((object) => {
			if (object.type === "material" && object.id === materialId) {
				return {
					...object,
					position: to,
				};
			}
			return object;
		}),
	};
}

export function handleMaterialCollected(
	state: CurrentState,
	action: Extract<GameEvent, { type: "materialCollected" }>,
): CurrentState {
	const { materialId } = action;
	return {
		...state,
		objects: state.objects.filter(
			(object) => !(object.type === "material" && object.id === materialId),
		),
		players: state.players.map((player) => player.applyEvent(action)),
	};
}

const materialPickupSpeed = 600;
export function generateMaterialMovementEvents(
	state: CurrentState,
	deltaTime: number,
): (MaterialMovedEvent | MaterialCollectedEvent)[] {
	const events: (MaterialMovedEvent | MaterialCollectedEvent)[] = [];
	const players = state.players;
	const materialSize = { width: 16, height: 16 };

	for (const object of state.objects) {
		if (object.type !== "material") continue;

		const player = findClosest(
			object,
			players.filter((p) => p.isAlive()),
		);

		if (
			player &&
			distance(player.position, object.position) <= player.stats.pickupRange
		) {
			const shape = {
				type: "rectangle",
				...materialSize,
			} as const;
			const mover = new Movement(
				{
					position: object.position,
					shape,
				},
				state.mapSize,
			);

			const directionToPlayer = direction(object.position, player.position);
			const distanceToPlayer = distance(object.position, player.position);
			const maxMovementDistance = (materialPickupSpeed * deltaTime) / 1000;

			// Don't overshoot the player position
			const actualMovementDistance = Math.min(
				maxMovementDistance,
				distanceToPlayer,
			);
			const adjustedSpeed = actualMovementDistance / (deltaTime / 1000);

			const newPosition = mover.getPositionAfterMove(
				directionToPlayer,
				adjustedSpeed,
				deltaTime,
			);

			if (
				newPosition.x !== object.position.x ||
				newPosition.y !== object.position.y
			) {
				// Check if material is very close to player center (within collection threshold)
				const distanceToPlayer = distance(newPosition, player.position);
				const collectionThreshold = 3; // Nearly touching player center

				if (distanceToPlayer <= collectionThreshold) {
					// Generate material collected event instead of movement
					events.push({
						type: "materialCollected",
						materialId: object.id,
						playerId: player.id,
					});
				} else {
					// Generate movement event if position changed and no collision
					events.push({
						type: "materialMoved",
						materialId: object.id,
						from: object.position,
						to: newPosition,
						direction: direction(object.position, newPosition),
					});
				}
			}
		}
	}

	return events;
}

const enemiesBodiesDisappearAfter = 2000;
export function moveShot(
	state: CurrentState,
	action: Extract<Action, { type: "moveShot" }>,
): CurrentState {
	const { shotId, direction, deltaTime, occurredAt: now } = action;
	const bounds: Rectangle = {
		x: 0,
		y: 0,
		width: state.mapSize.width,
		height: state.mapSize.height,
	};
	let newShots: ShotState[] = [];
	let newEnemies = state.enemies;
	let newPlayers = state.players;
	let newObjects = state.objects;
	for (const shot of state.shots) {
		if (shot.id !== shotId) {
			newShots.push(shot);
			continue;
		}
		const prevPos = shot.position;
		const nextPos = movePosition(prevPos, shot.speed, direction, deltaTime);
		if (
			!rectContainsPoint(bounds, nextPos) ||
			distance(shot.startPosition, nextPos) > shot.range
		) {
			continue;
		}
		if (shot.shooterType === "player") {
			const segment = { start: prevPos, end: nextPos };
			let isHit = false;
			const killedEnemies = newEnemies.filter((e) => e.killedAt);
			const notKilled = newEnemies.filter((e) => !e.killedAt);
			newEnemies = notKilled.map((e) => {
				if (e.killedAt) return e;
				const enemyRect = rectFromCenter(e.position, ENEMY_SIZE);
				if (rectIntersectsLine(enemyRect, segment)) {
					isHit = true;
					return e.applyEvent(
						withEventMeta(e.beHit(shot, now), deltaTime, now),
					);
				}
				return e;
			});
			const newKilled = newEnemies.filter((e) => e.killedAt);
			newObjects = [...newObjects, ...newKilled.map((e) => e.toMaterial())];
			newEnemies = killedEnemies.concat(newEnemies);
			if (isHit) continue;
		}
		if (shot.shooterType === "enemy") {
			const segment = { start: prevPos, end: nextPos };
			let isHit = false;
			newPlayers = newPlayers.map((p) => {
				if (!p.isAlive()) {
					return p;
				}
				const playerRect = rectFromCenter(p.position, BULBRO_SIZE);
				if (rectIntersectsLine(playerRect, segment)) {
					isHit = true;
					return p.applyEvent(
						withEventMeta(p.beHit(shot.damage, now), deltaTime, now),
					);
				}
				return p;
			});
			if (isHit) continue;
		}
		const moveEvent = shot.move(nextPos);
		newShots.push(shot.applyEvent(withEventMeta(moveEvent, deltaTime, now)));
	}
	newEnemies = newEnemies.filter(
		(e) =>
			e.healthPoints > 0 ||
			(e.killedAt && now - e.killedAt < enemiesBodiesDisappearAfter),
	);
	const isRunning =
		newPlayers.filter((p) => p.isAlive()).length > 0 && state.round.isRunning;
	return {
		...state,
		enemies: newEnemies,
		players: newPlayers,
		shots: newShots,
		objects: newObjects,
		round: {
			...state.round,
			isRunning,
			endedAt: !isRunning ? (state.round.endedAt ?? now) : undefined,
		},
	};
}

export function spawnEnemy(
	state: CurrentState,
	action: Extract<Action, { type: "spawnEnemy" }>,
): CurrentState {
	const { enemy, occurredAt: now } = action;
	let objects = [];
	let enemiesToSpawn = [];
	for (let object of state.objects) {
		if (object.type !== "spawning-enemy") {
			objects.push(object);
			continue;
		}
		if (now - object.startedAt >= object.duration * 1000) {
			enemiesToSpawn.push(object.enemy);
			continue;
		}
		objects.push(object);
	}
	return {
		...state,
		enemies: [...state.enemies, ...enemiesToSpawn],
		objects: [
			...objects,
			{
				type: "spawning-enemy",
				id: enemy.id,
				position: enemy.position,
				startedAt: now,
				duration: 3,
				enemy,
			},
		],
		lastSpawnAt: now,
	};
}

export function addShot(
	state: CurrentState,
	action: Extract<Action, { type: "shot" }>,
): CurrentState {
	const { shot, weaponId, occurredAt: now, deltaTime } = action;
	const newPlayers =
		shot.shooterType === "player"
			? state.players.map((p) => {
					if (p.id !== shot.shooterId) return p;
					if (!p.isAlive()) return p;
					return p.applyEvent(
						withEventMeta(p.hit(weaponId, undefined, shot), deltaTime, now),
					);
				})
			: state.players;
	const newEnemies =
		shot.shooterType === "enemy"
			? state.enemies.map((e) => {
					if (e.id !== shot.shooterId) return e;
					return e.applyEvent(
						withEventMeta(e.hit(weaponId, undefined, shot), deltaTime, now),
					);
				})
			: state.enemies;
	return {
		...state,
		players: newPlayers,
		enemies: newEnemies,
		shots: [...state.shots, shot],
	};
}

export function updateRound(
	round: RoundState,
	action: Extract<GameEvent, { type: "tick" }>,
) {
	const { occurredAt: now } = action;

	const isRunning =
		round.isRunning && getTimeLeft(round) <= 0 ? false : round.isRunning;
	return {
		...round,
		isRunning,
		endedAt: !isRunning ? (round.endedAt ?? now) : round.endedAt,
	};
}

export function healPlayers(
	state: CurrentState,
	action: Extract<GameEvent, { type: "tick" }>,
) {
	const { occurredAt: now } = action;
	return {
		...state,
		players: state.players.map((player) =>
			player.isAlive() ? player.healByHpRegeneration(now) : player,
		),
	};
}

export function selectWeapons(state: CurrentState, action: SelectWeaponAction) {
	const { weapons, playerId } = action;
	return {
		...state,
		players: state.players.map((newPlayer) =>
			newPlayer.id === playerId ? newPlayer.useWeapons(weapons) : newPlayer,
		),
	};
}

export function handleBulbroHealed(
	state: CurrentState,
	action: Extract<GameEvent, { type: "bulbroHealed" }>,
): CurrentState {
	const { bulbroId, hp } = action;
	return {
		...state,
		players: state.players.map((player) => {
			if (player.id !== bulbroId) return player;
			return player.applyEvent(action);
		}),
	};
}

export function handleBulbroAttacked(
	state: CurrentState,
	action: Extract<GameEvent, { type: "bulbroAttacked" }>,
): CurrentState {
	const { bulbroId } = action;
	return {
		...state,
		players: state.players.map((player) => {
			if (player.id !== bulbroId) return player;
			return player.applyEvent(action);
		}),
	};
}

export function handleEnemyAttacked(
	state: CurrentState,
	action: Extract<GameEvent, { type: "enemyAttacked" }>,
): CurrentState {
	const { enemyId } = action;
	return {
		...state,
		enemies: state.enemies.map((enemy) => {
			if (enemy.id !== enemyId) return enemy;
			return enemy.applyEvent(action);
		}),
	};
}

/**
 * Pure reducer: returns new state after applying an action.
 */
/**
 * Reducer: returns a new state after applying an action.
 */
/**
 * Pure reducer: returns new state after applying an action.
 */
export function updateState(state: CurrentState, action: Action): CurrentState {
	switch (action.type) {
		case "bulbroMoved": {
			return movePlayer(state, action);
		}
		case "bulbroHealed": {
			return handleBulbroHealed(state, action);
		}
		case "bulbroAttacked": {
			return handleBulbroAttacked(state, action);
		}
		case "enemyAttacked": {
			return handleEnemyAttacked(state, action);
		}
		case "enemyMoved": {
			return handleEnemyMoved(state, action);
		}
		case "materialMoved": {
			return handleMaterialMoved(state, action);
		}
		case "materialCollected": {
			return handleMaterialCollected(state, action);
		}
		case "moveShot": {
			const newState = moveShot(state, action);
			return {
				...newState,
				round: !newState.round.isRunning ? newState.round : state.round,
			};
		}
		case "spawnEnemy": {
			return spawnEnemy(state, action);
		}
		case "shot": {
			return addShot(state, action);
		}
		case "tick": {
			const round = updateRound(state.round, action);
			return {
				...state,
				round,
			};
		}
		default:
			return state;
	}
}

export const getTimeLeft = (round: RoundState) => {
	const duration = round.duration * 1000;
	return round.endedAt && round.startedAt
		? duration - round.endedAt + round.startedAt
		: round.startedAt
			? duration - Date.now() + round.startedAt
			: 0;
};

export const currentState = signal(
	createInitialState([], { width: 800, height: 600 }, 0),
);

export function fromJSON(state: CurrentState) {
	currentState.value = {
		...state,
		objects: state.objects.map((o) =>
			o.type === "spawning-enemy"
				? {
						...o,
						enemy:
							o.enemy instanceof EnemyState ? o.enemy : new EnemyState(o.enemy),
					}
				: o,
		),
		enemies: state.enemies.map((e) =>
			e instanceof EnemyState ? e : new EnemyState(e),
		),
		players: state.players.map((p) =>
			p instanceof BulbroState ? p : new BulbroState(p),
		),
	};
}

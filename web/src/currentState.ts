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

export const nextWave = (
	currentState: CurrentState,
	{ now }: Action,
): CurrentState => ({
	...currentState,
	shots: [],
	objects: [],
	enemies: [],
	players: currentState.players.map((player, i) =>
		player.move(startPosition(currentState.mapSize, i), now),
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
export type Action =
	| {
			type: "move";
			direction: Direction;
			deltaTime: number;
			now: number;
			currentPlayerId: string;
	  }
	| { type: "tick"; deltaTime: number; now: number }
	| { type: "heal"; deltaTime: number; now: number }
	| {
			type: "moveEnemies";
			deltaTime: number;
			now: number;
	  }
	| {
			type: "spawnEnemy";
			enemy: EnemyState;
			deltaTime: number;
			now: number;
	  }
	| {
			type: "shot";
			shot: ShotState;
			deltaTime: number;
			now: number;
			weaponId: string;
	  }
	| {
			type: "moveObjects";
			deltaTime: number;
			now: number;
	  }
	| {
			type: "moveShot";
			shotId: string;
			direction: Direction;
			deltaTime: number;
			now: number;
			chance: number;
	  }
	| {
			type?: undefined;
			deltaTime: number;
			now: number;
	  }
	| SelectWeaponAction;

// Individual state update functions for each action type
export function movePlayer(
	state: CurrentState,
	action: Extract<Action, { type: "move" }>,
): CurrentState {
	const { direction, deltaTime, now, currentPlayerId } = action;
	// Movement handler: build obstacles from other players and alive enemies
	const obstacles: MovableObject[] = [
		...state.players
			.filter((p2) => p2.id !== currentPlayerId && p2.isAlive())
			.map((p2) => p2.toMovableObject()),
		...state.enemies.filter((e) => !e.killedAt).map((e) => e.toMovableObject()),
	];
	return {
		...state,
		players: state.players.map((p) => {
			if (p.id !== currentPlayerId) return p;
			if (!p.isAlive()) {
				return p;
			}
			const mover = new Movement(
				{
					position: p.position,
					shape: {
						type: "rectangle",
						width: BULBRO_SIZE.width,
						height: BULBRO_SIZE.height,
					},
				},
				state.mapSize,
				obstacles,
			);
			const newPos = mover.getPositionAfterMove(direction, p.speed, deltaTime);
			if (isEqual(p.position, newPos)) return p;
			return p.move(newPos, now);
		}),
	};
}

export function moveEnemies(
	state: CurrentState,
	action: Extract<Action, { type: "moveEnemies" }>,
) {
	let newState = { ...state };
	const players = state.players;
	let enemies = [...state.enemies];
	const { now, deltaTime } = action;
	const alive = players.filter((p) => p.isAlive());
	if (alive.length > 0) {
		const mapSize = state.mapSize;
		const playersObjects = alive.map((p2) => p2.toMovableObject());
		newState.enemies = enemies.map((enemy) => {
			const obstacles: MovableObject[] = [
				...enemies
					.filter((e2) => e2.id !== enemy.id && !e2.killedAt)
					.map((e2) => e2.toMovableObject()),
				...playersObjects,
			];
			return enemy.moveToClosestBulbro(
				alive,
				obstacles,
				mapSize,
				deltaTime,
				now,
			);
		});
	}
	return newState;
}

const materialPickupSpeed = 600;
export function moveMaterials(
	state: CurrentState,
	action: Extract<Action, { type: "moveObjects" }>,
) {
	let objects = [];
	let players = state.players;
	for (const object of state.objects) {
		const player = findClosest(
			object,
			players.filter((p) => p.isAlive()),
		);
		let position = object.position;

		if (
			object.type === "material" &&
			player &&
			distance(player.position, object.position) <= player.stats.pickupRange
		) {
			const deltaTime = action.deltaTime;
			const shape = {
				type: "rectangle",
				width: 16,
				height: 16,
			} as const;
			const mover = new Movement(
				{
					position: object.position,
					shape,
				},
				state.mapSize,
			);
			const newPosition = mover.getPositionAfterMove(
				direction(object.position, player.position),
				materialPickupSpeed,
				deltaTime,
			);
			position = newPosition;
			const playerObject = player.toMovableObject();
			if (
				rectsIntersect(
					{
						...shape,
						...position,
					},
					{
						...playerObject.position,
						...playerObject.shape,
					} as Rectangle,
				)
			) {
				players = players.map((p) => p.takeMaterial(object));
				continue;
			}
		}

		objects.push({
			...object,
			position,
		});
	}

	return {
		...state,
		objects,
		players,
	};
}

const enemiesBodiesDisappearAfter = 2000;
export function moveShot(
	state: CurrentState,
	action: Extract<Action, { type: "moveShot" }>,
): CurrentState {
	const { shotId, direction, deltaTime, now } = action;
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
					return e.beHit(shot, now);
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
					return p.beHit(shot.damage, now);
				}
				return p;
			});
			if (isHit) continue;
		}
		newShots.push({ ...shot, position: nextPos });
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
	const { enemy, now } = action;
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
	const { shot, weaponId, now } = action;
	const newPlayers =
		shot.shooterType === "player"
			? state.players.map((p) => {
					if (p.id !== shot.shooterId) return p;
					if (!p.isAlive()) return p;
					return p.hit(weaponId, now);
				})
			: state.players;
	const newEnemies =
		shot.shooterType === "enemy"
			? state.enemies.map((e) => {
					if (e.id !== shot.shooterId) return e;
					return e.hit(weaponId, now);
				})
			: state.enemies;
	return {
		...state,
		players: newPlayers,
		enemies: newEnemies,
		shots: [...state.shots, shot],
	};
}

export function updateRound(round: RoundState, action: Action) {
	const { now } = action;

	const isRunning =
		round.isRunning && getTimeLeft(round) <= 0 ? false : round.isRunning;
	return {
		...round,
		isRunning,
		endedAt: !isRunning ? (round.endedAt ?? now) : round.endedAt,
	};
}

export function healPlayers(state: CurrentState, action: Action) {
	const { now } = action;
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
		case "move": {
			return movePlayer(state, action);
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
		case "tick":
		default:
			const round = updateRound(state.round, action);
			return {
				...state,
				round,
			};
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

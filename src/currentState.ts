import {
	type Position,
	type Size,
	type Direction,
	type Rectangle,
	rectContainsPoint,
	rectsIntersect,
	rectIntersectsLine,
	distance,
	rectFromCenter,
	isEqual,
} from "./geometry";
import { movePosition } from "./physics";
import { Movement } from "./movement/Movement";
import type { MovableObject, Shape } from "./movement/Movement";
import { BULBRO_SIZE, BulbroState, spawnBulbro } from "./bulbro";
import type { Player } from "./bulbro";
import { ENEMY_SIZE } from "./enemy";
import type { StatsBonus } from "./weapon";
import { EnemyState } from "./enemy/EnemyState";
import type { Difficulty } from "./game-formulas";

/**
 * Runtime state of a single weapon in play.
 */
export interface WeaponState {
	/** Weapon identifier */
	id: string;
	/** Timestamp of the last time this weapon struck */
	lastStrikedAt: Date;
	statsBonus: StatsBonus;
	shotSpeed: number;
}

/**
 * Runtime state of an individual projectile (shot) in play.
 */
export interface ShotState {
	/** Unique shot identifier */
	id: string;
	/** ID of the entity that fired this shot */
	shooterId: string;
	/** Whether the shooter was a player or enemy */
	shooterType: "player" | "enemy";
	/** Damage inflicted on hit */
	damage: number;
	/** Movement speed of the shot */
	speed: number;
	/** Maximum travel range */
	range: number;
	/** Current position */
	position: Position;
	startPosition: Position;
	/** Direction vector */
	direction: Direction;
}

export interface RoundState {
	isRunning: boolean;
	duration: number;
	wave: number;
	difficulty: number;
	startedAt?: Date;
	endedAt?: Date;
}

/**
 * The current live state of the game.
 */
export interface CurrentState {
	/** ID of the active player */
	currentPlayerId: string;
	/** The game map size for clamping positions */
	mapSize: Size;
	players: BulbroState[];
	enemies: EnemyState[];
	/** Active shots in play */
	shots: ShotState[];
	/** Timestamp of last enemy spawn */
	lastSpawnAt?: Date;
	round: RoundState;
}

export const nextWave = (
	currentState: CurrentState,
	weapons: WeaponState[],
): CurrentState => ({
	...currentState,
	players: currentState.players
		.map((player) =>
			player.move(startPosition(currentState.mapSize), Date.now()),
		)
		.map((player) =>
			player.id === currentState.currentPlayerId
				? player.useWeapons(weapons)
				: player,
		),
	round: {
		...currentState.round,
		isRunning: true,
		endedAt: undefined,
		startedAt: new Date(),
		wave: currentState.round.wave + 1,
	},
});

const startPosition = (mapSize: Size) => ({
	x: mapSize.width / 2,
	y: mapSize.height / 2,
});

export const createInitialState = (
	currentPlayer: Player,
	mapSize: Size,
	difficulty: Difficulty,
	wave = 1,
	duration = 60,
): CurrentState => {
	return {
		currentPlayerId: currentPlayer.id,
		mapSize,
		players: [
			spawnBulbro(
				currentPlayer.id,
				currentPlayer.sprite,
				startPosition(mapSize),
				currentPlayer.bulbro,
			),
		],
		enemies: [],
		shots: [],
		round: {
			isRunning: true,
			duration,
			difficulty,
			wave,
			startedAt: new Date(),
		},
	};
};

// movePosition and keysToDirection moved to physics.ts and direction-vector.ts

/**
 * Actions for updating game state.
 */
export type Action =
	| { type: "move"; direction: Direction; deltaTime: number; now: number }
	| {
			type: "moveEnemy";
			id: string;
			direction: Direction;
			deltaTime: number;
			now: number;
	  }
	| {
			type: "spawnEnemy";
			enemy: EnemyState;
			now: number;
	  }
	| {
			type: "shot";
			shot: ShotState;
			now: number;
			weaponId: string;
	  }
	| {
			type: "moveShot";
			shotId: string;
			direction: Direction;
			deltaTime: number;
			now: number;
	  }
	| {
			type?: undefined;
			deltaTime: number;
			now: number;
	  };

// Individual state update functions for each action type
export function movePlayer(
	state: CurrentState,
	action: Extract<Action, { type: "move" }>,
): CurrentState {
	const { direction, deltaTime, now } = action;
	// Movement handler: build obstacles from other players and alive enemies
	const obstacles: MovableObject[] = [
		...state.players
			.filter((p2) => p2.id !== state.currentPlayerId)
			.map((p2) => p2.toMovableObject()),
		...state.enemies.filter((e) => !e.killedAt).map((e) => e.toMovableObject()),
	];
	return {
		...state,
		players: state.players.map((p) => {
			if (p.id !== state.currentPlayerId) return p;
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

export function moveEnemy(
	state: CurrentState,
	action: Extract<Action, { type: "moveEnemy" }>,
): CurrentState {
	const { id, direction, deltaTime, now } = action;
	// Movement handler: build obstacles from other enemies and players
	const obstacles: MovableObject[] = [
		...state.enemies
			.filter((e2) => e2.id !== id && !e2.killedAt)
			.map((e2) => ({
				position: e2.position,
				shape: {
					type: "rectangle",
					width: ENEMY_SIZE.width,
					height: ENEMY_SIZE.height,
				} as Shape,
			})),
		...state.players.map((p2) => ({
			position: p2.position,
			shape: {
				type: "rectangle",
				width: BULBRO_SIZE.width,
				height: BULBRO_SIZE.height,
			} as Shape,
		})),
	];
	return {
		...state,
		enemies: state.enemies.map((e) => {
			if (e.id !== id) return e;
			const mover = new Movement(
				{
					position: e.position,
					shape: {
						type: "rectangle",
						width: ENEMY_SIZE.width,
						height: ENEMY_SIZE.height,
					},
				},
				state.mapSize,
				obstacles,
			);
			const newPos = mover.getPositionAfterMove(
				direction,
				e.stats.speed,
				deltaTime,
			);
			if (isEqual(e.position, newPos)) return e;
			return e.move(newPos, now);
		}),
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
			newEnemies = newEnemies.map((e) => {
				if (e.killedAt) return e;
				const enemyRect = rectFromCenter(e.position, ENEMY_SIZE);
				if (rectIntersectsLine(enemyRect, segment)) {
					isHit = true;
					return e.beHit(shot.damage, now);
				}
				return e;
			});
			if (isHit) continue;
		}
		if (shot.shooterType === "enemy") {
			const segment = { start: prevPos, end: nextPos };
			let isHit = false;
			newPlayers = newPlayers.map((p) => {
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
			(e.killedAt && now - e.killedAt.getTime() < enemiesBodiesDisappearAfter),
	);
	newPlayers = newPlayers.filter((p) => p.healthPoints > 0);
	const isRunning = newPlayers.length > 0 && state.round.isRunning;
	return {
		...state,
		enemies: newEnemies,
		players: newPlayers,
		shots: newShots,
		round: {
			...state.round,
			isRunning,
			endedAt: !isRunning ? (state.round.endedAt ?? new Date(now)) : undefined,
		},
	};
}

export function spawnEnemy(
	state: CurrentState,
	action: Extract<Action, { type: "spawnEnemy" }>,
): CurrentState {
	const { enemy, now } = action;
	return {
		...state,
		enemies: [...state.enemies, enemy],
		lastSpawnAt: new Date(now),
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
		endedAt: !isRunning ? (round.endedAt ?? new Date(now)) : round.endedAt,
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
	const round = updateRound(state.round, action);
	switch (action.type) {
		case "move": {
			return { ...movePlayer(state, action), round };
		}
		case "moveEnemy": {
			return { ...moveEnemy(state, action), round };
		}
		case "moveShot": {
			const newState = moveShot(state, action);
			return {
				...newState,
				round: !newState.round.isRunning ? newState.round : round,
			};
		}
		case "spawnEnemy": {
			return { ...spawnEnemy(state, action), round };
		}
		case "shot": {
			return { ...addShot(state, action), round };
		}

		default:
			return {
				...state,
				round,
			};
	}
}

export const getTimeLeft = (round: RoundState) => {
	const duration = round.duration * 1000;
	return round.endedAt && round.startedAt
		? duration - round.endedAt.getTime() + round.startedAt.getTime()
		: round.startedAt
			? duration - Date.now() + round.startedAt.getTime()
			: 0;
};

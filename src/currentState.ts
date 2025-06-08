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
import { PLAYER_SIZE, type Player, type Stats } from "./bulbro";
import { ENEMY_SIZE } from "./enemy";
import type { StatsBonus } from "./weapon";
import { fist } from "./weapons-definitions";
import type { EnemyStats } from "./enemies-definitions/base";

/**
 * Runtime state of a single weapon in play.
 */
export interface WeaponState {
	/** Weapon identifier */
	id: string;
	/** Timestamp of the last time this weapon struck */
	lastStrikedAt: Date;
	statsBonus: StatsBonus;
}
/**
 * Runtime state of a single player.
 */
export interface PlayerState {
	/** Player identifier */
	id: string;
	/** Current position */
	position: Position;
	/** Movement speed */
	speed: number;
	/** Current health points */
	healthPoints: number;
	/** State of each weapon equipped by the player */
	weapons: WeaponState[];
	stats: Stats;
	lastMovedAt: Date;
	lastHitAt: Date;
}

/**
 * Runtime state of a single enemy.
 */
/**
 * Runtime state of a single enemy.
 */
export interface EnemyState {
	/** Enemy identifier */
	id: string;
	/** Current position */
	position: Position;
	/** Current health points */
	healthPoints: number;
	/** Movement speed */
	/** State of each weapon equipped by the enemy */
	weapons: WeaponState[];
	stats: EnemyStats;
	lastMovedAt: Date;
	killedAt?: Date;
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
	players: PlayerState[];
	enemies: EnemyState[];
	/** Active shots in play */
	shots: ShotState[];
	/** Timestamp of last enemy spawn */
	lastSpawnAt?: Date;
	round: RoundState;
}

export const createInitialState = (
	currentPlayer: Player,
	mapSize: Size,
	wave = 1,
): CurrentState => {
	const startPosition = {
		x: mapSize.width / 2,
		y: mapSize.height / 2,
	};
	return {
		currentPlayerId: currentPlayer.id,
		mapSize,
		players: [
			{
				id: currentPlayer.id,
				position: startPosition,
				speed: currentPlayer.bulbro.baseStats.speed,
				healthPoints: currentPlayer.bulbro.baseStats.maxHp,
				stats: currentPlayer.bulbro.baseStats,
				lastMovedAt: new Date(),
				lastHitAt: new Date(0),
				weapons: [
					{
						id: fist.id,
						statsBonus: fist.statsBonus,
						lastStrikedAt: new Date(),
					},
				],
			},
		],
		enemies: [],
		shots: [],
		round: {
			isRunning: true,
			duration: 60,
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
	const otherPlayerRects = state.players
		.filter((p2) => p2.id !== state.currentPlayerId)
		.map((p2) => rectFromCenter(p2.position, PLAYER_SIZE));
	const enemyRects = state.enemies
		.filter((e) => !e.killedAt)
		.map((e) => rectFromCenter(e.position, ENEMY_SIZE));
	return {
		...state,
		players: state.players.map((p) => {
			if (p.id !== state.currentPlayerId) return p;
			const halfW = PLAYER_SIZE.width / 2;
			const halfH = PLAYER_SIZE.height / 2;
			let pos = movePosition(p.position, p.speed, direction, deltaTime);
			pos.x = Math.max(halfW, Math.min(state.mapSize.width - halfW, pos.x));
			pos.y = Math.max(halfH, Math.min(state.mapSize.height - halfH, pos.y));
			const movedRect = rectFromCenter(pos, PLAYER_SIZE);
			const collisionWithPlayer = otherPlayerRects.some((rr) =>
				rectsIntersect(movedRect, rr),
			);
			const collisionWithEnemy = enemyRects.some((rr) =>
				rectsIntersect(movedRect, rr),
			);
			if (collisionWithPlayer || collisionWithEnemy) return p;
			if (isEqual(p.position, pos)) return p;
			return { ...p, position: pos, lastMovedAt: new Date(now) };
		}),
	};
}

export function moveEnemy(
	state: CurrentState,
	action: Extract<Action, { type: "moveEnemy" }>,
): CurrentState {
	const { id, direction, deltaTime, now } = action;
	const otherEnemyRects = state.enemies
		.filter((e2) => e2.id !== id && !e2.killedAt)
		.map((e2) => rectFromCenter(e2.position, ENEMY_SIZE));
	const playerRects = state.players.map((p2) =>
		rectFromCenter(p2.position, PLAYER_SIZE),
	);
	return {
		...state,
		enemies: state.enemies.map((e) => {
			if (e.id !== id) return e;
			const halfW = ENEMY_SIZE.width / 2;
			const halfH = ENEMY_SIZE.height / 2;
			let pos = movePosition(e.position, e.stats.speed, direction, deltaTime);
			pos.x = Math.max(halfW, Math.min(state.mapSize.width - halfW, pos.x));
			pos.y = Math.max(halfH, Math.min(state.mapSize.height - halfH, pos.y));
			const movedRect = rectFromCenter(pos, ENEMY_SIZE);
			const collisionWithEnemy = otherEnemyRects.some((rr) =>
				rectsIntersect(movedRect, rr),
			);
			const collisionWithPlayer = playerRects.some((rr) =>
				rectsIntersect(movedRect, rr),
			);
			if (collisionWithEnemy || collisionWithPlayer) return e;
			if (isEqual(e.position, pos)) return e;
			return { ...e, position: pos, lastMovedAt: new Date(now) };
		}),
	};
}

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
					const healthPoints = e.healthPoints - shot.damage;
					return {
						...e,
						healthPoints,
						killedAt:
							healthPoints <= 0 ? (e.killedAt ?? new Date(now)) : e.killedAt,
					};
				}
				return e;
			});
			if (isHit) continue;
		}
		if (shot.shooterType === "enemy") {
			const segment = { start: prevPos, end: nextPos };
			let isHit = false;
			newPlayers = newPlayers.map((p) => {
				const playerRect = rectFromCenter(p.position, PLAYER_SIZE);
				if (rectIntersectsLine(playerRect, segment)) {
					isHit = true;
					return {
						...p,
						healthPoints: p.healthPoints - shot.damage,
						lastHitAt: new Date(now),
					};
				}
				return p;
			});
			if (isHit) continue;
		}
		newShots.push({ ...shot, position: nextPos });
	}
	newEnemies = newEnemies.filter(
		(e) =>
			e.healthPoints > 0 || (e.killedAt && now - e.killedAt.getTime() < 2000),
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
					return {
						...p,
						weapons: p.weapons.map((ws) =>
							ws.id !== weaponId ? ws : { ...ws, lastStrikedAt: new Date(now) },
						),
					};
				})
			: state.players;
	const newEnemies =
		shot.shooterType === "enemy"
			? state.enemies.map((e) => {
					if (e.id !== shot.shooterId) return e;
					return {
						...e,
						weapons: e.weapons.map((w) =>
							w.id !== weaponId ? w : { ...w, lastStrikedAt: new Date(now) },
						),
					};
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

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
} from "./geometry";
import { movePosition } from "./physics";
import { PLAYER_SIZE, type Player, type Stats } from "./bulbro";
import { ENEMY_SIZE } from "./enemy";
import type { StatsBonus } from "./weapon";
import { fist } from "./weapons-definitions";

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
	speed: number;
	/** State of each weapon equipped by the enemy */
	weapons: WeaponState[];
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
	lastSpawnAt?: number;
}

export const createInitialState = (
	currentPlayer: Player,
	mapSize: Size,
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
	};
};

// movePosition and keysToDirection moved to physics.ts and direction-vector.ts

/**
 * Actions for updating game state.
 */
export type Action =
	| { type: "move"; direction: Direction; deltaTime: number }
	| { type: "moveEnemy"; id: string; direction: Direction; deltaTime: number }
	| {
			type: "spawnEnemy";
			id: string;
			position: Position;
			speed: number;
			healthPoints: number;
			now: number;
	  }
	| {
			type: "shot";
			shot: ShotState;
			now: number;
			playerId: string;
			weaponId: string;
	  }
	| {
			type: "moveShot";
			shotId: string;
			direction: Direction;
			deltaTime: number;
	  };

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
			const { direction, deltaTime } = action;
			// Precompute collision rectangles for other players and enemies
			const otherPlayerRects = state.players
				.filter((p2) => p2.id !== state.currentPlayerId)
				.map((p2) => rectFromCenter(p2.position, PLAYER_SIZE));
			const enemyRects = state.enemies.map((e) =>
				rectFromCenter(e.position, ENEMY_SIZE),
			);
			return {
				...state,
				players: state.players.map((p) => {
					if (p.id !== state.currentPlayerId) return p;
					const halfW = PLAYER_SIZE.width / 2;
					const halfH = PLAYER_SIZE.height / 2;
					let pos = movePosition(p.position, p.speed, direction, deltaTime);
					pos.x = Math.max(halfW, Math.min(state.mapSize.width - halfW, pos.x));
					pos.y = Math.max(
						halfH,
						Math.min(state.mapSize.height - halfH, pos.y),
					);
					const movedRect = rectFromCenter(pos, PLAYER_SIZE);
					const collisionWithPlayer = otherPlayerRects.some((rr) =>
						rectsIntersect(movedRect, rr),
					);
					const collisionWithEnemy = enemyRects.some((rr) =>
						rectsIntersect(movedRect, rr),
					);
					if (collisionWithPlayer || collisionWithEnemy) return p;
					return { ...p, position: pos };
				}),
			};
		}
		case "moveEnemy": {
			const { id, direction, deltaTime } = action;
			// Precompute collision rectangles for other enemies and players
			const otherEnemyRects = state.enemies
				.filter((e2) => e2.id !== id)
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
					let pos = movePosition(e.position, e.speed, direction, deltaTime);
					pos.x = Math.max(halfW, Math.min(state.mapSize.width - halfW, pos.x));
					pos.y = Math.max(
						halfH,
						Math.min(state.mapSize.height - halfH, pos.y),
					);
					const movedRect = rectFromCenter(pos, ENEMY_SIZE);
					const collisionWithEnemy = otherEnemyRects.some((rr) =>
						rectsIntersect(movedRect, rr),
					);
					const collisionWithPlayer = playerRects.some((rr) =>
						rectsIntersect(movedRect, rr),
					);
					if (collisionWithEnemy || collisionWithPlayer) return e;
					return { ...e, position: pos };
				}),
			};
		}
		case "moveShot": {
			const { shotId, direction, deltaTime } = action;
			const bounds: Rectangle = {
				x: 0,
				y: 0,
				width: state.mapSize.width,
				height: state.mapSize.height,
			};
			let newShots: ShotState[] = [];
			let newEnemies = state.enemies;
			for (const shot of state.shots) {
				if (shot.id !== shotId) {
					newShots.push(shot);
					continue;
				}
				const prevPos = shot.position;
				const nextPos = movePosition(prevPos, shot.speed, direction, deltaTime);
				// drop if out of bounds or exceeded range
				if (
					!rectContainsPoint(bounds, nextPos) ||
					distance(shot.startPosition, nextPos) > shot.range
				) {
					continue;
				}
				// handle player shots hitting enemies
				if (shot.shooterType === "player") {
					const segment = { start: prevPos, end: nextPos };
					let isHit = false;
					newEnemies = newEnemies.map((e) => {
						const enemyRect = rectFromCenter(e.position, ENEMY_SIZE);
						if (rectIntersectsLine(enemyRect, segment)) {
							isHit = true;
							return { ...e, healthPoints: e.healthPoints - shot.damage };
						}
						return e;
					});
					// shot disappears after hitting
					if (isHit) {
						continue;
					}
				}
				// otherwise continue moving the shot
				newShots.push({ ...shot, position: nextPos });
			}
			// Remove defeated enemies (health <= 0)
			newEnemies = newEnemies.filter((e) => e.healthPoints > 0);
			return {
				...state,
				enemies: newEnemies,
				shots: newShots,
			};
		}
		case "spawnEnemy": {
			const { id, position, speed, healthPoints, now } = action;
			return {
				...state,
				enemies: [
					...state.enemies,
					{ id, position, speed, healthPoints, weapons: [] },
				],
				lastSpawnAt: now,
			};
		}
		case "shot": {
			const { shot, playerId, weaponId, now } = action;
			return {
				...state,
				players: state.players.map((p) => {
					if (p.id !== playerId) return p;
					return {
						...p,
						weapons: p.weapons.map((ws) => {
							if (ws.id !== weaponId) return ws;
							return { ...ws, lastStrikedAt: new Date(now) };
						}),
					};
				}),
				shots: [...state.shots, shot],
			};
		}

		default:
			return state;
	}
}

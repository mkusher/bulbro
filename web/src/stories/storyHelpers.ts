import type { CurrentState } from "@/currentState";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { type EnemyState } from "@/enemy/EnemyState";
import { classicMapSize } from "@/game-canvas";
import { BulbroState } from "@/bulbro";
import type { ShotState } from "@/shot/ShotState";
import { baseStats } from "@/characters-definitions/base";
import type { SpriteType } from "@/bulbro/Sprite";

// Helper to create a minimal game state
export function createGameState(
	overrides: Partial<CurrentState> = {},
): CurrentState {
	return {
		mapSize: {
			width: classicMapSize.width * 0.25,
			height: classicMapSize.height * 0.25,
		},
		players: [],
		enemies: [],
		objects: [],
		shots: [],
		round: {
			isRunning: true,
			duration: 60,
			wave: 1,
			difficulty: 0,
			startedAt: Date.now(),
		},
		...overrides,
	};
}

// Helper to create a game state with a single bulbro
export function createBulbroState(
	id: string,
	sprite: SpriteType,
	position = { x: 1000, y: 750 },
	bulbro = undefined as any,
	overrides: Partial<CurrentState> = {},
): CurrentState {
	const player = bulbro
		? spawnBulbro(id, sprite, position, 0, 0, bulbro)
		: createMockBulbro(id, sprite, position);

	return createGameState({
		players: [player],
		...overrides,
	});
}

// Helper to create a game state with enemies
export function createEnemyState(
	enemies: Array<EnemyState>,
	overrides: Partial<CurrentState> = {},
): CurrentState {
	return createGameState({
		enemies,
		...overrides,
	});
}

// Helper to create a game state with shots
export function createShotState(
	shots: Array<Partial<ShotState>>,
	overrides: Partial<CurrentState> = {},
): CurrentState {
	const shotStates: ShotState[] = shots.map((shot, i) => ({
		id: `shot-${i}`,
		shooterId: "player-1",
		shooterType: "player" as const,
		damage: 10,
		speed: 200,
		range: 500,
		position: { x: 1000, y: 750 },
		startPosition: { x: 1000, y: 750 },
		direction: { x: 1, y: 0 },
		knockback: 5,
		...shot,
	}));

	return createGameState({
		shots: shotStates,
		...overrides,
	});
}

// Mock bulbro creation for when we don't have access to character definitions
function createMockBulbro(
	id: string,
	sprite: string,
	position: { x: number; y: number },
): BulbroState {
	return new BulbroState({
		id,
		type: sprite as any,
		position,
		lastDirection: { x: 0, y: 0 },
		healthPoints: 100,
		lastMovedAt: 0,
		lastHitAt: 0,
		speed: 100,
		level: 0,
		totalExperience: 0,
		materialsAvailable: 0,
		weapons: [],
		healedByHpRegenerationAt: 0,
		stats: {
			...baseStats,
		},
	}) as BulbroState;
}

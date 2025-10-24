import type { WaveState } from "@/waveState";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { type EnemyState } from "@/enemy/EnemyState";
import { classicMapSize } from "@/game-canvas";
import { BulbroState, type Bulbro } from "@/bulbro";
import { ShotState } from "@/shot/ShotState";
import { baseStats } from "@/characters-definitions/base";

// Helper to create a minimal game state
export function createGameState(overrides: Partial<WaveState> = {}): WaveState {
	return {
		mapSize: {
			width: classicMapSize.width,
			height: classicMapSize.height,
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
	position = { x: 1000, y: 750 },
	bulbro: Bulbro | undefined = undefined,
	overrides: Partial<WaveState> = {},
): WaveState {
	const player = bulbro
		? spawnBulbro(id, bulbro.style.faceType, position, 0, 0, bulbro)
		: createMockBulbro(id, "normal", position);

	return createGameState({
		players: [player],
		...overrides,
	});
}

// Helper to create a game state with enemies
export function createEnemyState(
	enemies: Array<EnemyState>,
	overrides: Partial<WaveState> = {},
): WaveState {
	return createGameState({
		enemies,
		...overrides,
	});
}

// Helper to create a game state with shots
export function createShotState(
	shots: Array<Partial<ShotState>>,
	overrides: Partial<WaveState> = {},
): WaveState {
	const shotStates: ShotState[] = shots.map(
		(shot, i) =>
			new ShotState({
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
			}),
	);

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

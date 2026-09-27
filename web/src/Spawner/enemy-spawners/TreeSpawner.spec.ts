import {
	describe,
	expect,
	it,
} from "bun:test";
import type { BulbroState } from "@/bulbro";
import { distance } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import {
	isTreeSpawnSecond,
	TREE_MIN_PLAYER_DISTANCE,
	TreeSpawner,
	treeSpawnAmount,
} from "./TreeSpawner";

const mapSize =
	{
		width: 2000,
		height: 1500,
	};

function makeState(
	players: {
		position: {
			x: number;
			y: number;
		};
	}[] = [],
): WaveState {
	return {
		mapSize,
		players:
			players as unknown as BulbroState[],
		enemies:
			[],
		objects:
			[],
		shots:
			[],
		lastShotsAt:
			nowTime(
				0,
			),
		lastMovementsAt:
			nowTime(
				0,
			),
		round:
			{
				isRunning: true,
				duration: 60,
				wave: 3,
				difficulty: 0,
			},
	};
}

function sequence(
	...values: number[]
) {
	let i = 0;
	return () =>
		values[
			i++ %
				values.length
		]!;
}

describe("treeSpawnAmount", () => {
	it("spawns 0 or 1 tree with 50% chance without tree stat", () => {
		expect(
			treeSpawnAmount(
				0,
				() =>
					0.49,
			),
		).toBe(
			1,
		);
		expect(
			treeSpawnAmount(
				0,
				() =>
					0.51,
			),
		).toBe(
			0,
		);
	});

	it("spawns 4 or 5 trees with +12 tree stat", () => {
		expect(
			treeSpawnAmount(
				12,
				() =>
					0,
			),
		).toBe(
			5,
		);
		expect(
			treeSpawnAmount(
				12,
				() =>
					0.99,
			),
		).toBe(
			4,
		);
	});
});

describe("isTreeSpawnSecond", () => {
	it("checks every 10 seconds starting from 10th", () => {
		expect(
			isTreeSpawnSecond(
				0,
			),
		).toBe(
			false,
		);
		expect(
			isTreeSpawnSecond(
				5,
			),
		).toBe(
			false,
		);
		expect(
			isTreeSpawnSecond(
				10,
			),
		).toBe(
			true,
		);
		expect(
			isTreeSpawnSecond(
				20,
			),
		).toBe(
			true,
		);
		expect(
			isTreeSpawnSecond(
				21,
			),
		).toBe(
			false,
		);
	});
});

describe("TreeSpawner", () => {
	it("does not spawn between spawn checks", () => {
		const spawner =
			new TreeSpawner(
				() =>
					0,
			);
		expect(
			spawner.tick(
				makeState(),
				deltaTime(
					16,
				),
				nowTime(
					5_000,
				),
			),
		).toEqual(
			[],
		);
	});

	it("spawns a tree when chance succeeds", () => {
		const spawner =
			new TreeSpawner(
				() =>
					0.1,
			);
		const events =
			spawner.tick(
				makeState(),
				deltaTime(
					16,
				),
				nowTime(
					10_005,
				),
			);
		expect(
			events,
		).toHaveLength(
			1,
		);
		const event =
			events[0]!;
		if (
			event.type !==
			"spawnEnemy"
		)
			throw new Error(
				"expected spawnEnemy",
			);
		expect(
			event
				.enemy
				.type,
		).toBe(
			"tree",
		);
		expect(
			event
				.enemy
				.stats
				.speed,
		).toBe(
			0,
		);
	});

	it("does not spawn a tree when chance fails", () => {
		const spawner =
			new TreeSpawner(
				() =>
					0.9,
			);
		expect(
			spawner.tick(
				makeState(),
				deltaTime(
					16,
				),
				nowTime(
					10_005,
				),
			),
		).toEqual(
			[],
		);
	});

	it("avoids spawning trees next to players", () => {
		const playerPosition =
			{
				x: 1000,
				y: 750,
			};
		// first roll: spawn chance, then position rolls: center of the map (on player), then corner
		const spawner =
			new TreeSpawner(
				sequence(
					0.1,
					0.5,
					0.5,
					0,
					0,
				),
			);
		const events =
			spawner.tick(
				makeState(
					[
						{
							position:
								playerPosition,
						},
					],
				),
				deltaTime(
					16,
				),
				nowTime(
					10_005,
				),
			);
		const event =
			events[0]!;
		if (
			event.type !==
			"spawnEnemy"
		)
			throw new Error(
				"expected spawnEnemy",
			);
		expect(
			distance(
				event
					.enemy
					.position,
				playerPosition,
			),
		).toBeGreaterThanOrEqual(
			TREE_MIN_PLAYER_DISTANCE,
		);
	});
});

import { describe, it, expect } from "bun:test";
import type { CurrentState } from "./currentState";
import { createInitialState, updateState } from "./currentState";
import { wellRoundedBulbro } from "./characters-definitions";
import { keysToDirection } from "./controls/keyboard";
import { BULBRO_SIZE } from "./bulbro";

describe("updateState move actions", () => {
	// Generic finder helper
	function findById<T extends { id: string }>(arr: T[], id: string): T {
		const item = arr.find((x) => x.id === id);
		if (!item) throw new Error(`Item with id ${id} not found`);
		return item;
	}
	// Manually construct initial state from character definition
	const currentPlayerId = wellRoundedBulbro.id;
	const baseSpeed = wellRoundedBulbro.baseStats.speed;
	const mapSize = { width: 800, height: 600 };
	const centerX = mapSize.width / 2;
	const centerY = mapSize.height / 2;
	const halfW = BULBRO_SIZE.width / 2;
	const halfH = BULBRO_SIZE.height / 2;
	const initialState: CurrentState = createInitialState(
		{
			id: currentPlayerId,
			bulbro: wellRoundedBulbro,
		},
		mapSize,
	);

	it("moves left correctly", () => {
		const direction = keysToDirection({ left: true });
		const delta = 1;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.x).toBe(
			Math.max(halfW, centerX - baseSpeed * delta),
		);
		expect(player.position.y).toBe(centerY);
	});

	it("moves right correctly", () => {
		const direction = keysToDirection({ right: true });
		const delta = 1;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.x).toBe(
			Math.min(mapSize.width - halfW, centerX + baseSpeed * delta),
		);
		expect(player.position.y).toBe(centerY);
	});

	it("moves up correctly", () => {
		const direction = keysToDirection({ up: true });
		const delta = 1;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.y).toBe(
			Math.max(halfH, centerY - baseSpeed * delta),
		);
		expect(player.position.x).toBe(centerX);
	});

	it("moves down correctly", () => {
		const direction = keysToDirection({ down: true });
		const delta = 1;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.y).toBe(
			Math.min(mapSize.height - halfH, centerY + baseSpeed * delta),
		);
		expect(player.position.x).toBe(centerX);
	});

	it("clamps to left border", () => {
		// Move far left
		const direction = keysToDirection({ left: true });
		const delta = 10; // large delta
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.x).toBeGreaterThanOrEqual(0);
	});

	it("clamps to right border", () => {
		const direction = keysToDirection({ right: true });
		const delta = 10;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.x).toBeLessThanOrEqual(mapSize.width);
	});

	it("clamps to top border", () => {
		const direction = keysToDirection({ up: true });
		const delta = 10;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.y).toBeGreaterThanOrEqual(0);
	});

	it("clamps to bottom border", () => {
		const direction = keysToDirection({ down: true });
		const delta = 10;
		const state = updateState(initialState, {
			type: "move",
			direction,
			deltaTime: delta,
			now: Date.now(),
		});
		const player = findById(state.players, currentPlayerId);
		expect(player.position.y).toBeLessThanOrEqual(mapSize.height);
	});
});

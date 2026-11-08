import {
	describe,
	expect,
	it,
} from "bun:test";
import * as PIXI from "pixi.js";
import type { GameEvent } from "@/game-events/GameEvents";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import {
	deathBurst,
	hitBurst,
	materialBurst,
	ParticleBursts,
} from "./ParticleBursts";

const enemy =
	{
		id: "enemy-1",
		type: "aphid",
		position:
			{
				x: 100,
				y: 100,
			},
	};
const material =
	{
		id: "material-1",
		type: "material",
		position:
			{
				x: 50,
				y: 50,
			},
	};
const player =
	{
		id: "player-1",
		position:
			{
				x: 200,
				y: 50,
			},
	};

function stateWith({
	enemies = [],
	objects = [],
	players = [],
}: {
	enemies?: unknown[];
	objects?: unknown[];
	players?: unknown[];
}): WaveState {
	return {
		enemies,
		objects,
		players,
	} as unknown as WaveState;
}

const meta =
	{
		deltaTime:
			deltaTime(
				16,
			),
		occurredAt:
			nowTime(
				0,
			),
	};

function createEffect() {
	const parent =
		new PIXI.Container();
	const effect =
		new ParticleBursts();
	effect.appendTo(
		parent,
		new PIXI.RenderLayer(),
	);
	const particles =
		() =>
			(
				parent
					.children[0] as PIXI.Container
			)
				.children;
	return {
		effect,
		particles,
	};
}

describe("ParticleBursts", () => {
	it("throws a small amount of particles when an enemy is hit", () => {
		const {
			effect,
		} =
			createEffect();
		const hit: GameEvent =
			{
				type: "enemyReceivedHit",
				enemyId:
					enemy.id,
				damage: 5,
				newHealthPoints: 5,
				...meta,
			};
		effect.update(
			deltaTime(
				0,
			),
			[
				hit,
			],
			stateWith(
				{
					enemies:
						[
							enemy,
						],
				},
			),
		);
		expect(
			effect.particleCount,
		).toBeGreaterThanOrEqual(
			hitBurst.countMin,
		);
		expect(
			effect.particleCount,
		).toBeLessThanOrEqual(
			hitBurst.countMax,
		);
	});

	it("throws a bigger burst of particles when an enemy is killed", () => {
		const {
			effect,
		} =
			createEffect();
		const died: GameEvent =
			{
				type: "enemyDied",
				enemyId:
					enemy.id,
				damage: 10,
				position:
					enemy.position,
				...meta,
			};
		effect.update(
			deltaTime(
				0,
			),
			[
				died,
			],
			stateWith(
				{},
			),
		);
		expect(
			effect.particleCount,
		).toBeGreaterThanOrEqual(
			deathBurst.countMin,
		);
		expect(
			deathBurst.countMin,
		).toBeGreaterThan(
			hitBurst.countMax,
		);
	});

	it("moves particles along the hit direction", () => {
		const {
			effect,
			particles,
		} =
			createEffect();
		effect.spawn(
			{
				x: 0,
				y: 0,
			},
			{
				...hitBurst,
				countMin: 20,
				countMax: 20,
				spawnRadius: 0,
			},
			{
				x: 1,
				y: 0,
			},
		);
		effect.update(
			deltaTime(
				100,
			),
			[],
			stateWith(
				{},
			),
		);
		const averageX =
			particles().reduce(
				(
					sum,
					p,
				) =>
					sum +
					p.x,
				0,
			) /
			particles()
				.length;
		expect(
			averageX,
		).toBeGreaterThan(
			0,
		);
	});

	it("throws particles where a material was collected", () => {
		const {
			effect,
		} =
			createEffect();
		effect.update(
			deltaTime(
				0,
			),
			[],
			stateWith(
				{
					objects:
						[
							material,
						],
					players:
						[
							player,
						],
				},
			),
		);
		const collected: GameEvent =
			{
				type: "materialCollected",
				materialId:
					material.id,
				playerId:
					player.id,
				value: 1,
				...meta,
			};
		effect.update(
			deltaTime(
				0,
			),
			[
				collected,
			],
			stateWith(
				{
					players:
						[
							player,
						],
				},
			),
		);
		expect(
			effect.particleCount,
		).toBeGreaterThanOrEqual(
			materialBurst.countMin,
		);
	});

	it("removes particles once their animation is over", () => {
		const {
			effect,
		} =
			createEffect();
		effect.spawn(
			enemy.position,
			deathBurst,
		);
		effect.update(
			deltaTime(
				deathBurst.durationMaxMs +
					1,
			),
			[],
			stateWith(
				{},
			),
		);
		expect(
			effect.particleCount,
		).toBe(
			0,
		);
	});
});

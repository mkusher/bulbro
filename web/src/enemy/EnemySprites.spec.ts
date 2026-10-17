import {
	describe,
	expect,
	it,
} from "bun:test";
import { wildBoar } from "@/enemies-definitions/wildBoar";
import { FrameAnimationController } from "@/graphics/FrameAnimationController";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { EnemySprites } from "./EnemySprites";
import {
	RAGE_STARTING_DURATION,
	RAGE_TOTAL_DURATION,
	spawnEnemy,
} from "./EnemyState";

function createSprites() {
	const swing =
		() => ({
			controller:
				new FrameAnimationController(
					20,
					750,
				),
			swingAmplitude: 0.3,
			dimensions:
				{
					x:
						-0.8,
					y: 1,
				},
		});
	return new EnemySprites(
		{
			idle: swing(),
			walking:
				swing(),
			hurt: swing(),
			hurtALot:
				swing(),
			raging:
				swing(),
			dead: {
				controller:
					new FrameAnimationController(
						20,
						20,
						false,
					),
				rotationsPerAnimation: 1,
			},
		},
	);
}

const enemy =
	spawnEnemy(
		"boar",
		{
			x: 100,
			y: 100,
		},
		wildBoar,
	);
const startRage =
	(
		at: number,
	) =>
		enemy.applyEvent(
			{
				type: "enemyRagingStarted",
				enemyId:
					enemy.id,
				direction:
					{
						x: 1,
						y: 0,
					},
				occurredAt:
					nowTime(
						at,
					),
				deltaTime:
					deltaTime(
						0.016,
					),
			},
		);

describe("rage warning", () => {
	it("blinks during windup with shorter intervals as the charge approaches", () => {
		const sprites =
			createSprites();
		const raging =
			startRage(
				1000,
			);
		const transitions: number[] =
			[];
		let previous = true;
		for (
			let elapsed = 0;
			elapsed <
			RAGE_STARTING_DURATION;
			elapsed++
		) {
			const state =
				sprites.getState(
					raging,
					deltaTime(
						0.001,
					),
					nowTime(
						1000 +
							elapsed,
					),
				);
			expect(
				state.kind,
			).toBe(
				"raging",
			);
			expect(
				state.effect,
			).toBe(
				"rage",
			);
			if (
				state.showRageOverlay !==
				previous
			) {
				transitions.push(
					elapsed,
				);
				previous =
					state.showRageOverlay;
			}
		}
		expect(
			transitions,
		).toHaveLength(
			5,
		);
		const intervals =
			transitions.map(
				(
					at,
					i,
				) =>
					at -
					(transitions[
						i -
							1
					] ??
						0),
			);
		for (
			let i = 1;
			i <
			intervals.length;
			i++
		) {
			expect(
				intervals[
					i
				]!,
			).toBeLessThan(
				intervals[
					i -
						1
				]!,
			);
		}
	});

	it("keeps the overlay on during the run and clears it when rage ends", () => {
		const sprites =
			createSprites();
		const raging =
			startRage(
				1000,
			);
		for (const elapsed of [
			RAGE_STARTING_DURATION,
			750,
			RAGE_TOTAL_DURATION -
				1,
		]) {
			expect(
				sprites.getState(
					raging,
					deltaTime(
						0.016,
					),
					nowTime(
						1000 +
							elapsed,
					),
				),
			).toMatchObject(
				{
					kind: "raging",
					effect:
						"rage",
					showRageOverlay: true,
				},
			);
		}
		expect(
			sprites.getState(
				raging,
				deltaTime(
					0.016,
				),
				nowTime(
					1000 +
						RAGE_TOTAL_DURATION,
				),
			),
		).toMatchObject(
			{
				effect:
					"none",
				showRageOverlay: false,
			},
		);
	});

	it("restarts the blink timing for each charge regardless of animation frame history", () => {
		const sprites =
			createSprites();
		const fresh =
			createSprites();
		sprites.getState(
			startRage(
				1000,
			),
			deltaTime(
				0.8,
			),
			nowTime(
				1800,
			),
		);
		for (const elapsed of [
			0,
			150,
			250,
			350,
			450,
		]) {
			const first =
				fresh.getState(
					startRage(
						1000,
					),
					deltaTime(
						0.016,
					),
					nowTime(
						1000 +
							elapsed,
					),
				);
			const next =
				sprites.getState(
					startRage(
						5000,
					),
					deltaTime(
						0.1,
					),
					nowTime(
						5000 +
							elapsed,
					),
				);
			expect(
				next.showRageOverlay,
			).toBe(
				first.showRageOverlay,
			);
		}
	});

	it("preserves hurt and death effects over the rage warning", () => {
		const sprites =
			createSprites();
		const hurt =
			startRage(
				1000,
			).applyEvent(
				{
					type: "enemyReceivedHit",
					enemyId:
						enemy.id,
					damage: 1,
					newHealthPoints:
						enemy.healthPoints -
						1,
					occurredAt:
						nowTime(
							1100,
						),
					deltaTime:
						deltaTime(
							0.016,
						),
				},
			);
		expect(
			sprites.getState(
				hurt,
				deltaTime(
					0.016,
				),
				nowTime(
					1150,
				),
			),
		).toMatchObject(
			{
				effect:
					"hit",
				showRageOverlay: false,
			},
		);
		const dead =
			hurt.applyEvent(
				{
					type: "enemyDied",
					enemyId:
						enemy.id,
					damage:
						hurt.healthPoints,
					position:
						hurt.position,
					occurredAt:
						nowTime(
							1120,
						),
					deltaTime:
						deltaTime(
							0.016,
						),
				},
			);
		expect(
			sprites.getState(
				dead,
				deltaTime(
					0.016,
				),
				nowTime(
					1150,
				),
			),
		).toMatchObject(
			{
				kind: "dead",
				effect:
					"none",
				showRageOverlay: false,
			},
		);
	});
});

import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	type EnemyCharacter,
	spawnEnemy,
} from "@/enemy";
import {
	type GameEventInternal,
	withEventMeta,
} from "@/game-events/GameEvents";
import { zeroPoint } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	createInitialState,
	updateState,
	type WaveState,
} from "@/waveState";
import {
	babyEnemy,
	tree,
} from "../enemies-definitions";
import {
	applyEnemyCap,
	MAX_ALIVE_ENEMIES,
} from "./enemyCap";

function enemies(
	count: number,
	character: EnemyCharacter = babyEnemy,
	prefix = "alive",
) {
	return Array.from(
		{
			length:
				count,
		},
		(
			_,
			i,
		) =>
			spawnEnemy(
				`${prefix}-${i}`,
				zeroPoint(),
				character,
			),
	);
}

function stateWith(
	alive: number,
	spawning = 0,
): WaveState {
	return {
		...createInitialState(
			[],
			{
				width: 1000,
				height: 1000,
			},
			0,
		),
		enemies:
			enemies(
				alive,
			),
		objects:
			enemies(
				spawning,
				babyEnemy,
				"spawning",
			).map(
				(
					enemy,
				) => ({
					type: "spawning-enemy" as const,
					id: enemy.id,
					position:
						enemy.position,
					startedAt: 0,
					duration: 1,
					enemy,
				}),
			),
	};
}

function spawns(
	count: number,
	character: EnemyCharacter = babyEnemy,
): GameEventInternal[] {
	return enemies(
		count,
		character,
		"new",
	).map(
		(
			enemy,
		) => ({
			type: "spawnEnemy",
			enemy,
		}),
	);
}

function despawnedIds(
	events: GameEventInternal[],
) {
	return events.flatMap(
		(
			e,
		) =>
			e.type ===
			"enemyDespawned"
				? [
						e.enemyId,
					]
				: [],
	);
}

function spawnCount(
	events: GameEventInternal[],
) {
	return events.filter(
		(
			e,
		) =>
			e.type ===
			"spawnEnemy",
	)
		.length;
}

describe("applyEnemyCap", () => {
	it("passes spawns through below the cap", () => {
		const events =
			applyEnemyCap(
				stateWith(
					MAX_ALIVE_ENEMIES -
						5,
				),
				spawns(
					5,
				),
			);
		expect(
			spawnCount(
				events,
			),
		).toBe(
			5,
		);
		expect(
			despawnedIds(
				events,
			),
		).toEqual(
			[],
		);
	});

	it("removes a random alive enemy for every spawn over the cap", () => {
		const events =
			applyEnemyCap(
				stateWith(
					MAX_ALIVE_ENEMIES -
						2,
				),
				spawns(
					5,
				),
				() =>
					0,
			);
		expect(
			spawnCount(
				events,
			),
		).toBe(
			5,
		);
		expect(
			despawnedIds(
				events,
			),
		).toEqual(
			[
				"alive-0",
				"alive-1",
				"alive-2",
			],
		);
	});

	it("counts enemies that are still appearing", () => {
		const events =
			applyEnemyCap(
				stateWith(
					MAX_ALIVE_ENEMIES -
						10,
					10,
				),
				spawns(
					1,
				),
				() =>
					0,
			);
		expect(
			despawnedIds(
				events,
			),
		).toEqual(
			[
				"alive-0",
			],
		);
	});

	it("skips spawns when no alive enemy can be removed", () => {
		const events =
			applyEnemyCap(
				stateWith(
					0,
					MAX_ALIVE_ENEMIES,
				),
				spawns(
					3,
				),
			);
		expect(
			events,
		).toEqual(
			[],
		);
	});

	it("ignores trees", () => {
		const state =
			stateWith(
				MAX_ALIVE_ENEMIES,
			);
		const events =
			applyEnemyCap(
				{
					...state,
					enemies:
						[
							...enemies(
								5,
								tree,
								"tree",
							),
							...state.enemies,
						],
				},
				spawns(
					2,
					tree,
				),
				() =>
					0,
			);
		expect(
			spawnCount(
				events,
			),
		).toBe(
			2,
		);
		expect(
			despawnedIds(
				events,
			),
		).toEqual(
			[],
		);
	});
});

describe("enemyDespawned", () => {
	it("kills the enemy without dropping loot", () => {
		const state =
			stateWith(
				2,
			);
		const next =
			updateState(
				state,
				withEventMeta(
					{
						type: "enemyDespawned",
						enemyId:
							"alive-0",
					},
					deltaTime(
						0,
					),
					nowTime(
						500,
					),
				),
			);
		expect(
			next.enemies.map(
				(
					e,
				) =>
					e.killedAt,
			),
		).toEqual(
			[
				500,
				undefined,
			],
		);
		expect(
			next.objects,
		).toEqual(
			state.objects,
		);
	});
});

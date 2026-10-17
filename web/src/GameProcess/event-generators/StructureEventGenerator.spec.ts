import {
	expect,
	it,
} from "bun:test";
import {
	BulbroState,
	spawnBulbro,
} from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import { babyEnemy as baby } from "@/enemies-definitions/baby";
import {
	EnemyState,
	spawnEnemy,
} from "@/enemy/EnemyState";
import {
	engineeringAmount,
	type Structure,
} from "@/engineering/structures";
import { withEventMeta } from "@/game-events/GameEvents";
import { ShotState } from "@/shot/ShotState";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	createInitialState,
	nextWave,
	updateState,
	type WaveState,
} from "@/waveState";
import { getWeaponByType } from "@/weapon";
import { toWeaponStateAtTier } from "@/weapon/WeaponTiers";
import { ShotMovementEventGenerator } from "./ShotMovementEventGenerator";
import { StructureEventGenerator } from "./StructureEventGenerator";

function player() {
	return spawnBulbro(
		"p",
		"normal",
		{
			x: 500,
			y: 500,
		},
		1,
		0,
		{
			...wellRoundedBulbro,
			statBonuses:
				{},
		},
	);
}
function state(
	owner = player(),
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
		players:
			[
				owner,
			],
	};
}
function tick(
	s: WaveState,
	at: number,
	delta = 16,
) {
	const events =
		new StructureEventGenerator(
			() =>
				0.5,
		).generate(
			s,
			deltaTime(
				delta,
			),
			nowTime(
				at,
			),
		);
	return {
		events,
		state:
			events.reduce(
				(
					s,
					e,
				) =>
					updateState(
						s,
						withEventMeta(
							e,
							deltaTime(
								delta,
							),
							nowTime(
								at,
							),
						),
					),
				s,
			),
	};
}
const structures =
	(
		s: WaveState,
	) =>
		s.objects.filter(
			(
				o,
			): o is Structure =>
				o.type ===
				"structure",
		);
const enemy =
	(
		id: string,
		x: number,
		y = 500,
	) => {
		const e =
			spawnEnemy(
				id,
				{
					x,
					y,
				},
				baby,
				() =>
					0.5,
			);
		return new EnemyState(
			{
				...e.toJSON(),
				healthPoints: 200,
				stats:
					{
						...e.stats,
						maxHp: 200,
					},
			},
		);
	};

it("spawns one structure for every item copy and tool and does not duplicate them", () => {
	const owner =
		player()
			.withItem(
				"turret",
			)
			.withItem(
				"turret",
			)
			.withItem(
				"garden",
			)
			.useWeapons(
				[
					toWeaponStateAtTier(
						getWeaponByType(
							"pruner",
						),
						4,
					),
					toWeaponStateAtTier(
						getWeaponByType(
							"wrench",
						),
						3,
					),
				],
			);
	const first =
		tick(
			state(
				owner,
			),
			0,
		).state;
	expect(
		structures(
			first,
		)
			.map(
				(
					s,
				) =>
					String(
						s.kind,
					),
			)
			.sort(),
	).toEqual(
		[
			"turret",
			"turret",
			"garden",
			"garden",
			"laserTurret",
		].sort(),
	);
	expect(
		first.objects.filter(
			(
				o,
			) =>
				o.type ===
				"consumable",
		),
	).toHaveLength(
		2,
	);
	expect(
		structures(
			tick(
				first,
				1,
			)
				.state,
		),
	).toHaveLength(
		5,
	);
});

it("resets structures and their timers for each new wave", () => {
	const initial =
		tick(
			state(
				player()
					.withItem(
						"garden",
					)
					.withItem(
						"landmines",
					),
			),
			100,
		).state;
	const fresh =
		nextWave(
			initial,
			withEventMeta(
				{
					type: "tick",
				},
				deltaTime(
					0,
				),
				nowTime(
					0,
				),
			) as Extract<
				import("@/game-events/GameEvents").GameEvent,
				{
					type: "tick";
				}
			>,
		);
	expect(
		fresh.objects,
	).toEqual(
		[],
	);
	const restarted =
		tick(
			fresh,
			0,
		).state;
	expect(
		structures(
			restarted,
		).filter(
			(
				s,
			) =>
				s.kind ===
				"landmine",
		),
	).toHaveLength(
		1,
	);
	expect(
		restarted.objects.filter(
			(
				o,
			) =>
				o.type ===
				"consumable",
		),
	).toHaveLength(
		1,
	);
});

for (const [
	tier,
	gardenInterval,
	mineInterval,
	turret,
] of [
	[
		1,
		15000,
		12000,
		"turret",
	],
	[
		2,
		14000,
		9000,
		"incendiaryTurret",
	],
	[
		3,
		12000,
		6000,
		"laserTurret",
	],
	[
		4,
		10000,
		3000,
		"explosiveTurret",
	],
] as const) {
	it(`uses tier ${tier} tool structures and independent timers`, () => {
		const owner =
			player().useWeapons(
				[
					"pruner",
					"screwdriver",
					"wrench",
				].map(
					(
						type,
					) =>
						toWeaponStateAtTier(
							getWeaponByType(
								type as
									| "pruner"
									| "screwdriver"
									| "wrench",
							),
							tier,
						),
				),
			);
		const first =
			tick(
				state(
					owner,
				),
				0,
			).state;
		expect(
			structures(
				first,
			).find(
				(
					s,
				) =>
					s.kind ===
					"garden",
			)
				?.interval,
		).toBe(
			gardenInterval,
		);
		expect(
			structures(
				first,
			).find(
				(
					s,
				) =>
					s.kind ===
					"landmineSource",
			)
				?.interval,
		).toBe(
			mineInterval,
		);
		expect(
			structures(
				first,
			).some(
				(
					s,
				) =>
					s.kind ===
					turret,
			),
		).toBe(
			true,
		);
		expect(
			structures(
				tick(
					first,
					mineInterval -
						1,
				)
					.state,
			).filter(
				(
					s,
				) =>
					s.kind ===
					"landmine",
			),
		).toHaveLength(
			1,
		);
		expect(
			structures(
				tick(
					first,
					mineInterval,
				)
					.state,
			).filter(
				(
					s,
				) =>
					s.kind ===
					"landmine",
			),
		).toHaveLength(
			2,
		);
		const grown =
			tick(
				first,
				gardenInterval,
			).state;
		expect(
			grown.objects.filter(
				(
					o,
				) =>
					o.type ===
					"consumable",
			),
		).toHaveLength(
			2,
		);
	});
}

it("scales turret damage only with Engineering and keeps fixed range and randomized cooldown", () => {
	const owner =
		player()
			.withItem(
				"turret",
			)
			.withStatSource(
				{
					id: "stats",
					kind: "upgrade",
					bonuses:
						{
							engineering: 20,
							damage: 500,
							rangedDamage: 500,
							elementalDamage: 500,
							attackSpeed: 500,
							critChance: 100,
							range: 500,
							lifeSteal: 100,
						},
				},
			);
	const initial =
		{
			...state(
				owner,
			),
			enemies:
				[
					enemy(
						"target",
						700,
					),
				],
		};
	const fired =
		tick(
			initial,
			0,
		).state;
	expect(
		fired
			.shots[0]
			?.damage,
	).toBe(
		26,
	);
	expect(
		fired
			.shots[0]
			?.range,
	).toBe(
		300,
	);
	expect(
		structures(
			fired,
		).find(
			(
				s,
			) =>
				s.kind ===
				"turret",
		)
			?.nextActionAt,
	).toBe(
		730,
	);
	expect(
		tick(
			fired,
			729,
		).events.some(
			(
				e,
			) =>
				e.type ===
				"shot",
		),
	).toBe(
		false,
	);
	expect(
		tick(
			fired,
			730,
		).events.some(
			(
				e,
			) =>
				e.type ===
				"shot",
		),
	).toBe(
		true,
	);
	const outOfRange =
		tick(
			{
				...initial,
				enemies:
					[
						enemy(
							"far",
							801,
						),
					],
			},
			0,
		);
	expect(
		outOfRange
			.state
			.shots,
	).toHaveLength(
		0,
	);
	// The normal projectile generator must not also process structure bullets.
	expect(
		new ShotMovementEventGenerator().generate(
			fired,
			deltaTime(
				1000,
			),
			nowTime(
				1000,
			),
		),
	).toEqual(
		[],
	);
	expect(
		tick(
			fired,
			300,
			300,
		).events.some(
			(
				e,
			) =>
				e.type ===
				"bulbroHealed",
		),
	).toBe(
		false,
	);
});

it("arms landmines on contact and explodes once on exit, applying explosion size", () => {
	const owner =
		player()
			.withItem(
				"landmines",
			)
			.withStatSource(
				{
					id: "size",
					kind: "upgrade",
					bonuses:
						{
							engineering: 10,
							explosionSize: 100,
							damage: 300,
						},
				},
			);
	const initial =
		{
			...tick(
				state(
					owner,
				),
				0,
			)
				.state,
			enemies:
				[
					enemy(
						"step",
						500,
					),
					enemy(
						"near",
						650,
					),
					enemy(
						"far",
						850,
					),
				],
		};
	const armed =
		tick(
			initial,
			1,
		).state;
	expect(
		structures(
			armed,
		).find(
			(
				s,
			) =>
				s.kind ===
				"landmine",
		)
			?.armed,
	).toBe(
		true,
	);
	expect(
		armed.enemies.every(
			(
				e,
			) =>
				e.healthPoints ===
				200,
		),
	).toBe(
		true,
	);
	const moved =
		{
			...armed,
			enemies:
				[
					enemy(
						"step",
						540,
					),
					enemy(
						"near",
						650,
					),
					enemy(
						"far",
						850,
					),
				],
		};
	const exploded =
		tick(
			moved,
			2,
		);
	expect(
		exploded.events.find(
			(
				e,
			) =>
				e.type ===
				"shotExploded",
		),
	).toMatchObject(
		{
			radius: 200,
			hitIds:
				[
					"step",
					"near",
				],
		},
	);
	expect(
		exploded.state.enemies.map(
			(
				e,
			) =>
				e.healthPoints,
		),
	).toEqual(
		[
			180,
			180,
			200,
		],
	);
	expect(
		structures(
			exploded.state,
		).some(
			(
				s,
			) =>
				s.kind ===
				"landmine",
		),
	).toBe(
		false,
	);
	expect(
		tick(
			exploded.state,
			3,
		).events.some(
			(
				e,
			) =>
				e.type ===
				"shotExploded",
		),
	).toBe(
		false,
	);
});

function structureShot(
	kind: NonNullable<
		ShotState["structure"]
	>["kind"],
	overrides: Partial<
		ReturnType<
			ShotState["toJSON"]
		>
	> = {},
) {
	return new ShotState(
		{
			id: "shot",
			shooterId:
				"turret",
			shooterType:
				"player",
			weaponType:
				"wrench",
			damage: 20,
			speed: 700,
			range: 500,
			position:
				{
					x: 500,
					y: 500,
				},
			startPosition:
				{
					x: 500,
					y: 500,
				},
			direction:
				{
					x: 1,
					y: 0,
				},
			knockback: 0,
			structure:
				{
					kind,
					ownerId:
						"p",
					hitIds:
						[],
				},
			...overrides,
		},
	);
}

it("pierces three enemies, hits each only once across ticks and stops on the fourth", () => {
	const initial =
		{
			...state(),
			shots:
				[
					structureShot(
						"laserTurret",
					),
				],
			enemies:
				[
					enemy(
						"1",
						550,
					),
					enemy(
						"2",
						620,
					),
					enemy(
						"3",
						690,
					),
					enemy(
						"4",
						760,
					),
					enemy(
						"5",
						830,
					),
				],
		};
	const first =
		tick(
			initial,
			50,
			50,
		).state;
	expect(
		first
			.shots[0]
			?.structure
			?.hitIds,
	).toEqual(
		[
			"1",
		],
	);
	const second =
		tick(
			first,
			500,
			400,
		).state;
	expect(
		second.enemies.map(
			(
				e,
			) =>
				e.healthPoints,
		),
	).toEqual(
		[
			180,
			180,
			180,
			180,
			200,
		],
	);
	expect(
		second.shots,
	).toHaveLength(
		0,
	);
});

it("explosive projectiles hit every enemy in the blast and expire once", () => {
	const initial =
		{
			...state(),
			shots:
				[
					structureShot(
						"explosiveTurret",
						{
							explosionRadius: 100,
						},
					),
				],
			enemies:
				[
					enemy(
						"1",
						560,
					),
					enemy(
						"2",
						610,
					),
					enemy(
						"3",
						800,
					),
				],
		};
	const result =
		tick(
			initial,
			500,
			500,
		);
	expect(
		result.state.enemies.map(
			(
				e,
			) =>
				e.healthPoints,
		),
	).toEqual(
		[
			180,
			180,
			200,
		],
	);
	expect(
		result.events.filter(
			(
				e,
			) =>
				e.type ===
				"shotExploded",
		),
	).toHaveLength(
		1,
	);
	expect(
		result
			.state
			.shots,
	).toHaveLength(
		0,
	);
});

it("medical projectiles heal the owner on collision without resetting regeneration or healing others", () => {
	const owner =
		player()
			.withItem(
				"medicalTurret",
			)
			.withStatSource(
				{
					id: "eng",
					kind: "upgrade",
					bonuses:
						{
							engineering: 20,
						},
				},
			);
	const hurt =
		new BulbroState(
			{
				...owner.toJSON(),
				healthPoints: 1,
				healedByHpRegenerationAt: 25,
				position:
					{
						x: 650,
						y: 500,
					},
			},
		);
	const initial =
		tick(
			state(
				hurt,
			),
			0,
		).state;
	expect(
		initial
			.shots[0]
			?.damage,
	).toBe(
		4,
	);
	expect(
		initial
			.shots[0]
			?.structure
			?.targetId,
	).toBe(
		"p",
	);
	expect(
		initial
			.players[0]
			?.healthPoints,
	).toBe(
		1,
	);
	const healed =
		tick(
			initial,
			300,
			300,
		)
			.state
			.players[0]!;
	expect(
		healed.healthPoints,
	).toBe(
		5,
	);
	expect(
		healed.toJSON()
			.healedByHpRegenerationAt,
	).toBe(
		25,
	);
	expect(
		engineeringAmount(
			3,
			0.05,
			-1,
		),
	).toBe(
		2,
	);
	expect(
		tick(
			state(
				owner,
			),
			0,
		)
			.state
			.shots,
	).toHaveLength(
		0,
	);
});

it("incendiary projectiles refresh a single burn with eight timed ticks", () => {
	const shot =
		structureShot(
			"incendiaryTurret",
			{
				damage: 1,
				structure:
					{
						kind: "incendiaryTurret",
						ownerId:
							"p",
						hitIds:
							[],
						burnDamage: 5,
					},
			},
		);
	let current =
		tick(
			{
				...state(),
				enemies:
					[
						enemy(
							"target",
							550,
						),
					],
				shots:
					[
						shot,
					],
			},
			100,
			100,
		).state;
	expect(
		current
			.enemies[0]
			?.healthPoints,
	).toBe(
		199,
	);
	expect(
		structures(
			current,
		).find(
			(
				s,
			) =>
				s.kind ===
				"burn",
		)
			?.ticksLeft,
	).toBe(
		8,
	);
	for (
		let i = 1;
		i <=
		8;
		i++
	)
		current =
			tick(
				current,
				100 +
					i *
						1000,
			).state;
	expect(
		current
			.enemies[0]
			?.healthPoints,
	).toBe(
		159,
	);
	expect(
		structures(
			current,
		).some(
			(
				s,
			) =>
				s.kind ===
				"burn",
		),
	).toBe(
		false,
	);
});

it("round trips structure timers, projectile metadata and duplicate inventories", () => {
	const initial =
		tick(
			{
				...state(
					player()
						.withItem(
							"turret",
						)
						.withItem(
							"garden",
						),
				),
				enemies:
					[
						enemy(
							"target",
							700,
						),
					],
			},
			0,
		).state;
	const raw =
		JSON.parse(
			JSON.stringify(
				initial,
			),
		);
	const restored =
		{
			...raw,
			players:
				raw.players.map(
					(
						p: BulbroState,
					) =>
						new BulbroState(
							p,
						),
				),
			shots:
				raw.shots.map(
					(
						s: ShotState,
					) =>
						new ShotState(
							s,
						),
				),
		};
	expect(
		structures(
			restored,
		),
	).toEqual(
		structures(
			initial,
		),
	);
	expect(
		restored
			.shots[0]
			?.structure,
	).toEqual(
		initial
			.shots[0]
			?.structure,
	);
	expect(
		tick(
			restored,
			1,
		)
			.state
			.objects
			.length,
	).toBe(
		initial
			.objects
			.length,
	);
});

it("adds Tool Engineering once for equipped copies and preserves it through serialization", () => {
	const owner =
		player().useWeapons(
			[
				toWeaponStateAtTier(
					getWeaponByType(
						"wrench",
					),
					1,
				),
				toWeaponStateAtTier(
					getWeaponByType(
						"screwdriver",
					),
					1,
				),
			],
		);
	expect(
		owner
			.stats
			.engineering,
	).toBe(
		1,
	);
	expect(
		new BulbroState(
			JSON.parse(
				JSON.stringify(
					owner,
				),
			),
		)
			.stats
			.engineering,
	).toBe(
		1,
	);
	expect(
		owner.useWeapons(
			owner.weapons.slice(
				0,
				1,
			),
		)
			.stats
			.engineering,
	).toBe(
		0,
	);
});

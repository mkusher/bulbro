import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	type BulbroState,
	spawnBulbro,
} from "../bulbro/BulbroState";
import { wellRoundedBulbro } from "../characters-definitions";
import { baseStats } from "../characters-definitions/base";
import { EnemyState } from "../enemy/EnemyState";
import { ShotMovementEventGenerator } from "../GameProcess/event-generators/ShotMovementEventGenerator";
import type { GameEventInternal } from "../game-events/GameEvents";
import {
	isWeaponReadyToShoot,
	weaponCooldownSeconds,
} from "../game-formulas";
import { generateWeaponShopItems } from "../shop/ShopItemsGenerator";
import type { ShotState } from "../shot/ShotState";
import {
	deltaTime,
	nowTime,
} from "../time";
import type { WaveState } from "../waveState";
import {
	fromWeaponState,
	getWeaponByType,
	isMeleeWeapon,
	toWeaponState,
} from "../weapon";
import {
	applyAttackToWeapons,
	attack,
} from "../weapon/Attack";
import {
	createStrike,
	findStrikeHits,
} from "../weapon/MeleeStrike";
import type { WeaponState } from "../weapon/WeaponState";
import {
	weaponAtTier,
	weaponStatsForTier,
} from "../weapon/WeaponTiers";
import {
	boomerang,
	revolver,
	spear,
	weapons,
} from "./index";

function playerWith(
	weapon: typeof spear,
	position = {
		x: 1000,
		y: 1000,
	},
) {
	return spawnBulbro(
		"p1",
		"normal",
		position,
		1,
		0,
		{
			...wellRoundedBulbro,
			statBonuses:
				{},
			weapons:
				[
					weapon,
				],
		},
	);
}

function equippedWeapon(
	player: BulbroState,
): WeaponState {
	const weapon =
		player
			.weapons[0];
	if (
		!weapon
	)
		throw new Error(
			"Expected the weapon to be equipped",
		);
	return weapon;
}

function enemyAt(
	id: string,
	x: number,
	y: number,
): EnemyState {
	return new EnemyState(
		{
			id,
			type: "potatoBeetleBaby",
			position:
				{
					x,
					y,
				},
			healthPoints: 1000,
			stats:
				{
					...baseStats,
					maxHp: 1000,
					hpRegeneration: 0,
					speed: 50,
					materialsDropped: 1,
					knockback: 0,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			lastHorizontalDirection: 1,
		},
	);
}

const hitEnemyIds =
	(
		events: GameEventInternal[],
	) =>
		events.flatMap(
			(
				event,
			) =>
				event.type ===
					"enemyReceivedHit" ||
				event.type ===
					"enemyDied"
					? [
							event.enemyId,
						]
					: [],
		);

describe("spear, revolver and boomerang", () => {
	for (const weapon of [
		spear,
		revolver,
		boomerang,
	]) {
		it(`${weapon.name} is offered by the shop and resolves from equipped state`, () => {
			expect(
				weapons,
			).toContain(
				weapon,
			);
			expect(
				getWeaponByType(
					weapon.id,
				),
			).toBe(
				weapon,
			);
			expect(
				fromWeaponState(
					toWeaponState(
						weapon,
					),
				),
			).toBe(
				weapon,
			);
			const item =
				generateWeaponShopItems(
					wellRoundedBulbro,
				).find(
					(
						item,
					) =>
						item
							.weapon
							.id ===
						weapon.id,
				);
			expect(
				item?.price,
			).toBeGreaterThan(
				0,
			);
		});

		it(`${weapon.name} grows stronger with every tier`, () => {
			let previous =
				weaponStatsForTier(
					weapon,
					1,
				);
			for (const tier of [
				2,
				3,
				4,
			] as const) {
				const stats =
					weaponStatsForTier(
						weapon,
						tier,
					);
				expect(
					stats.damage ??
						0,
				).toBeGreaterThan(
					previous.damage ??
						0,
				);
				expect(
					stats.cooldown ??
						0,
				).toBeLessThan(
					previous.cooldown ??
						0,
				);
				previous =
					stats;
			}
		});
	}
});

describe("spear", () => {
	it("thrusts in melee and hits every enemy along the shaft once", () => {
		expect(
			isMeleeWeapon(
				spear.id,
			),
		).toBe(
			true,
		);
		const player =
			playerWith(
				spear,
			);
		const performed =
			attack(
				player,
				"player",
				equippedWeapon(
					player,
				),
				{
					id: "front",
					aimAt:
						{
							x: 1100,
							y: 1000,
						},
				},
				nowTime(
					1000,
				),
				() =>
					0.99,
			);
		if (
			performed?.type !==
			"strike"
		)
			throw new Error(
				"Expected a strike",
			);
		const strike =
			performed.strike;
		expect(
			strike.reach,
		).toBeGreaterThanOrEqual(
			spear
				.statsBonus
				.range ??
				0,
		);
		const targets =
			[
				{
					id: "front",
					position:
						{
							x: 1100,
							y: 1000,
						},
				},
				{
					id: "behind",
					position:
						{
							x: 1240,
							y: 1000,
						},
				},
				{
					id: "aside",
					position:
						{
							x: 1100,
							y: 1200,
						},
				},
			];
		const end =
			strike.startedAt +
			strike.duration;
		const hits =
			findStrikeHits(
				strike,
				player.position,
				targets,
				10,
				strike.startedAt,
				end,
			);
		expect(
			hits.map(
				(
					t,
				) =>
					t.id,
			),
		).toEqual(
			[
				"front",
				"behind",
			],
		);
		expect(
			findStrikeHits(
				{
					...strike,
					hitTargetIds:
						[
							"front",
							"behind",
						],
				},
				player.position,
				targets,
				10,
				strike.startedAt,
				end,
			),
		).toEqual(
			[],
		);
	});

	it("uses the configured thrust", () => {
		expect(
			createStrike(
				spear.attack as Parameters<
					typeof createStrike
				>[0],
				{
					now: 0,
					pivot:
						{
							x: 0,
							y: 0,
						},
					target:
						{
							x: 1,
							y: 0,
						},
					targetId:
						"t",
					reach: 300,
					damage: 1,
					knockback: 0,
					cooldown: 1300,
				},
			)
				.type,
		).toBe(
			"thrust",
		);
	});
});

describe("revolver", () => {
	const fire =
		(
			weapon: WeaponState,
			at: number,
		) =>
			requireOne(
				applyAttackToWeapons(
					[
						weapon,
					],
					{
						weaponId:
							weapon.id,
						targetId:
							"enemy",
						occurredAt:
							at,
					},
				),
			);

	it("fires its magazine at the cooldown, then waits for the reload", () => {
		let weapon =
			toWeaponState(
				revolver,
			);
		const magazine =
			revolver
				.statsBonus
				.magazine ??
			0;
		expect(
			magazine,
		).toBe(
			6,
		);
		for (
			let shot = 1;
			shot <=
			magazine;
			shot++
		) {
			expect(
				weaponCooldownSeconds(
					weapon,
				),
			).toBe(
				revolver
					.statsBonus
					.cooldown ??
					0,
			);
			weapon =
				fire(
					weapon,
					shot *
						1000,
				);
			expect(
				weapon.shotsFired,
			).toBe(
				shot,
			);
		}
		const reload =
			revolver
				.statsBonus
				.reload ??
			0;
		expect(
			weaponCooldownSeconds(
				weapon,
			),
		).toBe(
			reload,
		);
		const lastShotAt =
			magazine *
			1000;
		expect(
			isWeaponReadyToShoot(
				weapon.lastStrikedAt,
				weaponCooldownSeconds(
					weapon,
				),
				0,
				nowTime(
					lastShotAt +
						(revolver
							.statsBonus
							.cooldown ??
							0) *
							1000,
				),
			),
		).toBe(
			false,
		);
		expect(
			isWeaponReadyToShoot(
				weapon.lastStrikedAt,
				weaponCooldownSeconds(
					weapon,
				),
				0,
				nowTime(
					lastShotAt +
						reload *
							1000,
				),
			),
		).toBe(
			true,
		);
		// Attack speed shortens the reload like any cooldown.
		expect(
			isWeaponReadyToShoot(
				weapon.lastStrikedAt,
				weaponCooldownSeconds(
					weapon,
				),
				100,
				nowTime(
					lastShotAt +
						(reload *
							1000) /
							2,
				),
			),
		).toBe(
			true,
		);
		weapon =
			fire(
				weapon,
				lastShotAt +
					reload *
						1000,
			);
		expect(
			weapon.shotsFired,
		).toBe(
			1,
		);
	});

	it("keeps the magazine size and shortens the reload at higher tiers", () => {
		const tier4 =
			weaponAtTier(
				revolver,
				4,
			).statsBonus;
		expect(
			tier4.magazine,
		).toBe(
			6,
		);
		expect(
			tier4.reload ??
				0,
		).toBeLessThan(
			revolver
				.statsBonus
				.reload ??
				0,
		);
	});

	it("does not track a magazine for weapons without one", () => {
		const player =
			playerWith(
				spear,
			);
		expect(
			fire(
				equippedWeapon(
					player,
				),
				1000,
			)
				.shotsFired,
		).toBeUndefined();
	});
});

function requireOne(
	weapons: WeaponState[],
): WeaponState {
	const [
		weapon,
	] =
		weapons;
	if (
		!weapon
	)
		throw new Error(
			"Expected a weapon",
		);
	return weapon;
}

describe("boomerang", () => {
	const generator =
		new ShotMovementEventGenerator();
	const tick =
		deltaTime(
			16,
		);

	function waveState(
		player: BulbroState,
		enemies: EnemyState[],
		shots: ShotState[],
	): WaveState {
		return {
			mapSize:
				{
					width: 4000,
					height: 4000,
				},
			players:
				[
					player,
				],
			enemies,
			objects:
				[],
			shots,
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
					wave: 1,
					difficulty: 0,
					startedAt: 0,
				},
		};
	}

	function throwBoomerang(
		player: BulbroState,
	): ShotState {
		const performed =
			attack(
				player,
				"player",
				equippedWeapon(
					player,
				),
				{
					id: "enemy",
					aimAt:
						{
							x: 1300,
							y: 1000,
						},
				},
				nowTime(
					1000,
				),
				() =>
					0.99,
			);
		if (
			performed?.type !==
			"shot"
		)
			throw new Error(
				"Expected a thrown boomerang",
			);
		return performed.shot;
	}

	/** Flies the shot until it expires, collecting enemy hits. */
	function fly(
		player: BulbroState,
		enemies: EnemyState[],
		thrown: ShotState,
	) {
		let shot:
			| ShotState
			| undefined =
			thrown;
		const hits: string[] =
			[];
		let turnedAround = false;
		for (
			let i = 0;
			i <
				1000 &&
			shot;
			i++
		) {
			const events =
				generator.generate(
					waveState(
						player,
						enemies,
						[
							shot,
						],
					),
					tick,
					nowTime(
						1000 +
							i *
								16,
					),
				);
			hits.push(
				...hitEnemyIds(
					events,
				),
			);
			const current: ShotState =
				shot;
			shot =
				events.some(
					(
						event,
					) =>
						event.type ===
						"shotExpired",
				)
					? undefined
					: current.applyEvents(
							events.map(
								(
									event,
								) => ({
									...event,
									deltaTime:
										tick,
									occurredAt:
										nowTime(
											1000,
										),
								}),
							),
						);
			if (
				shot
					?.boomerang
					?.returning
			)
				turnedAround = true;
		}
		return {
			hits,
			turnedAround,
			expired:
				shot ===
				undefined,
		};
	}

	it("is a projectile that returns to the thrower", () => {
		const player =
			playerWith(
				boomerang,
			);
		const shot =
			throwBoomerang(
				player,
			);
		expect(
			shot.boomerang,
		).toEqual(
			{
				returning: false,
				hitIds:
					[],
			},
		);
		const flight =
			fly(
				player,
				[],
				shot,
			);
		expect(
			flight.turnedAround,
		).toBe(
			true,
		);
		expect(
			flight.expired,
		).toBe(
			true,
		);
	});

	it("hits each enemy once on the way out and once on the way back", () => {
		const player =
			playerWith(
				boomerang,
			);
		const enemies =
			[
				enemyAt(
					"near",
					1150,
					1000,
				),
				enemyAt(
					"far",
					1250,
					1000,
				),
				enemyAt(
					"aside",
					1200,
					1400,
				),
			];
		const flight =
			fly(
				player,
				enemies,
				throwBoomerang(
					player,
				),
			);
		expect(
			flight.hits.toSorted(),
		).toEqual(
			[
				"far",
				"far",
				"near",
				"near",
			],
		);
	});

	it("drops when the thrower is gone", () => {
		const player =
			playerWith(
				boomerang,
			);
		const shot =
			throwBoomerang(
				player,
			);
		const returning =
			shot.applyEvent(
				{
					type: "shotMoved",
					shotId:
						shot.id,
					from: shot.position,
					to: shot.position,
					direction:
						shot.direction,
					boomerang:
						{
							returning: true,
							hitIds:
								[],
						},
					deltaTime:
						tick,
					occurredAt:
						nowTime(
							1000,
						),
				},
			);
		const events =
			generator.generate(
				{
					...waveState(
						player,
						[],
						[
							returning,
						],
					),
					players:
						[],
				},
				tick,
				nowTime(
					1000,
				),
			);
		expect(
			events.map(
				(
					event,
				) =>
					event.type,
			),
		).toEqual(
			[
				"shotExpired",
			],
		);
	});
});

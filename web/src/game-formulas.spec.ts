import {
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "./bulbro/BulbroState";
import { baseStats } from "./characters-definitions/base";
import {
	calculateAttackDamage,
	calculateAttackRange,
	calculateStats,
	calculateWeaponVisualWorldOffset,
	computeStats,
	damageAfterArmor,
	dropChanceWithLuck,
	getDodgeChance,
	getHpRegenerationPerSecond,
	shoot,
} from "./game-formulas";
import {
	addition,
	normalize,
	zeroPoint,
} from "./geometry";
import { uuid } from "./uuid";
import { getWeaponSize } from "./weapon/sprites/WeaponSprite";
import type { WeaponState } from "./weapon/WeaponState";

function createTestBulbro(
	x = 500,
	y = 500,
	facingDirection = {
		x: 1,
		y: 0,
	},
	weapons: WeaponState[] = [],
): BulbroState {
	return new BulbroState(
		{
			statSources:
				[],
			id: "test-player",
			type: "normal",
			position:
				{
					x,
					y,
				},
			level: 1,
			totalExperience: 0,
			materialsAvailable: 0,
			healthPoints: 100,
			stats:
				{
					...baseStats,
					maxHp: 100,
					range: 500,
					speed: 100,
				},
			weapons,
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			rerollCount: 0,
			lastDirection:
				facingDirection,
			lastHorizontalDirection:
				facingDirection.x !==
				0
					? facingDirection.x
					: 1,
		},
	);
}

function createTestWeapon(
	type:
		| "pistol"
		| "smg"
		| "knife" = "pistol",
): WeaponState {
	return {
		id: uuid(),
		type,
		lastStrikedAt: 0,
		statsBonus:
			{
				damage: 5,
				cooldown: 1,
				range: 500,
			},
		shotSpeed: 200,
		aimingDirection:
			zeroPoint(),
	};
}

const scale = 0.125;
const weaponOrbitRadius = 32;
const aimingInfluence = 0.3;
const bulbroBodySize =
	{
		width: 100,
		height: 130,
	};
const bulbroCharacterScaling = 0.25;
const weaponsContainerPosition =
	{
		x:
			-(
				bulbroBodySize.width *
				bulbroCharacterScaling
			) /
			2,
		y:
			-(
				bulbroBodySize.height *
				bulbroCharacterScaling
			) -
			15,
	};
const weaponContainerOffset =
	{
		x:
			(bulbroBodySize.width *
				bulbroCharacterScaling) /
			2,
		y:
			(bulbroBodySize.height *
				bulbroCharacterScaling) /
			2,
	};

describe("shoot", () => {
	const playerPos =
		{
			x: 500,
			y: 500,
		};
	const facingRight =
		{
			x: 1,
			y: 0,
		};

	function shootAt(
		aimX: number,
		aimY: number,
	) {
		const weapon =
			createTestWeapon(
				"pistol",
			);
		const aimingDirection =
			normalize(
				{
					x: aimX,
					y: aimY,
				},
			);
		weapon.aimingDirection =
			aimingDirection;
		const player =
			createTestBulbro(
				playerPos.x,
				playerPos.y,
				facingRight,
				[
					weapon,
				],
			);
		const weaponVisualOffset =
			calculateWeaponVisualWorldOffset(
				weapon,
				0,
				1,
				facingRight.x,
			);
		const weaponCenter =
			addition(
				playerPos,
				weaponVisualOffset,
			);
		const expectedWeaponCenter =
			{
				x:
					playerPos.x +
					weaponOrbitRadius +
					aimingDirection.x *
						aimingInfluence *
						weaponOrbitRadius +
					weaponContainerOffset.x +
					weaponsContainerPosition.x,
				y:
					playerPos.y +
					aimingDirection.y *
						aimingInfluence *
						weaponOrbitRadius +
					weaponContainerOffset.y +
					weaponsContainerPosition.y,
			};
		const halfWidth =
			(getWeaponSize(
				"pistol",
			)
				.width /
				2) *
			scale;
		// Target far away in the aim direction from weapon visual center
		const target =
			{
				x:
					weaponCenter.x +
					aimingDirection.x *
						1000,
				y:
					weaponCenter.y +
					aimingDirection.y *
						1000,
			};
		const shot =
			shoot(
				player,
				"player",
				weapon,
				target,
			);
		return {
			shot,
			weaponCenter,
			expectedWeaponCenter,
			halfWidth,
		};
	}

	it("matches BulbaSprite weapons container positioning", () => {
		const {
			weaponCenter,
			expectedWeaponCenter,
		} =
			shootAt(
				1,
				0,
			);

		expect(
			weaponCenter.x,
		).toBeCloseTo(
			expectedWeaponCenter.x,
			1,
		);
		expect(
			weaponCenter.y,
		).toBeCloseTo(
			expectedWeaponCenter.y,
			1,
		);
	});

	it("starts shot from right of weapon center when aiming right (1, 0)", () => {
		const {
			shot,
			weaponCenter,
			halfWidth,
		} =
			shootAt(
				1,
				0,
			);

		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x +
				halfWidth,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y,
			1,
		);
	});

	it("starts shot from above weapon center when aiming up (0, -1)", () => {
		const {
			shot,
			weaponCenter,
			halfWidth,
		} =
			shootAt(
				0,
				-1,
			);

		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y -
				halfWidth,
			1,
		);
	});

	it("starts shot from below weapon center when aiming down (0, 1)", () => {
		const {
			shot,
			weaponCenter,
			halfWidth,
		} =
			shootAt(
				0,
				1,
			);

		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y +
				halfWidth,
			1,
		);
	});

	it("starts shot from top-right of weapon center when aiming at (1, -1)", () => {
		const {
			shot,
			weaponCenter,
			halfWidth,
		} =
			shootAt(
				1,
				-1,
			);

		const sqrt2 =
			Math.SQRT2 /
			2;
		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x +
				halfWidth *
					sqrt2,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y -
				halfWidth *
					sqrt2,
			1,
		);
	});

	it("starts shot from bottom-right of weapon center when aiming at (1, 1)", () => {
		const {
			shot,
			weaponCenter,
			halfWidth,
		} =
			shootAt(
				1,
				1,
			);

		const sqrt2 =
			Math.SQRT2 /
			2;
		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x +
				halfWidth *
					sqrt2,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y +
				halfWidth *
					sqrt2,
			1,
		);
	});

	it("starts shot from left of weapon center when aiming left (-1, 0)", () => {
		const {
			shot,
			weaponCenter,
			halfWidth,
		} =
			shootAt(
				-1,
				0,
			);

		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x -
				halfWidth,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y,
			1,
		);
	});

	it("starts shot from weapon center when not aiming (0, 0)", () => {
		const {
			shot,
			weaponCenter,
		} =
			shootAt(
				0,
				0,
			);

		expect(
			shot
				.position
				.x,
		).toBeCloseTo(
			weaponCenter.x,
			1,
		);
		expect(
			shot
				.position
				.y,
		).toBeCloseTo(
			weaponCenter.y,
			1,
		);
	});
});

function weaponState(
	type: WeaponState["type"],
	statsBonus: WeaponState["statsBonus"],
): WeaponState {
	return {
		id: uuid(),
		type,
		lastStrikedAt: 0,
		statsBonus,
		shotSpeed: 1000,
		aimingDirection:
			zeroPoint(),
	};
}

const noCrit =
	() =>
		0.999;
const crit =
	() =>
		0;

describe("computeStats", () => {
	it("gives base-0 stats their points", () => {
		const stats =
			calculateStats(
				{
					damage: 60,
					attackSpeed: 25,
					critChance: 15,
					luck: 50,
				},
			);
		expect(
			stats.damage,
		).toBe(
			60,
		);
		expect(
			stats.attackSpeed,
		).toBe(
			25,
		);
		expect(
			stats.critChance,
		).toBe(
			15,
		);
		expect(
			stats.luck,
		).toBe(
			50,
		);
	});

	it("applies speed and pickup range as a percentage of their base", () => {
		const stats =
			calculateStats(
				{
					speed: 10,
					pickupRange:
						-50,
				},
			);
		expect(
			stats.speed,
		).toBe(
			baseStats.speed *
				1.1,
		);
		expect(
			stats.pickupRange,
		).toBe(
			baseStats.pickupRange *
				0.5,
		);
	});

	it("sums points of every source", () => {
		const stats =
			computeStats(
				[
					{
						id: "character",
						kind: "character",
						bonuses:
							{
								maxHp: 5,
								speed: 5,
								armor: 1,
							},
					},
					{
						id: "upgrade-1",
						kind: "upgrade",
						bonuses:
							{
								maxHp: 3,
								speed: 5,
							},
					},
					{
						id: "item-1",
						kind: "item",
						bonuses:
							{
								armor: 2,
							},
					},
				],
			);
		expect(
			stats.maxHp,
		).toBe(
			baseStats.maxHp +
				8,
		);
		expect(
			stats.speed,
		).toBe(
			baseStats.speed *
				1.1,
		);
		expect(
			stats.armor,
		).toBe(
			3,
		);
	});

	it("keeps at least 1 max HP", () => {
		expect(
			calculateStats(
				{
					maxHp:
						-100,
				},
			)
				.maxHp,
		).toBe(
			1,
		);
	});
});

describe("calculateAttackDamage", () => {
	const player =
		(
			stats: Parameters<
				typeof calculateStats
			>[0],
		) => ({
			stats:
				calculateStats(
					stats,
				),
		});

	it("adds scaled damage stats to the weapon damage", () => {
		const weapon =
			weaponState(
				"pistol",
				{
					damage: 10,
					scaling:
						{
							rangedDamage: 0.5,
							elementalDamage: 1,
						},
				},
			);
		expect(
			calculateAttackDamage(
				player(
					{
						rangedDamage: 4,
						elementalDamage: 3,
						meleeDamage: 100,
					},
				),
				weapon,
				"player",
				noCrit,
			),
		).toBe(
			10 +
				2 +
				3,
		);
	});

	it("defaults to melee scaling for melee weapons and ranged scaling for guns", () => {
		const stats =
			player(
				{
					meleeDamage: 5,
					rangedDamage: 2,
				},
			);
		expect(
			calculateAttackDamage(
				stats,
				weaponState(
					"sword",
					{
						damage: 10,
					},
				),
				"player",
				noCrit,
			),
		).toBe(
			15,
		);
		expect(
			calculateAttackDamage(
				stats,
				weaponState(
					"pistol",
					{
						damage: 10,
					},
				),
				"player",
				noCrit,
			),
		).toBe(
			12,
		);
	});

	it("multiplies by the damage percentage and rounds", () => {
		const weapon =
			weaponState(
				"pistol",
				{
					damage: 10,
					scaling:
						{},
				},
			);
		expect(
			calculateAttackDamage(
				player(
					{
						damage: 25,
					},
				),
				weapon,
				"player",
				noCrit,
			),
		).toBe(
			13,
		);
		expect(
			calculateAttackDamage(
				player(
					{
						damage:
							-50,
					},
				),
				weapon,
				"player",
				noCrit,
			),
		).toBe(
			5,
		);
	});

	it("deals at least 1 damage", () => {
		const weapon =
			weaponState(
				"pistol",
				{
					damage: 1,
					scaling:
						{},
				},
			);
		expect(
			calculateAttackDamage(
				player(
					{
						damage:
							-90,
					},
				),
				weapon,
				"player",
				noCrit,
			),
		).toBe(
			1,
		);
	});

	it("multiplies critical hits by the weapon crit multiplier", () => {
		const weapon =
			weaponState(
				"knife",
				{
					damage: 10,
					critChance: 20,
					critMultiplier: 2.5,
					scaling:
						{},
				},
			);
		expect(
			calculateAttackDamage(
				player(
					{},
				),
				weapon,
				"player",
				crit,
			),
		).toBe(
			25,
		);
		expect(
			calculateAttackDamage(
				player(
					{},
				),
				weapon,
				"player",
				noCrit,
			),
		).toBe(
			10,
		);
	});

	it("adds player and weapon crit chance", () => {
		const weapon =
			weaponState(
				"pistol",
				{
					damage: 10,
					critChance: 10,
					scaling:
						{},
				},
			);
		// roll of 25% is a crit only with the player's +20 crit chance
		const roll =
			() =>
				0.25;
		expect(
			calculateAttackDamage(
				player(
					{},
				),
				weapon,
				"player",
				roll,
			),
		).toBe(
			10,
		);
		expect(
			calculateAttackDamage(
				player(
					{
						critChance: 20,
					},
				),
				weapon,
				"player",
				roll,
			),
		).toBe(
			20,
		);
	});

	it("never crits without crit chance", () => {
		const weapon =
			weaponState(
				"pistol",
				{
					damage: 10,
					scaling:
						{},
				},
			);
		expect(
			calculateAttackDamage(
				player(
					{},
				),
				weapon,
				"player",
				crit,
			),
		).toBe(
			10,
		);
	});

	it("uses flat damage for enemies", () => {
		const weapon =
			weaponState(
				"orcGun",
				{
					damage: 5,
				},
			);
		expect(
			calculateAttackDamage(
				{
					stats:
						{
							...baseStats,
							damage: 1.5,
						},
				},
				weapon,
				"enemy",
				crit,
			),
		).toBe(
			6.5,
		);
	});
});

describe("calculateAttackRange", () => {
	const attacker =
		{
			stats:
				{
					range: 100,
				},
		};

	it("gives ranged weapons the full range stat", () => {
		expect(
			calculateAttackRange(
				attacker,
				weaponState(
					"pistol",
					{
						range: 400,
					},
				),
				"player",
			),
		).toBe(
			500,
		);
	});

	it("gives players' melee weapons half of the range stat", () => {
		expect(
			calculateAttackRange(
				attacker,
				weaponState(
					"sword",
					{
						range: 80,
					},
				),
				"player",
			),
		).toBe(
			130,
		);
	});

	it("gives enemies the full range stat", () => {
		expect(
			calculateAttackRange(
				attacker,
				weaponState(
					"enemyFist",
					{
						range: 0,
					},
				),
				"enemy",
			),
		).toBe(
			100,
		);
	});
});

describe("damageAfterArmor", () => {
	it("keeps the damage without armor", () => {
		expect(
			damageAfterArmor(
				10,
				0,
			),
		).toBe(
			10,
		);
	});

	it("halves the damage at 15 armor", () => {
		expect(
			damageAfterArmor(
				10,
				15,
			),
		).toBe(
			5,
		);
	});

	it("doubles the damage at -15 armor", () => {
		expect(
			damageAfterArmor(
				10,
				-15,
			),
		).toBe(
			20,
		);
	});

	it("deals at least 1 damage", () => {
		expect(
			damageAfterArmor(
				2,
				100,
			),
		).toBe(
			1,
		);
	});

	it("keeps harmless hits harmless", () => {
		expect(
			damageAfterArmor(
				0,
				-15,
			),
		).toBe(
			0,
		);
	});
});

describe("getDodgeChance", () => {
	it("converts dodge points to a probability capped at 60%", () => {
		expect(
			getDodgeChance(
				0,
			),
		).toBe(
			0,
		);
		expect(
			getDodgeChance(
				30,
			),
		).toBe(
			0.3,
		);
		expect(
			getDodgeChance(
				90,
			),
		).toBe(
			0.6,
		);
		expect(
			getDodgeChance(
				-10,
			),
		).toBe(
			0,
		);
	});
});

describe("getHpRegenerationPerSecond", () => {
	it("does not regenerate without HP regeneration", () => {
		expect(
			getHpRegenerationPerSecond(
				0,
			),
		).toBe(
			0,
		);
		expect(
			getHpRegenerationPerSecond(
				-3,
			),
		).toBe(
			0,
		);
	});

	it("heals 1 HP every 5 seconds at 1 HP regeneration", () => {
		expect(
			getHpRegenerationPerSecond(
				1,
			),
		).toBe(
			0.2,
		);
	});

	it("heals faster with more HP regeneration", () => {
		expect(
			getHpRegenerationPerSecond(
				10,
			),
		).toBeCloseTo(
			1,
			5,
		);
	});
});

describe("dropChanceWithLuck", () => {
	it("scales the drop chance by luck", () => {
		expect(
			dropChanceWithLuck(
				0.01,
				0,
			),
		).toBe(
			0.01,
		);
		expect(
			dropChanceWithLuck(
				0.01,
				100,
			),
		).toBe(
			0.02,
		);
		expect(
			dropChanceWithLuck(
				0.01,
				-100,
			),
		).toBe(
			0,
		);
		expect(
			dropChanceWithLuck(
				0.8,
				100,
			),
		).toBe(
			1,
		);
	});
});

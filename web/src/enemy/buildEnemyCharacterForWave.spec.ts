import {
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import {
	buildEnemyCharacterForWave,
	ENDLESS_START_WAVE,
	type EnemyCharacter,
	getEndlessFactor,
} from "./";

describe("buildEnemyCharacterForWave", () => {
	let baseEnemy: EnemyCharacter;

	beforeEach(
		() => {
			baseEnemy =
				{
					id: "test-enemy",
					name: "Test Enemy",
					sprite:
						"potatoBeetleBaby",
					stats:
						{
							maxHp: 10,
							hpRegeneration: 1,
							damage: 2,
							meleeDamage: 3,
							rangedDamage: 4,
							elementalDamage: 5,
							attackSpeed: 1.5,
							critChance: 0.1,
							range: 200,
							armor: 0,
							dodge: 0.05,
							speed: 100,
							materialsDropped: 1,
							knockback: 0,
						},
					waveIncreaseStats:
						{
							maxHp: 5,
							damage: 1,
						},
					weapons:
						[],
					consumableDropChance: 0.01,
				};
		},
	);

	it("should return enemy with unchanged stats for wave 1", () => {
		const result =
			buildEnemyCharacterForWave(
				baseEnemy,
				1,
			);

		expect(
			result
				.stats
				.maxHp,
		).toBe(
			10,
		);
		expect(
			result
				.stats
				.damage,
		).toBe(
			2,
		);
		expect(
			result
				.stats
				.hpRegeneration,
		).toBe(
			1,
		);
	});

	it("should increase stats by 2 waveIncreaseStats on wave 3", () => {
		const result =
			buildEnemyCharacterForWave(
				baseEnemy,
				3,
			);

		expect(
			result
				.stats
				.maxHp,
		).toBe(
			10 +
				5 *
					2,
		);
		expect(
			result
				.stats
				.damage,
		).toBe(
			2 +
				1 *
					2,
		);
	});

	it("should not modify the original enemy", () => {
		const originalMaxHp =
			baseEnemy
				.stats
				.maxHp;
		const originalDamage =
			baseEnemy
				.stats
				.damage;

		buildEnemyCharacterForWave(
			baseEnemy,
			5,
		);

		expect(
			baseEnemy
				.stats
				.maxHp,
		).toBe(
			originalMaxHp,
		);
		expect(
			baseEnemy
				.stats
				.damage,
		).toBe(
			originalDamage,
		);
	});

	it("should preserve other properties of the enemy", () => {
		const result =
			buildEnemyCharacterForWave(
				baseEnemy,
				2,
			);

		expect(
			result.id,
		).toBe(
			"test-enemy",
		);
		expect(
			result.name,
		).toBe(
			"Test Enemy",
		);
		expect(
			result.sprite,
		).toBe(
			"potatoBeetleBaby",
		);
		expect(
			result.weapons,
		).toEqual(
			[],
		);
		expect(
			result.waveIncreaseStats,
		).toEqual(
			{
				maxHp: 5,
				damage: 1,
			},
		);
	});
});

describe("getEndlessFactor", () => {
	it("is zero up to the endless start", () => {
		expect(
			getEndlessFactor(
				1,
			),
		).toBe(
			0,
		);
		expect(
			getEndlessFactor(
				ENDLESS_START_WAVE,
			),
		).toBe(
			0,
		);
	});

	it("follows Brotato's endless curve shifted by the endless start", () => {
		// Brotato values for waves 21, 25, 30, 35 and 40
		for (const [
			endlessWave,
			factor,
		] of [
			[
				1,
				0.02,
			],
			[
				5,
				0.3,
			],
			[
				10,
				1.1,
			],
			[
				15,
				2.4,
			],
			[
				20,
				6.3,
			],
		] as const) {
			expect(
				getEndlessFactor(
					ENDLESS_START_WAVE +
						endlessWave,
				),
			).toBeCloseTo(
				factor,
			);
		}
	});
});

describe("buildEnemyCharacterForWave in endless waves", () => {
	const enemy: EnemyCharacter =
		{
			id: "endless-enemy",
			name: "Endless Enemy",
			sprite:
				"potatoBeetleBaby",
			stats:
				{
					maxHp: 10,
					hpRegeneration: 0,
					damage: 2,
					meleeDamage: 0,
					rangedDamage: 0,
					elementalDamage: 0,
					attackSpeed: 0,
					critChance: 0,
					range: 100,
					armor: 0,
					dodge: 0,
					speed: 100,
					materialsDropped: 1,
					knockback: 0,
				},
			speedRange:
				{
					from: 100,
					to: 200,
				},
			waveIncreaseStats:
				{
					maxHp: 1,
					damage: 1,
				},
			weapons:
				[],
			consumableDropChance: 0,
		};

	it("keeps linear growth on the endless start wave", () => {
		const result =
			buildEnemyCharacterForWave(
				enemy,
				ENDLESS_START_WAVE,
			);
		expect(
			result
				.stats
				.maxHp,
		).toBe(
			10 +
				(ENDLESS_START_WAVE -
					1),
		);
		expect(
			result
				.stats
				.speed,
		).toBe(
			100,
		);
		expect(
			result.speedRange,
		).toEqual(
			enemy.speedRange,
		);
	});

	it("multiplies linear growth by the endless factor afterwards", () => {
		const wave =
			ENDLESS_START_WAVE +
			10;
		const factor =
			getEndlessFactor(
				wave,
			);
		const result =
			buildEnemyCharacterForWave(
				enemy,
				wave,
			);
		expect(
			result
				.stats
				.maxHp,
		).toBeCloseTo(
			(10 +
				(wave -
					1)) *
				(1 +
					factor *
						2.25),
		);
		expect(
			result
				.stats
				.damage,
		).toBeCloseTo(
			(2 +
				(wave -
					1)) *
				(1 +
					factor),
		);
		expect(
			result
				.stats
				.speed,
		).toBeCloseTo(
			100 *
				(1 +
					factor /
						13.33),
		);
		expect(
			result
				.speedRange
				?.to,
		).toBeCloseTo(
			200 *
				(1 +
					factor /
						13.33),
		);
		expect(
			result
				.stats
				.materialsDropped,
		).toBe(
			1,
		);
	});

	it("caps the speed bonus at +175%", () => {
		const result =
			buildEnemyCharacterForWave(
				enemy,
				ENDLESS_START_WAVE +
					100,
			);
		expect(
			result
				.stats
				.speed,
		).toBeCloseTo(
			275,
		);
	});
});

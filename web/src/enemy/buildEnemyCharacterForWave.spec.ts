import {
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import {
	buildEnemyCharacterForWave,
	type EnemyCharacter,
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
				};
		},
	);

	it("should return enemy with unchanged stats for wave 0", () => {
		const result =
			buildEnemyCharacterForWave(
				baseEnemy,
				0,
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

	it("should increase stats by waveIncreaseStats * waveNumber", () => {
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
					3,
		);
		expect(
			result
				.stats
				.damage,
		).toBe(
			2 +
				1 *
					3,
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

	it("should handle wave number of 1", () => {
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
			10 +
				5,
		);
		expect(
			result
				.stats
				.damage,
		).toBe(
			2 +
				1,
		);
	});
});

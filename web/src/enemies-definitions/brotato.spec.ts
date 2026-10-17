import {
	expect,
	it,
} from "bun:test";
import {
	buildEnemyCharacterForWave,
	spawnEnemy,
} from "@/enemy";
import { zeroPoint } from "@/geometry";
import { nowTime } from "@/time";
import {
	aphidEnemy,
	babyEnemy,
	beetleWarrior,
	coloradoBeetle,
	tree,
	wildBoar,
} from "./index";

// HP and damage are based on wave 1; Spitter's projectile growth is 0.75.
// Reference: https://brotato.wiki.spellsandguns.com/Enemies (2026-10-17).
for (const [
	enemy,
	hp,
	hpGrowth,
	damage,
	damageGrowth,
	speed,
	materials,
	resistance,
	chance,
] of [
	[
		babyEnemy,
		3,
		2,
		1,
		0.6,
		200,
		1,
		0,
		0.01,
	],
	[
		coloradoBeetle,
		1,
		1,
		1,
		0.6,
		380,
		1,
		0,
		0.02,
	],
	[
		aphidEnemy,
		8,
		1,
		1,
		0.75,
		200,
		1,
		0.95,
		0.03,
	],
	[
		wildBoar,
		4,
		2.5,
		1,
		0.85,
		400,
		1,
		0.8,
		0.01,
	],
	[
		beetleWarrior,
		20,
		11,
		2,
		0.85,
		300,
		3,
		0.9,
		0.03,
	],
	[
		tree,
		10,
		5,
		0,
		0,
		0,
		3,
		1,
		1,
	],
] as const) {
	it(`${enemy.name} matches its analogue at early and late waves`, () => {
		for (const wave of [
			1,
			2,
			10,
			20,
		]) {
			const scaled =
				buildEnemyCharacterForWave(
					enemy,
					wave,
				);
			expect(
				scaled
					.stats
					.maxHp,
			).toBeCloseTo(
				hp +
					hpGrowth *
						(wave -
							1),
			);
			expect(
				scaled
					.stats
					.damage,
			).toBeCloseTo(
				damage +
					damageGrowth *
						(wave -
							1),
			);
			expect(
				scaled
					.stats
					.speed,
			).toBe(
				speed,
			);
			expect(
				scaled
					.stats
					.attackSpeed,
			).toBe(
				0,
			);
			expect(
				scaled
					.stats
					.materialsDropped,
			).toBe(
				materials,
			);
			expect(
				scaled
					.stats
					.knockbackResistance,
			).toBe(
				resistance,
			);
			expect(
				scaled.consumableDropChance,
			).toBe(
				chance,
			);
		}
	});
	it(`${enemy.name} applies its knockback resistance to a surviving hit`, () => {
		const target =
			spawnEnemy(
				"target",
				zeroPoint(),
				buildEnemyCharacterForWave(
					enemy,
					20,
				),
				() =>
					0,
			);
		const event =
			target.beHit(
				{
					damage: 1,
				},
				nowTime(
					1000,
				),
				{
					strength: 10,
					direction:
						{
							x: 1,
							y: 0,
						},
				},
			);
		if (
			event.type !==
			"enemyReceivedHit"
		)
			throw new Error(
				"Expected a surviving enemy",
			);
		expect(
			event
				.knockback
				?.strength ??
				0,
		).toBeCloseTo(
			10 *
				(1 -
					resistance),
		);
	});
}
it("rolls Baby speed per spawn inside the reference interval", () => {
	expect(
		spawnEnemy(
			"slow",
			zeroPoint(),
			babyEnemy,
			() =>
				0,
		)
			.stats
			.speed,
	).toBe(
		200,
	);
	expect(
		spawnEnemy(
			"fast",
			zeroPoint(),
			babyEnemy,
			() =>
				0.999,
		)
			.stats
			.speed,
	).toBeCloseTo(
		299.9,
	);
	expect(
		babyEnemy
			.stats
			.speed,
	).toBe(
		200,
	);
});

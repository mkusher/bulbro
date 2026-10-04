import {
	describe,
	expect,
	it,
} from "bun:test";
import { spawnBulbro } from "../bulbro/BulbroState";
import { wellRoundedBulbro } from "../characters-definitions";
import { generateWeaponShopItems } from "../shop/ShopItemsGenerator";
import { nowTime } from "../time";
import {
	fromWeaponState,
	getWeaponByType,
	toWeaponState,
} from "../weapon";
import { attack } from "../weapon/Attack";
import {
	bazooka,
	flareGun,
	grenade,
	machineGun,
	weapons,
} from "./index";

describe("new ranged weapons", () => {
	for (const weapon of [
		flareGun,
		grenade,
		machineGun,
		bazooka,
	]) {
		it(`${weapon.name} is available in the shop and resolves from equipped state`, () => {
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
				item?.weapon,
			).toBe(
				weapon,
			);
			expect(
				item?.price,
			).toBeGreaterThan(
				0,
			);
		});

		it(`${weapon.name} fires a projectile using its own stats`, () => {
			const player =
				spawnBulbro(
					"shooter",
					"normal",
					{
						x: 100,
						y: 100,
					},
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
			const equipped =
				player
					.weapons[0];
			if (
				!equipped
			)
				throw new Error(
					"Expected the weapon to be equipped",
				);
			if (
				weapon
					.statsBonus
					.range ===
					undefined ||
				weapon
					.statsBonus
					.damage ===
					undefined ||
				weapon
					.statsBonus
					.knockback ===
					undefined
			)
				throw new Error(
					"Expected the weapon to define range, damage, and knockback",
				);
			const result =
				attack(
					player,
					"player",
					equipped,
					{
						id: "target",
						aimAt:
							{
								x: 300,
								y: 100,
							},
					},
					nowTime(
						1000,
					),
					() =>
						0.99,
				);
			expect(
				result?.type,
			).toBe(
				"shot",
			);
			if (
				result?.type !==
				"shot"
			)
				throw new Error(
					"Expected a projectile",
				);
			expect(
				result
					.shot
					.weaponType,
			).toBe(
				weapon.id,
			);
			expect(
				result
					.shot
					.damage,
			).toBe(
				weapon
					.statsBonus
					.damage,
			);
			expect(
				result
					.shot
					.speed,
			).toBe(
				weapon.shotSpeed,
			);
			expect(
				result
					.shot
					.range,
			).toBeGreaterThanOrEqual(
				weapon
					.statsBonus
					.range,
			);
			expect(
				result
					.shot
					.knockback,
			).toBe(
				weapon
					.statsBonus
					.knockback,
			);
			expect(
				Number.isFinite(
					result
						.shot
						.position
						.x,
				),
			).toBe(
				true,
			);
			expect(
				result
					.shot
					.position
					.x,
			).toBeGreaterThan(
				player
					.position
					.x,
			);
		});
	}

	for (const weapon of [
		grenade,
		bazooka,
	]) {
		it(`${weapon.name} fires shots exploding within its explosion radius`, () => {
			expect(
				weapon
					.attack
					.type,
			).toBe(
				"explosion",
			);
			const player =
				spawnBulbro(
					"shooter",
					"normal",
					{
						x: 100,
						y: 100,
					},
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
			const equipped =
				player
					.weapons[0];
			if (
				!equipped
			)
				throw new Error(
					"Expected the weapon to be equipped",
				);
			const result =
				attack(
					player,
					"player",
					equipped,
					{
						id: "target",
						aimAt:
							{
								x: 300,
								y: 100,
							},
					},
					nowTime(
						1000,
					),
					() =>
						0.99,
				);
			if (
				result?.type !==
				"shot"
			)
				throw new Error(
					"Expected a projectile",
				);
			expect(
				result
					.shot
					.explosionRadius,
			).toBe(
				weapon
					.statsBonus
					.explosionRadius ??
					0,
			);
			expect(
				result
					.shot
					.explosionRadius,
			).toBeGreaterThan(
				0,
			);
			expect(
				result
					.shot
					.isExplosive,
			).toBe(
				true,
			);
		});
	}
});

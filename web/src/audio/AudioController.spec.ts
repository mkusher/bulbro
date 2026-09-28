import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	aphidGun,
	fist,
	laserGun,
	orcFist,
	orcSlowGun,
	pistol,
	sword,
} from "@/weapons-definitions";
import { weaponSound } from "./AudioController";

describe("weaponSound", () => {
	it("uses the laser sound only for the laser gun", () => {
		expect(
			weaponSound(
				laserGun,
			),
		).toBe(
			"laser",
		);
		expect(
			weaponSound(
				pistol,
			),
		).toBe(
			"gunshot",
		);
	});

	it("uses a dedicated sound for enemy guns", () => {
		expect(
			weaponSound(
				orcSlowGun,
			),
		).toBe(
			"enemyShot",
		);
		expect(
			weaponSound(
				aphidGun,
			),
		).toBe(
			"enemyShot",
		);
	});

	it("uses the hit sound for melee weapons", () => {
		expect(
			weaponSound(
				fist,
			),
		).toBe(
			"kick",
		);
		expect(
			weaponSound(
				sword,
			),
		).toBe(
			"kick",
		);
		expect(
			weaponSound(
				orcFist,
			),
		).toBe(
			"kick",
		);
	});
});

import {
	describe,
	expect,
	it,
} from "bun:test";
import type { WeaponState } from "../WeaponState";
import {
	computeRecoil,
	computeSway,
	RECOIL_DURATION_MS,
	recoilDistance,
} from "./WeaponsSprite";

function weapon(
	type: WeaponState["type"],
	knockback: number,
	lastStrikedAt = 1000,
) {
	return {
		type,
		lastStrikedAt,
		statsBonus:
			{
				knockback,
			},
	};
}

describe("computeRecoil", () => {
	it("pushes guns back right after a shot and returns to rest", () => {
		const pistol =
			weapon(
				"pistol",
				15,
			);
		const peak =
			Math.max(
				...Array.from(
					{
						length:
							RECOIL_DURATION_MS,
					},
					(
						_,
						i,
					) =>
						computeRecoil(
							pistol,
							1000 +
								i,
						),
				),
			);
		expect(
			peak,
		).toBeCloseTo(
			recoilDistance(
				15,
			),
			1,
		);
		expect(
			computeRecoil(
				pistol,
				1000 +
					RECOIL_DURATION_MS,
			),
		).toBe(
			0,
		);
		expect(
			computeRecoil(
				pistol,
				999,
			),
		).toBe(
			0,
		);
	});

	it("kicks harder for guns with bigger knockback", () => {
		const at =
			1000 +
			RECOIL_DURATION_MS *
				0.3;
		expect(
			computeRecoil(
				weapon(
					"bazooka",
					18,
				),
				at,
			),
		).toBeGreaterThan(
			computeRecoil(
				weapon(
					"smg",
					0,
				),
				at,
			),
		);
	});

	it("doesn't push back non-gun weapons", () => {
		expect(
			computeRecoil(
				weapon(
					"knife",
					15,
				),
				1030,
			),
		).toBe(
			0,
		);
	});
});

describe("computeSway", () => {
	it("moves weapons in different slots out of step", () => {
		expect(
			computeSway(
				0,
				500,
			),
		).not.toEqual(
			computeSway(
				1,
				500,
			),
		);
	});

	it("stays small", () => {
		for (
			let now = 0;
			now <
			2000;
			now += 50
		) {
			const sway =
				computeSway(
					0,
					now,
				);
			expect(
				Math.abs(
					sway
						.offset
						.y,
				),
			).toBeLessThanOrEqual(
				2,
			);
			expect(
				Math.abs(
					sway.rotation,
				),
			).toBeLessThanOrEqual(
				0.12,
			);
		}
	});
});

import {
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "./bulbro/BulbroState";
import { baseStats } from "./characters-definitions/base";
import {
	calculateWeaponVisualWorldOffset,
	shoot,
} from "./game-formulas";
import {
	addition,
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
			id: "test-player",
			type: "normal",
			position:
				{
					x,
					y,
				},
			speed: 100,
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
			lastDirection:
				facingDirection,
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
				attackSpeed: 1,
				range: 500,
			},
		shotSpeed: 200,
		aimingDirection:
			zeroPoint(),
	};
}

const scale = 0.125;

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
		weapon.aimingDirection =
			{
				x: aimX,
				y: aimY,
			};
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
				facingRight,
			);
		const weaponCenter =
			addition(
				playerPos,
				weaponVisualOffset,
			);
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
					aimX *
						1000,
				y:
					weaponCenter.y +
					aimY *
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
			halfWidth,
		};
	}

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

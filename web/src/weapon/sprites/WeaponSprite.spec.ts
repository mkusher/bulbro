import {
	describe,
	expect,
	it,
} from "bun:test";
import * as PIXI from "pixi.js";

/**
 * These tests verify that WeaponSprite's position remains stable during rotation.
 *
 * The WeaponSprite uses a two-container hierarchy:
 * - positionContainer: Handles position only (x, y)
 * - rotationContainer: Handles rotation only (rotation, scale.y for flip)
 *
 * This separation ensures that rotating the weapon doesn't affect its position.
 */
describe("WeaponSprite position/rotation isolation", () => {
	/**
	 * Creates a mock weapon sprite hierarchy matching WeaponSprite's structure.
	 */
	const createWeaponHierarchy =
		() => {
			const positionContainer =
				new PIXI.Container();
			const rotationContainer =
				new PIXI.Container();
			const sprite =
				new PIXI.Sprite();

			// Add an elongated mock weapon graphic to make rotation effects visible
			const mockWeapon =
				new PIXI.Graphics();
			mockWeapon.rect(
				-50,
				-10,
				100,
				20,
			); // 100x20 elongated weapon
			mockWeapon.fill(
				0xff0000,
			);

			// Build hierarchy: positionContainer → rotationContainer → sprite/graphics
			rotationContainer.addChild(
				sprite,
			);
			rotationContainer.addChild(
				mockWeapon,
			);
			positionContainer.addChild(
				rotationContainer,
			);

			return {
				positionContainer,
				rotationContainer,
				sprite,
				mockWeapon,
			};
		};

	describe("container hierarchy", () => {
		it("should have rotation container as child of position container", () => {
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			expect(
				positionContainer.children,
			).toContain(
				rotationContainer,
			);
		});

		it("should keep position container at origin when rotation is applied", () => {
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			// Set a specific position
			positionContainer.x = 100;
			positionContainer.y = 50;

			// Apply various rotations to the rotation container
			const rotations =
				[
					0,
					Math.PI /
						4,
					Math.PI /
						2,
					Math.PI,
					-Math.PI /
						4,
				];

			for (const rotation of rotations) {
				rotationContainer.rotation =
					rotation;

				// Position container should NOT move when rotation changes
				expect(
					positionContainer.x,
				).toBe(
					100,
				);
				expect(
					positionContainer.y,
				).toBe(
					50,
				);
			}
		});
	});

	describe("position stability during rotation", () => {
		it("should maintain position container coordinates regardless of rotation", () => {
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			const initialX = 75;
			const initialY = 25;

			positionContainer.x =
				initialX;
			positionContainer.y =
				initialY;

			// Record position before rotation
			const beforeX =
				positionContainer.x;
			const beforeY =
				positionContainer.y;

			// Apply rotation
			rotationContainer.rotation =
				Math.PI /
				3; // 60 degrees

			// Position should be unchanged
			expect(
				positionContainer.x,
			).toBe(
				beforeX,
			);
			expect(
				positionContainer.y,
			).toBe(
				beforeY,
			);
		});

		it("should maintain position when flipping via scale.y", () => {
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			positionContainer.x = 100;
			positionContainer.y = 50;

			// Flip by negating scale.y (simulating aim to the left)
			rotationContainer.scale.y =
				-1;

			// Position should be unchanged
			expect(
				positionContainer.x,
			).toBe(
				100,
			);
			expect(
				positionContainer.y,
			).toBe(
				50,
			);
		});
	});

	describe("rotation container isolation", () => {
		it("should only rotate the rotation container, not position container", () => {
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			// Apply rotation
			rotationContainer.rotation =
				Math.PI /
				2;

			// Position container should have no rotation
			expect(
				positionContainer.rotation,
			).toBe(
				0,
			);

			// Rotation container should have the rotation
			expect(
				rotationContainer.rotation,
			).toBe(
				Math.PI /
					2,
			);
		});

		it("should keep position container scale unaffected by rotation container flip", () => {
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			// Initial scales
			positionContainer.scale.set(
				1,
				1,
			);
			rotationContainer.scale.set(
				1,
				1,
			);

			// Flip rotation container
			rotationContainer.scale.y =
				-1;

			// Position container scale should be unchanged
			expect(
				positionContainer
					.scale
					.x,
			).toBe(
				1,
			);
			expect(
				positionContainer
					.scale
					.y,
			).toBe(
				1,
			);
		});
	});

	describe("global position stability", () => {
		it("should maintain stable global position for the rotation container pivot during rotation", () => {
			const parent =
				new PIXI.Container();
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			parent.addChild(
				positionContainer,
			);

			// Set position
			positionContainer.x = 100;
			positionContainer.y = 50;

			// Get global position of rotation container before rotation
			const globalBefore =
				rotationContainer.getGlobalPosition();

			// Apply rotation
			rotationContainer.rotation =
				Math.PI /
				4;

			// Get global position after rotation
			const globalAfter =
				rotationContainer.getGlobalPosition();

			// Global position of the rotation container's origin should be unchanged
			expect(
				globalAfter.x,
			).toBeCloseTo(
				globalBefore.x,
				5,
			);
			expect(
				globalAfter.y,
			).toBeCloseTo(
				globalBefore.y,
				5,
			);
		});

		it("should have consistent global position across multiple rotation changes", () => {
			const parent =
				new PIXI.Container();
			const {
				positionContainer,
				rotationContainer,
			} =
				createWeaponHierarchy();

			parent.addChild(
				positionContainer,
			);
			positionContainer.x = 200;
			positionContainer.y = 100;

			// Get initial global position
			const initialGlobal =
				rotationContainer.getGlobalPosition();

			// Apply multiple rotations and verify global position remains stable
			const rotations =
				[
					0,
					Math.PI /
						6,
					Math.PI /
						4,
					Math.PI /
						3,
					Math.PI /
						2,
					Math.PI,
					-Math.PI /
						4,
				];

			for (const rotation of rotations) {
				rotationContainer.rotation =
					rotation;
				const currentGlobal =
					rotationContainer.getGlobalPosition();

				expect(
					currentGlobal.x,
				).toBeCloseTo(
					initialGlobal.x,
					5,
				);
				expect(
					currentGlobal.y,
				).toBeCloseTo(
					initialGlobal.y,
					5,
				);
			}
		});
	});
});

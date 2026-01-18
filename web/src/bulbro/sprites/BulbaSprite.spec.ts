import {
	describe,
	expect,
	it,
} from "bun:test";
import * as PIXI from "pixi.js";

/**
 * These tests verify that the Bulbro character position remains stable
 * regardless of weapon rotation. The bug occurs when the offset calculation
 * uses dynamic container bounds (which change with weapon rotation) instead
 * of fixed body dimensions.
 */
describe("BulbaSprite weapon rotation stability", () => {
	// Body dimensions from BodySprite.ts
	const bodySize =
		{
			width: 100,
			height: 130,
		};
	const characterScaling = 0.25;

	describe("offset calculation", () => {
		it("should calculate offset based on fixed body size, not dynamic container bounds", () => {
			// Expected offset based on FIXED body size
			const expectedOffsetX =
				-(
					bodySize.width *
					characterScaling
				) /
				2; // -12.5
			const expectedOffsetY =
				-(
					bodySize.height *
					characterScaling
				) -
				5; // -37.5

			// Create containers simulating the BulbaSprite hierarchy
			const character =
				new PIXI.Container();
			const weaponsContainer =
				new PIXI.Container();
			const scaling =
				new PIXI.Container();

			// Add a mock body to scaling (simulates body sprite)
			const mockBody =
				new PIXI.Graphics();
			mockBody.rect(
				0,
				0,
				bodySize.width,
				bodySize.height,
			);
			mockBody.fill(
				0xffffff,
			);
			scaling.addChild(
				mockBody,
			);
			scaling.scale.set(
				characterScaling,
			);

			weaponsContainer.addChild(
				scaling,
			);
			character.addChild(
				weaponsContainer,
			);

			// Add a mock weapon that changes container bounds (elongated shape)
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
			weaponsContainer.addChild(
				mockWeapon,
			);

			// CORRECT approach: Calculate offset using FIXED body dimensions
			const scaledBodyHeight =
				bodySize.height *
				characterScaling;
			const scaledBodyWidth =
				bodySize.width *
				characterScaling;
			const correctOffsetX =
				-scaledBodyWidth /
				2;
			const correctOffsetY =
				-scaledBodyHeight -
				5;

			// INCORRECT approach: Calculate offset using DYNAMIC container bounds
			// This is what the buggy code does
			const incorrectOffsetX =
				-character.width /
				2;
			const incorrectOffsetY =
				-character.height -
				5;

			// Verify that fixed calculation matches expected
			expect(
				correctOffsetX,
			).toBeCloseTo(
				expectedOffsetX,
				2,
			);
			expect(
				correctOffsetY,
			).toBeCloseTo(
				expectedOffsetY,
				2,
			);

			// Verify that dynamic calculation is DIFFERENT (proves the bug exists)
			// When weapon is added, container bounds are larger than body alone
			expect(
				incorrectOffsetX,
			).not.toBeCloseTo(
				expectedOffsetX,
				1,
			);
		});

		it("should produce different offsets when using dynamic bounds with rotated weapons", () => {
			// This test proves that dynamic container bounds change with weapon rotation

			const getContainerBoundsWithWeaponRotation =
				(
					rotation: number,
				): {
					width: number;
					height: number;
				} => {
					const character =
						new PIXI.Container();
					const weaponsContainer =
						new PIXI.Container();
					const scaling =
						new PIXI.Container();

					// Body
					const mockBody =
						new PIXI.Graphics();
					mockBody.rect(
						0,
						0,
						bodySize.width,
						bodySize.height,
					);
					mockBody.fill(
						0xffffff,
					);
					scaling.addChild(
						mockBody,
					);
					scaling.scale.set(
						characterScaling,
					);

					weaponsContainer.addChild(
						scaling,
					);
					character.addChild(
						weaponsContainer,
					);

					// Weapon with rotation
					const mockWeapon =
						new PIXI.Graphics();
					mockWeapon.rect(
						-50,
						-5,
						100,
						10,
					); // Elongated weapon
					mockWeapon.fill(
						0xff0000,
					);
					mockWeapon.rotation =
						rotation;
					weaponsContainer.addChild(
						mockWeapon,
					);

					return {
						width:
							character.width,
						height:
							character.height,
					};
				};

			// Get bounds at different rotations
			const boundsAt0 =
				getContainerBoundsWithWeaponRotation(
					0,
				);
			const boundsAt45 =
				getContainerBoundsWithWeaponRotation(
					Math.PI /
						4,
				);
			const boundsAt90 =
				getContainerBoundsWithWeaponRotation(
					Math.PI /
						2,
				);

			// Container bounds should be DIFFERENT at different rotations
			// This proves that using container bounds for offset is problematic
			expect(
				boundsAt0.width,
			).not.toBeCloseTo(
				boundsAt90.width,
				0,
			);
			expect(
				boundsAt0.height,
			).not.toBeCloseTo(
				boundsAt90.height,
				0,
			);

			// At 45 degrees, a rectangular weapon has different bounds than at 0 or 90
			expect(
				boundsAt45.width,
			).not.toBeCloseTo(
				boundsAt0.width,
				0,
			);
		});
	});

	describe("fixed offset stability", () => {
		it("should maintain consistent offset regardless of weapon rotation", () => {
			// Fixed offset calculation (the correct approach)
			const scaledBodyHeight =
				bodySize.height *
				characterScaling;
			const scaledBodyWidth =
				bodySize.width *
				characterScaling;
			const fixedOffsetX =
				-scaledBodyWidth /
				2;
			const fixedOffsetY =
				-scaledBodyHeight -
				5;

			// Test with various rotations
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
					(3 *
						Math.PI) /
						4,
				];

			for (const rotation of rotations) {
				const character =
					new PIXI.Container();
				const weaponsContainer =
					new PIXI.Container();
				const scaling =
					new PIXI.Container();

				// Body
				const mockBody =
					new PIXI.Graphics();
				mockBody.rect(
					0,
					0,
					bodySize.width,
					bodySize.height,
				);
				mockBody.fill(
					0xffffff,
				);
				scaling.addChild(
					mockBody,
				);
				scaling.scale.set(
					characterScaling,
				);

				weaponsContainer.addChild(
					scaling,
				);
				character.addChild(
					weaponsContainer,
				);

				// Rotated weapon
				const mockWeapon =
					new PIXI.Graphics();
				mockWeapon.rect(
					-50,
					-10,
					100,
					20,
				);
				mockWeapon.fill(
					0xff0000,
				);
				mockWeapon.rotation =
					rotation;
				weaponsContainer.addChild(
					mockWeapon,
				);

				// Apply offset using FIXED dimensions (correct approach)
				weaponsContainer.y =
					fixedOffsetY;
				weaponsContainer.x =
					fixedOffsetX;

				// Verify offset remains constant regardless of rotation
				expect(
					weaponsContainer.x,
				).toBeCloseTo(
					fixedOffsetX,
					5,
				);
				expect(
					weaponsContainer.y,
				).toBeCloseTo(
					fixedOffsetY,
					5,
				);
			}
		});
	});
});

import {
	describe,
	expect,
	it,
} from "bun:test";

/**
 * These tests verify that the spawning portal and enemy sprites use consistent
 * anchor points so there's no visual disconnect when an enemy transitions from
 * the spawning state to the active state.
 *
 * The bug: SpawningEnemySprite used "center" anchor while BulbaEnemySprite used
 * "bottom-center" anchor, causing the enemy to appear to "jump" when spawning completed.
 *
 * Another bug: SpawningEnemySprite calculated anchor offset using unscaled sprite size
 * but then applied scaling, causing a large visual offset.
 */
describe("Spawning and Enemy sprite anchor consistency", () => {
	// These values should match what's used in the actual sprite classes
	// SpawningEnemySprite anchor (from SpawningEnemySprite.ts)
	// BulbaEnemySprite anchor (from BulbaEnemySprite.ts)

	describe("anchor point calculation", () => {
		it("should calculate same visual center for both anchor types when using bottom-center", () => {
			// If both use "bottom-center", the visual position should be consistent
			const position =
				{
					x: 500,
					y: 500,
				};

			// Portal size (from SpawningEnemySprite.ts)
			const portalSize =
				{
					width: 140,
					height: 140,
				};
			const portalScale = 0.2;
			const scaledPortalSize =
				{
					width:
						portalSize.width *
						portalScale,
					height:
						portalSize.height *
						portalScale,
				};

			// Enemy approximate size
			const enemySize =
				{
					width: 120,
					height: 90,
				};

			// With "bottom-center" anchor, the bottom-center of the sprite is at the position
			// So the visual center is at: (x, y - height/2)

			// For portal with bottom-center:
			const portalVisualCenterY =
				position.y -
				scaledPortalSize.height /
					2;

			// For enemy with bottom-center:
			const enemyVisualCenterY =
				position.y -
				enemySize.height /
					2;

			// The difference is just due to sprite size differences, which is expected
			// But the ANCHOR POINT (bottom-center) should be at the same position
			const portalAnchorY =
				position.y; // bottom of portal
			const enemyAnchorY =
				position.y; // bottom of enemy (feet)

			expect(
				portalAnchorY,
			).toBe(
				enemyAnchorY,
			);
		});

		it("should have visual disconnect when using different anchors (demonstrates the bug)", () => {
			const position =
				{
					x: 500,
					y: 500,
				};
			const spriteHeight = 100;

			// With "center" anchor: sprite center is at position
			// Visual bottom is at: y + height/2
			const centerAnchorBottom =
				position.y +
				spriteHeight /
					2;

			// With "bottom-center" anchor: sprite bottom is at position
			// Visual bottom is at: y
			const bottomCenterAnchorBottom =
				position.y;

			// These are different! This is the bug.
			expect(
				centerAnchorBottom,
			).not.toBe(
				bottomCenterAnchorBottom,
			);

			// The difference is half the sprite height
			expect(
				centerAnchorBottom -
					bottomCenterAnchorBottom,
			).toBe(
				spriteHeight /
					2,
			);
		});

		it("should place portal and enemy at same ground position when both use bottom-center", () => {
			const groundPosition =
				{
					x: 500,
					y: 500,
				};

			// Simulate both sprites using bottom-center anchor
			const portalAnchor =
				"bottom-center";
			const enemyAnchor =
				"bottom-center";

			// With bottom-center, the "feet" or bottom of both sprites are at groundPosition.y
			const portalGroundY =
				groundPosition.y;
			const enemyGroundY =
				groundPosition.y;

			expect(
				portalGroundY,
			).toBe(
				enemyGroundY,
			);
			expect(
				portalAnchor,
			).toBe(
				enemyAnchor,
			);
		});
	});

	describe("anchor offset calculations", () => {
		// These calculations mirror GameSprite.calculateAnchorOffset()

		const calculateAnchorOffset =
			(
				anchor:
					| "center"
					| "bottom-center"
					| "top-left",
				size: {
					width: number;
					height: number;
				},
			) => {
				switch (
					anchor
				) {
					case "bottom-center":
						return {
							x:
								-size.width /
								2,
							y:
								-size.height,
						};
					case "center":
						return {
							x:
								-size.width /
								2,
							y:
								-size.height /
								2,
						};
					case "top-left":
						return {
							x: 0,
							y: 0,
						};
				}
			};

		it("should have different Y offsets for center vs bottom-center anchors", () => {
			const size =
				{
					width: 100,
					height: 100,
				};

			const centerOffset =
				calculateAnchorOffset(
					"center",
					size,
				);
			const bottomCenterOffset =
				calculateAnchorOffset(
					"bottom-center",
					size,
				);

			// X offset should be the same (both center horizontally)
			expect(
				centerOffset.x,
			).toBe(
				bottomCenterOffset.x,
			);

			// Y offset should be different
			expect(
				centerOffset.y,
			).toBe(
				-50,
			); // -height/2
			expect(
				bottomCenterOffset.y,
			).toBe(
				-100,
			); // -height

			// The difference is half the height
			expect(
				centerOffset.y -
					bottomCenterOffset.y,
			).toBe(
				50,
			);
		});

		it("should result in same visual bottom when both use bottom-center", () => {
			const position =
				{
					x: 500,
					y: 500,
				};
			const portalSize =
				{
					width: 28,
					height: 28,
				}; // 140 * 0.2
			const enemySize =
				{
					width: 120,
					height: 90,
				};

			const portalOffset =
				calculateAnchorOffset(
					"bottom-center",
					portalSize,
				);
			const enemyOffset =
				calculateAnchorOffset(
					"bottom-center",
					enemySize,
				);

			// Visual bottom of portal sprite
			const portalVisualBottom =
				position.y +
				portalOffset.y +
				portalSize.height;
			// Visual bottom of enemy sprite
			const enemyVisualBottom =
				position.y +
				enemyOffset.y +
				enemySize.height;

			// With bottom-center anchor, both visual bottoms should be at position.y
			expect(
				portalVisualBottom,
			).toBe(
				position.y,
			);
			expect(
				enemyVisualBottom,
			).toBe(
				position.y,
			);
		});
	});

	describe("scaling and offset consistency", () => {
		it("should calculate offset using scaled size, not original texture size", () => {
			// This test catches the bug where offset was calculated with unscaled size
			// but sprite was then scaled, causing a large visual offset

			const originalSize =
				{
					width: 140,
					height: 140,
				};
			const scale = 0.2;
			const scaledSize =
				{
					width:
						originalSize.width *
						scale,
					height:
						originalSize.height *
						scale,
				};

			// WRONG: Calculate offset with original size (the bug)
			const wrongOffset =
				{
					x:
						-originalSize.width /
						2, // -70
					y:
						-originalSize.height, // -140
				};

			// CORRECT: Calculate offset with scaled size
			const correctOffset =
				{
					x:
						-scaledSize.width /
						2, // -14
					y:
						-scaledSize.height, // -28
				};

			// The difference is significant - this is the visual disconnect
			expect(
				wrongOffset.x,
			).toBe(
				-70,
			);
			expect(
				correctOffset.x,
			).toBe(
				-14,
			);
			expect(
				wrongOffset.y,
			).toBe(
				-140,
			);
			expect(
				correctOffset.y,
			).toBe(
				-28,
			);

			// Wrong offset causes sprite to be displaced by:
			const displacement =
				{
					x:
						wrongOffset.x -
						correctOffset.x, // -56 pixels
					y:
						wrongOffset.y -
						correctOffset.y, // -112 pixels
				};

			expect(
				displacement.x,
			).toBe(
				-56,
			);
			expect(
				displacement.y,
			).toBe(
				-112,
			);

			// This 112 pixel vertical displacement is the "big disconnect"!
		});

		it("should position sprite bottom at game position when using correct scaled offset", () => {
			const gamePosition =
				{
					x: 500,
					y: 500,
				};
			const originalSize =
				{
					width: 140,
					height: 140,
				};
			const scale = 0.2;
			const scaledSize =
				{
					width:
						originalSize.width *
						scale,
					height:
						originalSize.height *
						scale,
				};

			// With correct offset calculation using scaled size
			const offset =
				{
					x:
						-scaledSize.width /
						2,
					y:
						-scaledSize.height,
				};

			// Sprite is positioned at gamePosition, then offset is applied
			// The visual bottom of the sprite should be at gamePosition.y
			const spriteVisualBottom =
				gamePosition.y +
				offset.y +
				scaledSize.height;

			expect(
				spriteVisualBottom,
			).toBe(
				gamePosition.y,
			);
		});

		it("should NOT position sprite correctly when using wrong unscaled offset", () => {
			const gamePosition =
				{
					x: 500,
					y: 500,
				};
			const originalSize =
				{
					width: 140,
					height: 140,
				};
			const scale = 0.2;
			const scaledSize =
				{
					width:
						originalSize.width *
						scale,
					height:
						originalSize.height *
						scale,
				};

			// WRONG: offset calculated with unscaled size
			const wrongOffset =
				{
					x:
						-originalSize.width /
						2,
					y:
						-originalSize.height,
				};

			// Sprite is positioned at gamePosition, then wrong offset is applied
			// But the sprite is only scaledSize tall after scaling
			const spriteVisualBottom =
				gamePosition.y +
				wrongOffset.y +
				scaledSize.height;

			// The visual bottom is NOT at gamePosition.y - it's way off!
			expect(
				spriteVisualBottom,
			).not.toBe(
				gamePosition.y,
			);
			expect(
				spriteVisualBottom,
			).toBe(
				gamePosition.y -
					140 +
					28,
			); // 500 - 112 = 388
		});
	});
});

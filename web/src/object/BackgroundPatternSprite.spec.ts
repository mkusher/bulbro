import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	BackgroundPatternSprite,
	MAP_EDGE_MARGIN,
} from "./BackgroundPatternSprite";

describe("BackgroundPatternSprite", () => {
	describe("pattern object positioning", () => {
		it("should never position objects outside map bounds (accounting for sprite size margin)", () => {
			const mapSize =
				{
					width: 1000,
					height: 800,
				};

			const pattern =
				new BackgroundPatternSprite(
					mapSize,
				);
			const positions =
				pattern.spritePositions;

			// Verify we have some sprites generated
			expect(
				positions.length,
			).toBeGreaterThan(
				0,
			);

			// Check that all positions respect the margin
			for (const position of positions) {
				expect(
					position.x,
				).toBeGreaterThanOrEqual(
					MAP_EDGE_MARGIN,
				);
				expect(
					position.x,
				).toBeLessThanOrEqual(
					mapSize.width -
						MAP_EDGE_MARGIN,
				);
				expect(
					position.y,
				).toBeGreaterThanOrEqual(
					MAP_EDGE_MARGIN,
				);
				expect(
					position.y,
				).toBeLessThanOrEqual(
					mapSize.height -
						MAP_EDGE_MARGIN,
				);
			}
		});

		it("should handle small maps where margin takes up significant space", () => {
			const mapSize =
				{
					width: 200,
					height: 200,
				};

			const pattern =
				new BackgroundPatternSprite(
					mapSize,
				);
			const positions =
				pattern.spritePositions;

			// All sprites (if any) should still respect boundaries
			for (const position of positions) {
				expect(
					position.x,
				).toBeGreaterThanOrEqual(
					MAP_EDGE_MARGIN,
				);
				expect(
					position.x,
				).toBeLessThanOrEqual(
					mapSize.width -
						MAP_EDGE_MARGIN,
				);
				expect(
					position.y,
				).toBeGreaterThanOrEqual(
					MAP_EDGE_MARGIN,
				);
				expect(
					position.y,
				).toBeLessThanOrEqual(
					mapSize.height -
						MAP_EDGE_MARGIN,
				);
			}
		});

		it("should handle very small maps gracefully", () => {
			// Map smaller than 2x margin - should not crash
			const mapSize =
				{
					width: 40,
					height: 40,
				};

			expect(
				() => {
					new BackgroundPatternSprite(
						mapSize,
					);
				},
			).not.toThrow();
		});

		it("should generate sprites across multiple runs with consistent boundary enforcement", () => {
			const mapSize =
				{
					width: 2000,
					height: 1500,
				};

			// Run multiple times to account for randomness
			for (
				let run = 0;
				run <
				5;
				run++
			) {
				const pattern =
					new BackgroundPatternSprite(
						mapSize,
					);
				const positions =
					pattern.spritePositions;

				for (const position of positions) {
					expect(
						position.x,
					).toBeGreaterThanOrEqual(
						MAP_EDGE_MARGIN,
					);
					expect(
						position.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							MAP_EDGE_MARGIN,
					);
					expect(
						position.y,
					).toBeGreaterThanOrEqual(
						MAP_EDGE_MARGIN,
					);
					expect(
						position.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							MAP_EDGE_MARGIN,
					);
				}
			}
		});
	});

	describe("MAP_EDGE_MARGIN constant", () => {
		it("should be a positive number", () => {
			expect(
				MAP_EDGE_MARGIN,
			).toBeGreaterThan(
				0,
			);
		});

		it("should be large enough to prevent partial sprite overlap with map edge", () => {
			// The sprite size is 50 with offset x: -12.5, y: -25 and scale 0.1
			// Maximum sprite extent from position is roughly 25 pixels
			// MAP_EDGE_MARGIN should be at least this value
			expect(
				MAP_EDGE_MARGIN,
			).toBeGreaterThanOrEqual(
				25,
			);
		});
	});
});

import * as PIXI from "pixi.js";
import { BaggingAnimation } from "./BaggingAnimation";
import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	quadraticPoint,
	takeOffTime,
} from "./BaggingAnimation";

describe("BaggingAnimation", () => {
	it("starts and ends the flight curve at the material and the bag", () => {
		const from =
			{
				x: 0,
				y: 100,
			};
		const via =
			{
				x: 50,
				y:
					-50,
			};
		const to =
			{
				x: 100,
				y: 0,
			};
		expect(
			quadraticPoint(
				from,
				via,
				to,
				0,
			),
		).toEqual(
			from,
		);
		expect(
			quadraticPoint(
				from,
				via,
				to,
				1,
			),
		).toEqual(
			to,
		);
	});

	it("staggers take-offs but keeps them within a short window", () => {
		expect(
			takeOffTime(
				1,
				3,
			),
		).toBeGreaterThan(
			takeOffTime(
				0,
				3,
			),
		);
		const lastOfMany =
			takeOffTime(
				499,
				500,
			) -
			takeOffTime(
				0,
				500,
			);
		expect(
			lastOfMany,
		).toBeLessThanOrEqual(
			700,
		);
	});
});

it("counts each pickup's value as it arrives and finishes by sprite count", () => {
	const parent =
		new PIXI.Container();
	const layer =
		new PIXI.RenderLayer();
	const animation =
		new BaggingAnimation(
			parent,
			layer,
			PIXI
				.Texture
				.WHITE,
			[
				{
					x: 0,
					y: 0,
					value: 5,
				},
				{
					x: 10,
					y: 0,
					value: 3,
				},
			],
			() => ({
				x: 100,
				y: 100,
			}),
			16,
			12,
		);
	try {
		expect(
			animation.total,
		).toBe(
			8,
		);
		expect(
			animation.arrived,
		).toBe(
			0,
		);
		expect(
			animation.update(
				850,
			),
		).toBe(
			5,
		);
		expect(
			animation.arrived,
		).toBe(
			5,
		);
		expect(
			animation.total -
				animation.arrived,
		).toBe(
			3,
		);
		expect(
			animation.isDone,
		).toBe(
			false,
		);
		expect(
			animation.update(
				40,
			),
		).toBe(
			3,
		);
		expect(
			animation.arrived,
		).toBe(
			8,
		);
		expect(
			animation.isDone,
		).toBe(
			false,
		);
		animation.update(
			160,
		);
		expect(
			animation.isDone,
		).toBe(
			true,
		);
		expect(
			animation.update(
				100,
			),
		).toBe(
			0,
		);
	} finally {
		animation.destroy();
		layer.destroy();
		parent.destroy();
	}
});

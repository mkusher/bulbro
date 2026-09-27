import {
	expect,
	it,
} from "bun:test";
import {
	ellipseRadiusToward,
	segmentAabbHitTime,
} from "./geometry";

it.each(
	[
		[
			0,
			15,
			30,
			0,
			1 /
				3,
		],
		[
			30,
			15,
			-30,
			0,
			1 /
				3,
		],
		[
			15,
			0,
			0,
			30,
			1 /
				3,
		],
		[
			15,
			30,
			0,
			-30,
			1 /
				3,
		],
		[
			0,
			10,
			10,
			0,
			1,
		],
		[
			0,
			0,
			10,
			10,
			1,
		],
		[
			15,
			15,
			0,
			0,
			0,
		],
		[
			0,
			15,
			0,
			0,
			Infinity,
		],
		[
			0,
			9,
			30,
			0,
			Infinity,
		],
		[
			0,
			15,
			9,
			0,
			Infinity,
		],
		[
			0,
			15,
			-30,
			0,
			Infinity,
		],
		[
			0,
			0,
			30,
			10,
			Infinity,
		],
	],
)(
	"segment (%s,%s) + (%s,%s) has contact %s",
	(x, y, dx, dy, expected) => {
		expect(
			segmentAabbHitTime(
				x,
				y,
				dx,
				dy,
				10,
				10,
				20,
				20,
			),
		).toBe(
			expected,
		);
	},
);

it("ellipseRadiusToward gives the inscribed ellipse radius in a direction", () => {
	const size =
		{
			width: 120,
			height: 90,
		};
	expect(
		ellipseRadiusToward(
			size,
			{
				x: 1,
				y: 0,
			},
		),
	).toBeCloseTo(
		60,
	);
	expect(
		ellipseRadiusToward(
			size,
			{
				x: 0,
				y:
					-3,
			},
		),
	).toBeCloseTo(
		45,
	);
	const diagonal =
		ellipseRadiusToward(
			size,
			{
				x: 1,
				y: 1,
			},
		);
	expect(
		diagonal,
	).toBeGreaterThan(
		45,
	);
	expect(
		diagonal,
	).toBeLessThan(
		60,
	);
});

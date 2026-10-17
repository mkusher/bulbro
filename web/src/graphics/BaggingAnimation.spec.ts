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

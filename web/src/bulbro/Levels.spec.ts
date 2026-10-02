import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	getExperienceForLevel,
	getLevelForExperience,
	getTotalExperienceForLevel,
} from "./Levels";

describe("Levels", () => {
	it("needs (level + 3)² experience for each level", () => {
		expect(
			getExperienceForLevel(
				1,
			),
		).toBe(
			16,
		);
		expect(
			getExperienceForLevel(
				2,
			),
		).toBe(
			25,
		);
	});

	it("sums experience of all levels up to the given one", () => {
		expect(
			getTotalExperienceForLevel(
				0,
			),
		).toBe(
			0,
		);
		expect(
			getTotalExperienceForLevel(
				1,
			),
		).toBe(
			16,
		);
		expect(
			getTotalExperienceForLevel(
				2,
			),
		).toBe(
			41,
		);
	});

	it("reaches a level exactly at its total experience", () => {
		expect(
			getLevelForExperience(
				0,
			),
		).toBe(
			0,
		);
		expect(
			getLevelForExperience(
				15,
			),
		).toBe(
			0,
		);
		expect(
			getLevelForExperience(
				16,
			),
		).toBe(
			1,
		);
		expect(
			getLevelForExperience(
				40,
			),
		).toBe(
			1,
		);
		expect(
			getLevelForExperience(
				41,
			),
		).toBe(
			2,
		);
	});
});

import {
	describe,
	expect,
	it,
} from "bun:test";
import { wellRoundedBulbro } from "./characters-definitions";
import { calculateStats } from "./game-formulas";
import { createPlayer } from "./player";
import { smg } from "./weapons-definitions";

describe("starting weapon counts", () => {
	it("defaults to exactly one starting weapon and a capacity of six", () => {
		expect(
			calculateStats(
				{},
			),
		).toMatchObject(
			{
				startingWeapons: 1,
				maxWeapons: 6,
			},
		);
		expect(
			createPlayer(
				"player",
				wellRoundedBulbro,
				[
					smg,
				],
			)
				.bulbro
				.weapons,
		).toEqual(
			[
				smg,
			],
		);
		expect(
			() =>
				createPlayer(
					"player",
					wellRoundedBulbro,
				),
		).toThrow();
		expect(
			() =>
				createPlayer(
					"player",
					wellRoundedBulbro,
					[
						smg,
						smg,
					],
				),
		).toThrow();
	});
	it("counts built-in weapons and honors custom starting and maximum counts", () => {
		const bulbro =
			{
				...wellRoundedBulbro,
				weapons:
					[
						smg,
					],
				statBonuses:
					{
						startingWeapons: 1,
						maxWeapons:
							-4,
					},
			};
		expect(
			createPlayer(
				"player",
				bulbro,
				[
					smg,
				],
			)
				.bulbro
				.weapons,
		).toHaveLength(
			2,
		);
		expect(
			() =>
				createPlayer(
					"player",
					bulbro,
				),
		).toThrow();
		expect(
			() =>
				createPlayer(
					"player",
					bulbro,
					[
						smg,
						smg,
					],
				),
		).toThrow();
		expect(
			() =>
				createPlayer(
					"player",
					{
						...bulbro,
						statBonuses:
							{
								startingWeapons: 1,
								maxWeapons:
									-5,
							},
					},
					[
						smg,
					],
				),
		).toThrow();
	});
	it("supports an explicitly unarmed character", () => {
		expect(
			createPlayer(
				"player",
				{
					...wellRoundedBulbro,
					statBonuses:
						{
							startingWeapons:
								-1,
							maxWeapons:
								-6,
						},
				},
			)
				.bulbro
				.weapons,
		).toEqual(
			[],
		);
	});
});

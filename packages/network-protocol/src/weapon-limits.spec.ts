import {
	expect,
	it,
} from "bun:test";
import { hasValidStartingWeapons } from "./weapon-limits";

it("validates exact starting counts and custom capacity", () => {
	const valid =
		(
			count: number,
			statBonuses = {},
		) =>
			hasValidStartingWeapons(
				{
					statBonuses,
					weapons:
						Array(
							count,
						).fill(
							{},
						),
				},
			);
	expect(
		valid(
			0,
		),
	).toBe(
		false,
	);
	expect(
		valid(
			1,
		),
	).toBe(
		true,
	);
	expect(
		valid(
			2,
		),
	).toBe(
		false,
	);
	expect(
		valid(
			2,
			{
				startingWeapons: 1,
			},
		),
	).toBe(
		true,
	);
	expect(
		valid(
			7,
			{
				startingWeapons: 6,
			},
		),
	).toBe(
		false,
	);
	expect(
		valid(
			7,
			{
				startingWeapons: 6,
				maxWeapons: 1,
			},
		),
	).toBe(
		true,
	);
	expect(
		valid(
			0,
			{
				startingWeapons:
					-1,
				maxWeapons:
					-6,
			},
		),
	).toBe(
		true,
	);
});

it("rejects malformed or impossible limits", () => {
	for (const statBonuses of [
		{
			startingWeapons:
				"0",
		},
		{
			maxWeapons: true,
		},
		{
			startingWeapons: 0.5,
		},
		{
			startingWeapons:
				-2,
		},
		{
			maxWeapons:
				-7,
		},
		{
			maxWeapons:
				Infinity,
		},
		{
			startingWeapons:
				NaN,
		},
		{
			maxWeapons: 0.5,
		},
	]) {
		expect(
			hasValidStartingWeapons(
				{
					statBonuses,
					weapons:
						[
							{},
						],
				},
			),
		).toBe(
			false,
		);
	}
});

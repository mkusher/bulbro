import {
	describe,
	expect,
	it,
} from "bun:test";
import { ENDLESS_START_WAVE } from "@/enemy";
import { requireDefined } from "@/requireDefined";
import { getWaveDuration } from "@/waveDuration";
import {
	babyEnemy,
	beetleWarrior,
} from "../enemies-definitions";
import type { WaveDefinition } from "./WaveConfig";
import {
	ENDLESS_CYCLE_LENGTH,
	endlessExtraAmount,
	getWaveDefinition,
	isGroupSpawnSecond,
	LAST_DESIGNED_WAVE,
	waves,
} from "./waves";

/** Expected spawned enemies for a solo game on difficulty 0 */
function expectedEnemies(
	wave: number,
	definition: WaveDefinition,
): number {
	const duration =
		getWaveDuration(
			wave,
		);
	let total = 0;
	for (const group of definition) {
		for (
			let second = 0;
			second <
			duration;
			second++
		) {
			if (
				isGroupSpawnSecond(
					group,
					second,
				)
			) {
				const average =
					(group
						.amount[0] +
						group
							.amount[1]) /
						2 +
					1;
				total +=
					average *
					(group.mirrored
						? 2
						: 1);
			}
		}
	}
	return total;
}

describe("waves", () => {
	it("are designed up to wave 30 where endless scaling starts", () => {
		expect(
			LAST_DESIGNED_WAVE,
		).toBe(
			30,
		);
		expect(
			ENDLESS_START_WAVE,
		).toBe(
			LAST_DESIGNED_WAVE,
		);
	});

	it("keeps wave 1 and the wave 9 bruiser lull unchanged", () => {
		expect(
			getWaveDefinition(
				1,
			).map(
				(
					g,
				) =>
					g.enemy,
			),
		).toEqual(
			[
				babyEnemy,
			],
		);
		expect(
			getWaveDefinition(
				9,
			).map(
				(
					g,
				) =>
					g.enemy,
			),
		).toEqual(
			[
				beetleWarrior,
			],
		);
	});

	for (
		let wave = 13;
		wave <=
		60;
		wave++
	) {
		it(`wave ${wave} spawns a steady late-game amount of enemies`, () => {
			const total =
				expectedEnemies(
					wave,
					getWaveDefinition(
						wave,
					),
				);
			expect(
				total,
			).toBeGreaterThan(
				250,
			);
			expect(
				total,
			).toBeLessThan(
				1000,
			);
		});
	}

	it("starts every group inside the wave", () => {
		waves.forEach(
			(
				definition,
				index,
			) => {
				for (const group of definition) {
					expect(
						group.firstSpawn,
					).toBeLessThan(
						getWaveDuration(
							index +
								1,
						),
					);
					expect(
						group.interval,
					).toBeGreaterThan(
						0,
					);
				}
			},
		);
	});

	it("repeats the last designed waves after wave 30 with more enemies", () => {
		const wave31 =
			getWaveDefinition(
				31,
			);
		const wave21 =
			getWaveDefinition(
				21,
			);
		expect(
			wave31.map(
				(
					g,
				) =>
					g.enemy,
			),
		).toEqual(
			wave21.map(
				(
					g,
				) =>
					g.enemy,
			),
		);
		expect(
			wave31.map(
				(
					g,
				) =>
					g.amount,
			),
		).toEqual(
			wave21.map(
				(
					g,
				) => [
					g
						.amount[0] +
						1,
					g
						.amount[1] +
						1,
				],
			),
		);
		expect(
			getWaveDefinition(
				30 +
					ENDLESS_CYCLE_LENGTH *
						2,
			).map(
				(
					g,
				) =>
					g.enemy,
			),
		).toEqual(
			getWaveDefinition(
				30,
			).map(
				(
					g,
				) =>
					g.enemy,
			),
		);
	});

	it("caps extra enemies per cluster in long endless runs", () => {
		expect(
			endlessExtraAmount(
				30,
			),
		).toBe(
			0,
		);
		expect(
			endlessExtraAmount(
				31,
			),
		).toBe(
			1,
		);
		expect(
			endlessExtraAmount(
				41,
			),
		).toBe(
			2,
		);
		expect(
			endlessExtraAmount(
				200,
			),
		).toBe(
			2,
		);
	});
});

describe("isGroupSpawnSecond", () => {
	const group =
		requireDefined(
			getWaveDefinition(
				1,
			)[0],
		);

	it("spawns on the first second and every interval after it", () => {
		expect(
			[
				0,
				1,
				2,
				3,
				4,
				7,
			].filter(
				(
					s,
				) =>
					isGroupSpawnSecond(
						group,
						s,
					),
			),
		).toEqual(
			[
				1,
				4,
				7,
			],
		);
	});

	it("stops after the last spawn second", () => {
		expect(
			isGroupSpawnSecond(
				{
					...group,
					lastSpawn: 5,
				},
				7,
			),
		).toBe(
			false,
		);
	});
});

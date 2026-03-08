import {
	describe,
	expect,
	it,
} from "bun:test";
import { EnemyState } from "./enemy/EnemyState";
import {
	type Rectangle,
	rectFromCenter,
	rectIntersectsLine,
} from "./geometry";
import { ShotState } from "./shot/ShotState";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEnemy(
	id: string,
	x = 400,
	y = 400,
	killedAt?: number,
): EnemyState {
	return new EnemyState(
		{
			id,
			type: "potatoBeetleBaby",
			position:
				{
					x,
					y,
				},
			healthPoints: 50,
			stats:
				{
					maxHp: 50,
					hpRegeneration: 0,
					damage: 5,
					meleeDamage: 0,
					rangedDamage: 0,
					elementalDamage: 0,
					attackSpeed: 1,
					critChance: 0,
					range: 20,
					armor: 0,
					dodge: 0,
					speed: 50,
					materialsDropped: 1,
					knockback: 0,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			lastHorizontalDirection: 1,
			killedAt,
		},
	);
}

function createShot(
	id: string,
	shooterType:
		| "player"
		| "enemy",
	x = 0,
	y = 0,
): ShotState {
	return new ShotState(
		{
			id,
			shooterId:
				"shooter-1",
			shooterType,
			startPosition:
				{
					x,
					y,
				},
			position:
				{
					x,
					y,
				},
			direction:
				{
					x: 1,
					y: 0,
				},
			speed: 200,
			damage: 10,
			range: 300,
			knockback: 0,
			weaponType:
				"pistol",
		},
	);
}

/** Run a function many times and return average ms per iteration. */
function benchmark(
	fn: () => void,
	iterations = 1000,
): number {
	for (
		let i = 0;
		i <
		100;
		i++
	)
		fn();

	const start =
		performance.now();
	for (
		let i = 0;
		i <
		iterations;
		i++
	)
		fn();
	return (
		(performance.now() -
			start) /
		iterations
	);
}

function ms(
	val: number,
): string {
	if (
		val <
		0.001
	)
		return `${(val * 1_000_000).toFixed(0)}ns`;
	if (
		val <
		1
	)
		return `${(val * 1000).toFixed(2)}µs`;
	return `${val.toFixed(3)}ms`;
}

// ---------------------------------------------------------------------------
// rectIntersectsLine
// ---------------------------------------------------------------------------

describe("geometry: rectIntersectsLine collision", () => {
	it("measures rectIntersectsLine performance with many calls", () => {
		const rect: Rectangle =
			{
				x: 100,
				y: 100,
				width: 32,
				height: 32,
			};
		const line =
			{
				start:
					{
						x: 0,
						y: 0,
					},
				end: {
					x: 200,
					y: 200,
				},
			};

		const avg =
			benchmark(
				() => {
					rectIntersectsLine(
						rect,
						line,
					);
				},
				10_000,
			);

		console.log(
			`  rectIntersectsLine: ${ms(avg)} per call`,
		);
		expect(
			rectIntersectsLine(
				rect,
				line,
			),
		).toBe(
			true,
		);
	});

	it("measures collision loop with spatial grid optimization", () => {
		const shotCount = 50;
		const enemyCount = 50;
		const cellSize = 64;

		const enemies =
			Array.from(
				{
					length:
						enemyCount,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`enemy-${i}`,
						Math.random() *
							6000,
						Math.random() *
							4500,
					),
			);
		const shots =
			Array.from(
				{
					length:
						shotCount,
				},
				(
					_,
					i,
				) =>
					createShot(
						`shot-${i}`,
						"player",
						Math.random() *
							6000,
						Math.random() *
							4500,
					),
			);

		const avg =
			benchmark(
				() => {
					const grid =
						new Map<
							string,
							typeof enemies
						>();
					for (const enemy of enemies) {
						if (
							enemy.killedAt
						)
							continue;
						const cx =
							Math.floor(
								enemy
									.position
									.x /
									cellSize,
							);
						const cy =
							Math.floor(
								enemy
									.position
									.y /
									cellSize,
							);
						const key = `${cx},${cy}`;
						let cell =
							grid.get(
								key,
							);
						if (
							!cell
						) {
							cell =
								[];
							grid.set(
								key,
								cell,
							);
						}
						cell.push(
							enemy,
						);
					}

					for (const shot of shots) {
						const segment =
							{
								start:
									shot.position,
								end: {
									x:
										shot
											.position
											.x +
										10,
									y:
										shot
											.position
											.y +
										10,
								},
							};
						const minCx =
							Math.floor(
								Math.min(
									segment
										.start
										.x,
									segment
										.end
										.x,
								) /
									cellSize,
							);
						const maxCx =
							Math.floor(
								Math.max(
									segment
										.start
										.x,
									segment
										.end
										.x,
								) /
									cellSize,
							);
						const minCy =
							Math.floor(
								Math.min(
									segment
										.start
										.y,
									segment
										.end
										.y,
								) /
									cellSize,
							);
						const maxCy =
							Math.floor(
								Math.max(
									segment
										.start
										.y,
									segment
										.end
										.y,
								) /
									cellSize,
							);

						for (
							let cx =
								minCx;
							cx <=
							maxCx;
							cx++
						) {
							for (
								let cy =
									minCy;
								cy <=
								maxCy;
								cy++
							) {
								const cell =
									grid.get(
										`${cx},${cy}`,
									);
								if (
									!cell
								)
									continue;
								for (const enemy of cell) {
									const enemyRect =
										rectFromCenter(
											enemy.position,
											{
												width: 32,
												height: 32,
											},
										);
									rectIntersectsLine(
										enemyRect,
										segment,
									);
								}
							}
						}
					}
				},
				1000,
			);

		console.log(
			`  Spatial grid ${shotCount}×${enemyCount} collision: ${ms(avg)} per frame`,
		);
		expect(
			avg,
		).toBeDefined();
	});
});

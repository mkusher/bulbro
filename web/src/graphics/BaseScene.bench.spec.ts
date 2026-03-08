import {
	describe,
	expect,
	it,
} from "bun:test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function randomPos() {
	return {
		x:
			Math.random() *
			6000,
		y:
			Math.random() *
			4500,
	};
}

// ---------------------------------------------------------------------------
// Sprite cleanup
// ---------------------------------------------------------------------------

describe("BaseScene: sprite cleanup", () => {
	it("measures Set-based cleanup (optimized approach)", () => {
		const entityCount = 50;
		const entities =
			Array.from(
				{
					length:
						entityCount,
				},
				(
					_,
					i,
				) => ({
					id: `entity-${i}`,
					data: i,
				}),
			);

		const spriteMap =
			new Map<
				string,
				{
					id: string;
				}
			>();
		for (const e of entities) {
			spriteMap.set(
				e.id,
				{
					id: e.id,
				},
			);
		}
		for (
			let i =
				entityCount;
			i <
			entityCount +
				10;
			i++
		) {
			spriteMap.set(
				`entity-${i}`,
				{
					id: `entity-${i}`,
				},
			);
		}

		const avg =
			benchmark(
				() => {
					const entityIds =
						new Set(
							entities.map(
								(
									e,
								) =>
									e.id,
							),
						);
					for (const [
						id,
						_sprite,
					] of spriteMap) {
						if (
							!entityIds.has(
								id,
							)
						) {
							// would remove sprite
						}
					}
				},
				5000,
			);

		console.log(
			`  Set-based cleanup (${entityCount} entities, ${spriteMap.size} sprites): ${ms(avg)}`,
		);
		expect(
			avg,
		).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// Object type splitting
// ---------------------------------------------------------------------------

describe("BaseScene: object type splitting", () => {
	it("measures single-pass type split (optimized approach)", () => {
		const objectCount = 40;
		const objects =
			Array.from(
				{
					length:
						objectCount,
				},
				(
					_,
					i,
				) => ({
					type:
						i %
							2 ===
						0
							? "material"
							: "spawning-enemy",
					id: `obj-${i}`,
					position:
						randomPos(),
				}),
			);

		const avg =
			benchmark(
				() => {
					const materials: (typeof objects)[number][] =
						[];
					const spawnings: (typeof objects)[number][] =
						[];
					for (const obj of objects) {
						if (
							obj.type ===
							"material"
						)
							materials.push(
								obj,
							);
						else if (
							obj.type ===
							"spawning-enemy"
						)
							spawnings.push(
								obj,
							);
					}
				},
				5000,
			);

		console.log(
			`  Single-pass split (${objectCount} objects): ${ms(avg)}`,
		);
		expect(
			avg,
		).toBeDefined();
	});
});

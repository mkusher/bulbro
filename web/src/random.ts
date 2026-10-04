export function pickRandom<
	T,
>(
	list: T[],
) {
	return list[
		Math.floor(
			list.length *
				Math.random(),
		)
	]!;
}

export function randomInRange(
	from: number,
	to: number,
) {
	return (
		from +
		Math.random() *
			(to -
				from)
	);
}

export function randomAngle() {
	return (
		Math.random() *
		Math.PI *
		2
	);
}

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces deterministic values in [0, 1).
 */
export function seededRng(
	seed: number,
): () => number {
	return () => {
		seed |= 0;
		seed =
			(seed +
				0x6d2b79f5) |
			0;
		let t =
			Math.imul(
				seed ^
					(seed >>>
						15),
				1 |
					seed,
			);
		t =
			(t +
				Math.imul(
					t ^
						(t >>>
							7),
					61 |
						t,
				)) ^
			t;
		return (
			((t ^
				(t >>>
					14)) >>>
				0) /
			4294967296
		);
	};
}

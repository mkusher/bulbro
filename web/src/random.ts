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

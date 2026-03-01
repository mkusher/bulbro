export function getWaveDuration(
	wave: number,
): number {
	const base = 20;
	const result =
		base +
		(wave -
			1) *
			5;
	const defaultMax = 60;

	return Math.min(
		result,
		defaultMax,
	);
}

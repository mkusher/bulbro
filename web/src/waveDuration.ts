export function getWaveDuration(
	wave: number,
): number {
	if (
		wave ===
		1
	) {
		return 25;
	}
	if (
		wave ===
		2
	) {
		return 30;
	}
	if (
		wave ===
		3
	) {
		return 40;
	}
	return 60;
}

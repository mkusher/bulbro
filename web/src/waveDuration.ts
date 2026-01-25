/**
 * Calculates wave duration based on wave number.
 * Wave 1: 25 seconds
 * Wave 2: 40 seconds
 * Wave 3+: 60 seconds
 */
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
		return 40;
	}
	return 60;
}

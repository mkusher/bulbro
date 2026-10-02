/**
 * Experience needed to go from `level - 1` to `level` (Brotato: (level + 3)²).
 * Bulbros start at level 0, so reaching level 1 takes 16 experience.
 */
export function getExperienceForLevel(
	level: number,
) {
	return (
		(level +
			3) **
		2
	);
}

/** Total experience needed to reach `level` from level 0. */
export function getTotalExperienceForLevel(
	level: number,
) {
	let total = 0;
	for (
		let i = 1;
		i <=
		level;
		i++
	) {
		total +=
			getExperienceForLevel(
				i,
			);
	}
	return total;
}

/** Level reached with `experience` total experience. */
export function getLevelForExperience(
	experience: number,
) {
	let level = 0;
	while (
		getTotalExperienceForLevel(
			level +
				1,
		) <=
		experience
	) {
		++level;
	}

	return level;
}

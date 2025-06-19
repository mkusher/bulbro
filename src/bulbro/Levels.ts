export function getExperienceForLevel(level: number) {
	return Math.pow(level + 3, 2);
}

export function getTotalExperienceForLevel(level: number) {
	return new Array(level)
		.fill(0)
		.map((_, i) => getExperienceForLevel(i))
		.reduce((a, b) => a + b, 0);
}

export function getLeverForExperience(experience: number) {
	let level = 0;
	while (getTotalExperienceForLevel(level + 1) < experience) {
		++level;
	}

	return level;
}

export const baseWeaponStats =
	{
		startingWeapons: 1,
		maxWeapons: 6,
	};

export function hasValidStartingWeapons(bulbro: {
	statBonuses: Record<
		string,
		unknown
	>;
	weapons: readonly unknown[];
}): boolean {
	const startingBonus =
		bulbro
			.statBonuses
			.startingWeapons ??
		0;
	const maxBonus =
		bulbro
			.statBonuses
			.maxWeapons ??
		0;
	if (
		typeof startingBonus !==
			"number" ||
		typeof maxBonus !==
			"number"
	)
		return false;
	const startingWeapons =
		baseWeaponStats.startingWeapons +
		startingBonus;
	const maxWeapons =
		baseWeaponStats.maxWeapons +
		maxBonus;
	return (
		Number.isSafeInteger(
			startingWeapons,
		) &&
		startingWeapons >=
			0 &&
		Number.isSafeInteger(
			maxWeapons,
		) &&
		maxWeapons >=
			startingWeapons &&
		bulbro
			.weapons
			.length ===
			startingWeapons
	);
}

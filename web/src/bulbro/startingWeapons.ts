import type { Bulbro } from "./BulbroCharacter";

/** Starting choices respect both the character pool and shop-only exclusions. */
export function availableStartingWeapons(
	bulbro: Bulbro,
) {
	return bulbro.availableWeapons.filter(
		(
			weapon,
		) =>
			!bulbro.excludedStartingWeapons?.includes(
				weapon.id,
			),
	);
}

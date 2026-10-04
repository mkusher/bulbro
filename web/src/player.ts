import { hasValidStartingWeapons } from "@bulbro/network-protocol";
import type { Bulbro } from "./bulbro";
import type { Weapon } from "./weapon";

export function createPlayer(
	id: string,
	bulbro: Bulbro,
	weapons: Weapon[] = [],
): Player {
	if (
		!hasValidStartingWeapons(
			{
				...bulbro,
				weapons:
					[
						...bulbro.weapons,
						...weapons,
					],
			},
		)
	) {
		throw new Error(
			"Select exactly the required number of starting weapons within the weapon limit.",
		);
	}
	return {
		id,
		bulbro:
			{
				...bulbro,
				weapons:
					[
						...bulbro.weapons,
						...weapons,
					],
			},
	};
}

/** Player controlling a Bulbro. */
export interface Player {
	id: string;
	bulbro: Bulbro;
}

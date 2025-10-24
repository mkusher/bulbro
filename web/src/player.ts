import type { Bulbro } from "./bulbro";
import type { Weapon } from "./weapon";

export function createPlayer(
	id: string,
	bulbro: Bulbro,
	weapons: Weapon[] = [],
): Player {
	return {
		id,
		bulbro: {
			...bulbro,
			weapons: [...bulbro.weapons, ...weapons],
		},
	};
}

/** Player controlling a Bulbro. */
export interface Player {
	id: string;
	bulbro: Bulbro;
}

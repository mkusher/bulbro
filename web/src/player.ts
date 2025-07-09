import type { Bulbro } from "./bulbro";
import type { Weapon } from "./weapon";
import type { SpriteType } from "./bulbro/Sprite";

export function createPlayer(
	id: string,
	bulbro: Bulbro,
	sprite: SpriteType,
	weapons: Weapon[] = [],
): Player {
	return {
		id,
		sprite,
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
	sprite: SpriteType;
}

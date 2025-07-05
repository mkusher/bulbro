import { v4 } from "uuid";
import type { Bulbro } from "./bulbro";
import type { Weapon } from "./weapon";
import type { SpriteType } from "./bulbro/Sprite";

export function createPlayer(
	bulbro: Bulbro,
	sprite: SpriteType,
	weapons: Weapon[] = [],
) {
	return {
		id: v4(),
		sprite,
		bulbro: {
			...bulbro,
			weapons: [...bulbro.weapons, ...weapons],
		},
	};
}

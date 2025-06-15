import { v4 } from "uuid";
import type { Bulbro } from "./bulbro";
import type { Weapon } from "./weapon";

export function createPlayer(bulbro: Bulbro, weapons: Weapon[] = []) {
	return {
		id: v4(),
		bulbro: {
			...bulbro,
			weapons: [...bulbro.weapons, ...weapons],
		},
	};
}

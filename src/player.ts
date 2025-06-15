import { v4 } from "uuid";
import type { Bulbro } from "./bulbro";

export function createPlayer(bulbro: Bulbro) {
	return {
		id: v4(),
		bulbro,
	};
}

import type { Bulbro } from "../bulbro";
import type { Difficulty } from "../game-formulas";
import type { GameProcess } from "../GameProcess";
import type { Weapon } from "../weapon";

export type StartGame = (
	gameProcess: GameProcess,
	bulbro: Bulbro,
	difficulty: Difficulty,
	weapons: Weapon[],
	duration: number,
) => Promise<void>;

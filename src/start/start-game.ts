import type { Difficulty } from "../game-formulas";
import type { CharacterSetup } from "../GameProcess";
import type { Weapon } from "../weapon";

export type StartGame = (
	characters: CharacterSetup[],
	difficulty: Difficulty,
	weapons: Weapon[][],
	duration: number,
) => Promise<void>;

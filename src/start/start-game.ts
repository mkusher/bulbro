import type { Bulbro } from "../bulbro";
import type { SpriteType } from "../bulbro/Sprite";
import type { Difficulty } from "../game-formulas";
import type { GameProcess } from "../GameProcess";
import type { Weapon } from "../weapon";

export type StartGame = (
	gameProcess: GameProcess,
	bulbro: Bulbro,
	bulbroStyle: SpriteType,
	difficulty: Difficulty,
	weapons: Weapon[],
	duration: number,
) => Promise<void>;

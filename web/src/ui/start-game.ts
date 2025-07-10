import type { Player } from "@/player";
import type { Difficulty } from "../game-formulas";

export type StartGame = (
	players: Player[],
	difficulty: Difficulty,
	duration: number,
) => Promise<void>;

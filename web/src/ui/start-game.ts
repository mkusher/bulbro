import type { Player } from "@/player";
import type { Difficulty } from "../game-formulas";
import type { PlayerControl } from "@/controls";

export type StartGame = (
	players: Player[],
	playerControls: PlayerControl[],
	difficulty: Difficulty,
	duration: number,
) => Promise<void>;

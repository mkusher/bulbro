import type { PlayerControl } from "@/controls";
import type { Player } from "@/player";
import type { Difficulty } from "../game-formulas";

export type StartGame =
	(
		players: Player[],
		playerControls: PlayerControl[],
		difficulty: Difficulty,
		duration: number,
	) => Promise<void>;

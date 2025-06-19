import type { Direction } from "../geometry";

export interface PlayerControl {
	start(): Promise<void>;
	stop(): Promise<void>;
	getDirection(): Direction;
}

import type { Signal } from "@preact/signals";
import type { Direction } from "../geometry";

export interface PlayerControl {
	start(): Promise<void>;
	stop(): Promise<void>;
	direction: Readonly<Direction>;
	signal: Readonly<
		Signal<Direction>
	>;
}

import type * as PIXI from "pixi.js";
import type {
	Position,
	Size,
} from "@/geometry";
import type { WaveState } from "@/waveState";

export interface Camera {
	stage: PIXI.Container;
	ui: PIXI.Container;
	ticker: PIXI.Ticker;
	canvas:
		| HTMLCanvasElement
		| undefined;
	init(
		size: Size,
	): Promise<void>;
	zoom(
		scale: number,
	): void;
	setCenter(
		position: Position,
	): void;
	update(
		state: WaveState,
	): void;
}

import { computed, signal } from "@preact/signals";
import { toClassicExpected } from "./game-formulas";

export const canvasSize = signal({
	width: window.innerWidth,
	height: window.innerHeight,
});

export const playingFieldSize = signal({
	width: 2000,
	height: 1500,
});

export const mapSize = computed(() =>
	toClassicExpected(playingFieldSize.value),
);

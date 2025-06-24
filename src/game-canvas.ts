import { computed, signal } from "@preact/signals";
import { toClassicExpected } from "./game-formulas";

export const canvasSize = signal({
	width: window.innerWidth,
	height: window.innerHeight,
});

export const playingFieldSize = computed(() => {
	const minHeight = 600;
	const minWidth = 800;
	const width = Math.max(canvasSize.value.width, minWidth);
	const height = Math.max(canvasSize.value.height, minHeight);

	if (canvasSize.value.height > canvasSize.value.width) {
		return {
			height,
			width: (width * height) / minHeight,
		};
	}

	return {
		width,
		height: (height * width) / minWidth,
	};
});

export const mapSize = computed(() =>
	toClassicExpected(playingFieldSize.value),
);

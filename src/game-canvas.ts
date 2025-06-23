import { signal } from "@preact/signals";

export const canvasSize = signal({
	width: window.innerWidth,
	height: window.innerHeight,
});

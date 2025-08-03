import { computed, signal } from "@preact/signals";
import type { Size } from "@/geometry";

export const currentWindowSize = (): Size => ({
	width: window.innerWidth,
	height: window.innerHeight,
});

export const canvasSize = signal(currentWindowSize());

window.addEventListener("resize", () => {
	canvasSize.value = currentWindowSize();
});

export const classicMapSize = {
	width: 2000,
	height: 1500,
} as const;

const minimalMapSize = {
	width: 1500,
	height: 1125,
};

export type FitMode = "fit-width" | "fit-height";
export const manualFitMode = signal<FitMode | null>(null);
export const automaticFitMode = computed(() => {
	const size = canvasSize.value;
	if (size.width > 1400 && size.height > 1000) {
		return (size.height / classicMapSize.height) * size.width <
			classicMapSize.width
			? "fit-height"
			: "fit-width";
	}
	return size.width / classicMapSize.width < size.height / classicMapSize.height
		? "fit-height"
		: "fit-width";
});

export const fitMode = computed(
	() => manualFitMode.value ?? automaticFitMode.value,
);

export const autoScale = computed(() => {
	const fitWidth = fitMode.value === "fit-width";
	const canvas = canvasSize.value;

	return fitWidth
		? Math.max(canvas.width, minimalMapSize.width) / classicMapSize.width
		: Math.max(canvas.height, minimalMapSize.height) / classicMapSize.height;
});

export const manualScale = signal<number | null>(null);

export const scale = computed(() => manualScale.value ?? autoScale.value);

export const computedMapSizeForWindow = computed(() => {
	const scaling = scale.value;

	return {
		width: classicMapSize.width * scaling,
		height: classicMapSize.height * scaling,
	};
});

import { it, expect } from "bun:test";
import { automaticFitMode, canvasSize } from "./game-canvas";

it("uses fit-height for portrait on iPhone 14 Pro Max", () => {
	canvasSize.value = {
		width: 430,
		height: 932,
	};

	expect(automaticFitMode.value).toBe("fit-height");
});

it("uses fit-width for landscape on iPhone 14 Pro Max", () => {
	canvasSize.value = {
		width: 932,
		height: 430,
	};

	expect(automaticFitMode.value).toBe("fit-width");
});

it("uses fit-width for landscape on iPad Pro", () => {
	canvasSize.value = {
		width: 1366,
		height: 1024,
	};

	expect(automaticFitMode.value).toBe("fit-width");
});

it("uses fit-width for Full HD desktop", () => {
	canvasSize.value = {
		width: 1920,
		height: 1080,
	};

	expect(automaticFitMode.value).toBe("fit-height");
});

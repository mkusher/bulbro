import {
	expect,
	it,
} from "bun:test";
import {
	automaticFitMode,
	autoScale,
	canvasSize,
	mobileVisibleShortSide,
} from "./game-canvas";

it("uses fit-height for portrait on iPhone 14 Pro Max", () => {
	canvasSize.value =
		{
			width: 430,
			height: 932,
		};

	expect(
		automaticFitMode.value,
	).toBe(
		"fit-height",
	);
});

it("uses fit-width for landscape on iPhone 14 Pro Max", () => {
	canvasSize.value =
		{
			width: 932,
			height: 430,
		};

	expect(
		automaticFitMode.value,
	).toBe(
		"fit-width",
	);
});

it("uses fit-width for landscape on iPad Pro", () => {
	canvasSize.value =
		{
			width: 1366,
			height: 1024,
		};

	expect(
		automaticFitMode.value,
	).toBe(
		"fit-width",
	);
});

it("uses fit-width for Full HD desktop", () => {
	canvasSize.value =
		{
			width: 1920,
			height: 1080,
		};

	expect(
		automaticFitMode.value,
	).toBe(
		"fit-height",
	);
});

it("zooms out on portrait phone so more of the field is visible", () => {
	canvasSize.value =
		{
			width: 430,
			height: 932,
		};

	expect(
		autoScale.value,
	).toBeCloseTo(
		430 /
			mobileVisibleShortSide,
	);
});

it("zooms out on landscape phone so more of the field is visible", () => {
	canvasSize.value =
		{
			width: 932,
			height: 430,
		};

	expect(
		autoScale.value,
	).toBeCloseTo(
		430 /
			mobileVisibleShortSide,
	);
});

it("keeps default scale on desktop", () => {
	canvasSize.value =
		{
			width: 1920,
			height: 1080,
		};

	expect(
		autoScale.value,
	).toBeCloseTo(
		0.75,
	);
});

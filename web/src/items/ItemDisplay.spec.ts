import {
	afterEach,
	expect,
	it,
} from "bun:test";
import {
	h,
	render,
} from "preact";
import { act } from "preact/test-utils";
import sharp from "sharp";
import atlas from "@/assets/items.json";
import { ItemDisplay } from "./ItemDisplay";
import { itemDefinitions } from "./Items";

const container =
	document.createElement(
		"div",
	);
afterEach(
	() =>
		render(
			null,
			container,
		),
);

it("covers every item with a unique, in-bounds frame containing padded transparent artwork", async () => {
	expect(
		Object.keys(
			atlas.frames,
		).sort(),
	).toEqual(
		itemDefinitions
			.map(
				(
					item,
				) =>
					item.id,
			)
			.sort(),
	);
	const {
		data,
		info,
	} =
		await sharp(
			new URL(
				"../assets/items.png",
				import.meta
					.url,
			)
				.pathname,
		)
			.ensureAlpha()
			.raw()
			.toBuffer(
				{
					resolveWithObject: true,
				},
			);
	expect(
		info.width,
	).toBe(
		atlas
			.meta
			.size
			.w,
	);
	expect(
		info.height,
	).toBe(
		atlas
			.meta
			.size
			.h,
	);
	const occupied =
		new Set<number>();
	for (const frame of Object.values(
		atlas.frames,
	)) {
		expect(
			frame.x,
		).toBeGreaterThanOrEqual(
			0,
		);
		expect(
			frame.y,
		).toBeGreaterThanOrEqual(
			0,
		);
		expect(
			frame.x +
				frame.w,
		).toBeLessThanOrEqual(
			info.width,
		);
		expect(
			frame.y +
				frame.h,
		).toBeLessThanOrEqual(
			info.height,
		);
		expect(
			frame.w,
		).toBe(
			atlas
				.meta
				.cell,
		);
		expect(
			frame.h,
		).toBe(
			atlas
				.meta
				.cell,
		);
		let visiblePixels = 0;
		let paddingAlpha = 0;
		for (
			let y = 0;
			y <
			frame.h;
			y++
		) {
			for (
				let x = 0;
				x <
				frame.w;
				x++
			) {
				const pixel =
					(frame.y +
						y) *
						info.width +
					frame.x +
					x;
				if (
					occupied.has(
						pixel,
					)
				)
					throw new Error(
						"Item atlas frames overlap",
					);
				occupied.add(
					pixel,
				);
				const alpha =
					data[
						pixel *
							info.channels +
							3
					]!;
				if (
					alpha >
					0
				)
					visiblePixels++;
				if (
					x <
						atlas
							.meta
							.padding ||
					y <
						atlas
							.meta
							.padding ||
					x >=
						frame.w -
							atlas
								.meta
								.padding ||
					y >=
						frame.h -
							atlas
								.meta
								.padding
				)
					paddingAlpha +=
						alpha;
			}
		}
		expect(
			visiblePixels,
		).toBeGreaterThan(
			100,
		);
		expect(
			paddingAlpha,
		).toBe(
			0,
		);
	}
});

it("crops and scales the correct frame when a tile is reused for another item", () => {
	for (const id of [
		"acid",
		"coffee",
		"wolfHelmet",
	]) {
		const frame =
			atlas
				.frames[
				id as keyof typeof atlas.frames
			];
		act(
			() =>
				render(
					h(
						ItemDisplay,
						{
							item: {
								id,
							},
							size: 32,
						},
					),
					container,
				),
		);
		const sprite =
			container.querySelector<HTMLElement>(
				".item-sprite",
			)!;
		expect(
			sprite.getAttribute(
				"aria-hidden",
			),
		).toBe(
			"true",
		);
		expect(
			sprite
				.style
				.width,
		).toBe(
			"32px",
		);
		expect(
			sprite
				.style
				.height,
		).toBe(
			"32px",
		);
		expect(
			sprite
				.style
				.backgroundPosition,
		).toBe(
			`${-frame.x / 4}px ${-frame.y / 4}px`,
		);
		expect(
			sprite
				.style
				.backgroundSize,
		).toBe(
			`${atlas.meta.size.w / 4}px ${atlas.meta.size.h / 4}px`,
		);
		expect(
			sprite
				.style
				.backgroundImage,
		).toContain(
			"items.png",
		);
	}
});

it("does not show another item's artwork for an unknown ID", () => {
	for (const id of [
		"unknown",
		"toString",
		"__proto__",
	]) {
		act(
			() =>
				render(
					h(
						ItemDisplay,
						{
							item: {
								id,
							},
						},
					),
					container,
				),
		);
		expect(
			container.childElementCount,
		).toBe(
			0,
		);
	}
});

import {
	expect,
	it,
} from "bun:test";
import {
	Container,
	Sprite,
} from "pixi.js";
import { ShadowSprite } from "./ShadowSprite";

it("shares a filter-free soft shadow texture across differently sized characters", () => {
	const parent =
		new Container();
	const small =
		new ShadowSprite(
			{
				width: 100,
				height: 100,
			},
		);
	const large =
		new ShadowSprite(
			{
				width: 200,
				height: 200,
			},
		);
	small.appendTo(
		parent,
	);
	large.appendTo(
		parent,
	);
	const a =
		parent
			.children[0] as Sprite;
	const b =
		parent
			.children[1] as Sprite;
	expect(
		a,
	).toBeInstanceOf(
		Sprite,
	);
	expect(
		a.texture,
	).toBe(
		b.texture,
	);
	expect(
		a
			.filters
			?.length ??
			0,
	).toBe(
		0,
	);
	expect(
		a.width,
	).toBe(
		90,
	);
	expect(
		b.width,
	).toBe(
		180,
	);
	expect(
		a.height,
	).toBe(
		36,
	);
	const pixels =
		a
			.texture
			.source
			.resource as Uint8Array;
	expect(
		pixels[3],
	).toBe(
		0,
	);
	expect(
		pixels[
			(32 *
				64 +
				32) *
				4 +
				3
		],
	).toBe(
		255,
	);
	small.visible = false;
	expect(
		a.visible,
	).toBe(
		false,
	);
	expect(
		b.visible,
	).toBe(
		true,
	);
	const texture =
		a.texture;
	parent.destroy(
		{
			children: true,
		},
	);
	expect(
		texture.destroyed,
	).toBe(
		false,
	);
});

import {
	expect,
	it,
	spyOn,
} from "bun:test";
import {
	type Application,
	Container,
	Rectangle,
	Sprite,
	TextureSource,
} from "pixi.js";
import { Assets } from "@/Assets";
import { wellRoundedBulbro } from "@/characters-definitions";
import { BulbroThumbnail } from "@/ui/BulbroThumbnail";
import {
	BulbroDisplay,
	BulbroStateDisplay,
} from "./BulbroDisplay";
import { spawnBulbro } from "./BulbroState";

it("waits for character artwork and centers previews without changing the game state", async () => {
	const state =
		spawnBulbro(
			"preview-test",
			wellRoundedBulbro
				.style
				.faceType,
			{
				x: 1200,
				y: 900,
			},
			1,
			0,
			wellRoundedBulbro,
		);
	const original =
		state.toJSON();
	const previews =
		[
			{
				view: BulbroDisplay(
					{
						bulbro:
							wellRoundedBulbro,
					},
				),
				width: 80,
				height: 80,
			},
			{
				view: BulbroStateDisplay(
					{
						bulbro:
							wellRoundedBulbro,
						bulbroState:
							state,
					},
				),
				width: 300,
				height: 200,
			},
			{
				view: BulbroThumbnail(
					{
						bulbro:
							wellRoundedBulbro,
						width: 80,
						height: 80,
					},
				),
				width: 80,
				height: 80,
			},
		];
	for (const {
		view,
		width,
		height,
	} of previews) {
		const source =
			new TextureSource(
				{
					width: 2048,
					height: 2048,
				},
			);
		const loaded =
			Promise.withResolvers<TextureSource>();
		const getAsset =
			spyOn(
				Assets,
				"get",
			).mockReturnValue(
				loaded.promise,
			);
		const stage =
			new Container();
		// Exercise the actual onInit callback without requiring a WebGL renderer in Happy DOM.
		const app =
			{
				stage,
				screen:
					new Rectangle(
						0,
						0,
						width,
						height,
					),
			} as Application;
		try {
			let ready = false;
			const init =
				view.props
					.onInit(
						app,
					)
					.then(
						() => {
							ready = true;
						},
					);
			await Promise.resolve();
			expect(
				getAsset,
			).toHaveBeenCalled();
			expect(
				ready,
			).toBe(
				false,
			);
			loaded.resolve(
				source,
			);
			await init;
			const container =
				stage
					.children[0]!;
			const bounds =
				container.getBounds();
			expect(
				bounds.width,
			).toBeGreaterThan(
				0,
			);
			expect(
				bounds.height,
			).toBeGreaterThan(
				0,
			);
			expect(
				bounds.x +
					bounds.width /
						2,
			).toBeCloseTo(
				width /
					2,
			);
			expect(
				bounds.y +
					bounds.height /
						2,
			).toBeCloseTo(
				height /
					2,
			);
			expect(
				bounds.x,
			).toBeGreaterThanOrEqual(
				width *
					0.09,
			);
			expect(
				bounds.y,
			).toBeGreaterThanOrEqual(
				height *
					0.09,
			);
			expect(
				bounds.maxX,
			).toBeLessThanOrEqual(
				width *
					0.91,
			);
			expect(
				bounds.maxY,
			).toBeLessThanOrEqual(
				height *
					0.91,
			);
			const hasArtwork =
				(
					node: Container,
				): boolean =>
					(node instanceof
						Sprite &&
						node
							.texture
							.source ===
							source) ||
					node.children.some(
						hasArtwork,
					);
			expect(
				hasArtwork(
					container,
				),
			).toBe(
				true,
			);
			expect(
				state.toJSON(),
			).toEqual(
				original,
			);
		} finally {
			// Allow the idle animation update scheduled by init() to settle before teardown.
			await new Promise(
				(
					resolve,
				) =>
					setTimeout(
						resolve,
						0,
					),
			);
			getAsset.mockRestore();
			stage.destroy(
				{
					children: true,
				},
			);
			source.destroy();
		}
	}
});

import {
	expect,
	it,
	spyOn,
} from "bun:test";
import {
	Container,
	Sprite,
	TextureSource,
} from "pixi.js";
import { Assets } from "@/Assets";
import { babyEnemy } from "@/enemies-definitions/baby";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	type EnemyAnimationState,
	EnemySprites,
} from "../EnemySprites";
import { spawnEnemy } from "../EnemyState";
import { BulbaEnemySprite } from "./BulbaEnemySprite";
import { potatoBeetleBaby } from "./EnemiesFrames";

class TestEnemySprite extends BulbaEnemySprite {
	get display() {
		return this
			.container;
	}
}

it("shares baked bodies and only changes filters on effect transitions, preserving death alignment", async () => {
	// Happy DOM has no rasterizer: exercise texture and scene behavior with a canvas drawing stub.
	const context =
		{
			drawImage() {},
			fillRect() {},
			globalCompositeOperation:
				"source-over",
			fillStyle:
				"",
		};
	const getContext =
		spyOn(
			HTMLCanvasElement.prototype,
			"getContext",
		).mockReturnValue(
			context as unknown as ReturnType<
				HTMLCanvasElement["getContext"]
			>,
		);
	const source =
		new TextureSource(
			{
				width: 2048,
				height: 2048,
			},
		);
	const getAsset =
		spyOn(
			Assets,
			"get",
		).mockResolvedValue(
			source,
		);
	const animation: EnemyAnimationState =
		{
			kind: "idle",
			effect:
				"none",
			scaleX: 1,
			scaleY: 1,
			rotation: 0,
			overallScale: 1,
			hitFactor: 0,
			showRageOverlay: false,
		};
	const getState =
		spyOn(
			EnemySprites.prototype,
			"getState",
		).mockImplementation(
			() =>
				animation,
		);
	const a =
		new TestEnemySprite(
			"potatoBeetleBaby",
		);
	const b =
		new TestEnemySprite(
			"potatoBeetleBaby",
		);
	try {
		await Promise.all(
			[
				a.init(),
				b.init(),
			],
		);
		expect(
			getAsset,
		).toHaveBeenCalledTimes(
			1,
		);
		expect(
			a
				.display
				.children
				.length,
		).toBe(
			2,
		);
		const root =
			a
				.display
				.children[1] as Container;
		const scaling =
			(
				root
					.children[0] as Container
			)
				.children[0] as Container;
		const body =
			scaling
				.children[0] as Sprite;
		const otherBody =
			(
				(
					b
						.display
						.children[1] as Container
				)
					.children[0] as Container
			)
				.children[0] as Container;
		const baked =
			body.texture;
		expect(
			baked,
		).toBe(
			(
				otherBody
					.children[0] as Sprite
			)
				.texture,
		);
		expect(
			root
				.filters
				?.length ??
				0,
		).toBe(
			0,
		);
		const padding =
			body.x;
		const enemy =
			spawnEnemy(
				"e",
				{
					x: 100,
					y: 100,
				},
				babyEnemy,
			);
		const update =
			() =>
				a.update(
					enemy,
					deltaTime(
						16,
					),
					nowTime(
						1000,
					),
				);
		animation.effect =
			"hit";
		animation.hitFactor = 0.7;
		update();
		expect(
			root
				.filters
				?.length,
		).toBe(
			1,
		);
		const hitFilters =
			root.filters;
		update();
		expect(
			root.filters,
		).toBe(
			hitFilters,
		);
		animation.effect =
			"rage";
		animation.showRageOverlay = true;
		update();
		expect(
			root
				.filters
				?.length,
		).toBe(
			1,
		);
		expect(
			root.filters,
		).not.toBe(
			hitFilters,
		);
		animation.effect =
			"none";
		animation.kind =
			"dead";
		update();
		expect(
			root
				.filters
				?.length,
		).toBe(
			0,
		);
		expect(
			body.texture,
		).not.toBe(
			baked,
		);
		expect(
			body
				.texture
				.width,
		).toBe(
			potatoBeetleBaby
				.size
				.width,
		);
		expect(
			body.x,
		).toBe(
			0,
		);
		expect(
			body.y,
		).toBeCloseTo(
			0,
		);
		// Padding compensation keeps the original artwork at the same feet anchor.
		expect(
			padding,
		).toBe(
			(baked.width -
				body
					.texture
					.width) /
				2,
		);
		animation.kind =
			"idle";
		update();
		expect(
			body.texture,
		).toBe(
			baked,
		);
		expect(
			body.x,
		).toBe(
			padding,
		);
		expect(
			body.y,
		).toBe(
			-padding,
		);
	} finally {
		a.display.destroy(
			{
				children: true,
			},
		);
		b.display.destroy(
			{
				children: true,
			},
		);
		getContext.mockRestore();
		getAsset.mockRestore();
		getState.mockRestore();
	}
});

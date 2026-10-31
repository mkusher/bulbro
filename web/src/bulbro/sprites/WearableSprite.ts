import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import type { Size } from "@/geometry";
import {
	type ResolvedWearable,
	wearableFrame,
} from "@/items/ItemAppearance";

/**
 * Renders an owned item on the bulbro body, cropped from its atlas.
 * The texture is created once and shared by every animation frame.
 */
export class WearableSprite {
	#texture?: PIXI.Texture;
	#wearable: ResolvedWearable;

	constructor(
		wearable: ResolvedWearable,
	) {
		this.#wearable =
			wearable;
	}

	async init() {
		const frame =
			wearableFrame(
				this
					.#wearable
					.appearance,
				this
					.#wearable
					.itemId,
			);
		if (
			!frame
		)
			return;
		const fullTexture =
			await Assets.get(
				this
					.#wearable
					.appearance
					.atlas,
			);
		this.#texture =
			new PIXI.Texture(
				{
					source:
						fullTexture,
					frame:
						new PIXI.Rectangle(
							frame.x,
							frame.y,
							frame.w,
							frame.h,
						),
				},
			);
	}

	appendTo(
		container: PIXI.Container,
		bodySize: Size,
	) {
		if (
			!this
				.#texture
		)
			return;
		const {
			offset,
			scale,
			stretchX = 1,
			mirror,
			rotation,
		} = this
			.#wearable
			.appearance;
		const gfx =
			new PIXI.Sprite(
				this
					.#texture,
			);
		gfx.anchor.set(
			0.5,
		);
		gfx.position.set(
			bodySize.width /
				2 +
				offset.x,
			offset.y,
		);
		gfx.scale.set(
			scale *
				stretchX *
				(mirror
					? -1
					: 1),
			scale,
		);
		gfx.rotation =
			rotation ??
			0;
		container.addChild(
			gfx,
		);
	}

	/** Frees the cropped texture; the shared atlas stays loaded. */
	destroy() {
		this.#texture?.destroy();
		this.#texture =
			undefined;
	}
}

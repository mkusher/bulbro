import type * as PIXI from "pixi.js";
import type { Size } from "@/geometry";
import { Rectangle } from "@/graphics/Rectangle";

type Anchor =
	| "bottom-center"
	| "center";

type DebugSpriteOptions =
	{
		anchor?: Anchor;
		color?: number;
		alpha?: number;
	};

export class DebugSprite {
	#rectangle: Rectangle;
	#anchor: Anchor;
	#color: number;
	#alpha: number;

	constructor(
		size: Size,
		options: DebugSpriteOptions = {},
	) {
		this.#anchor =
			options.anchor ??
			"bottom-center";
		this.#color =
			options.color ??
			0xff00ff;
		this.#alpha =
			options.alpha ??
			0.9;
		this.#rectangle =
			new Rectangle(
				size,
				this
					.#color,
				this
					.#alpha,
			);
		this.#applyAnchor(
			size,
		);
	}

	appendTo(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
	): void {
		this.#rectangle.appendTo(
			parent,
			layer,
		);
	}

	get position() {
		return this
			.#rectangle
			.position;
	}

	update(
		size: Size,
	): void {
		this.#rectangle.update(
			size,
			this
				.#color,
			this
				.#alpha,
		);
		this.#applyAnchor(
			size,
		);
	}

	remove(): void {
		this.#rectangle.remove();
	}

	#applyAnchor(
		size: Size,
	) {
		const position =
			this
				.#rectangle
				.position;
		if (
			this
				.#anchor ===
			"bottom-center"
		) {
			position.x =
				-size.width /
				2;
			position.y =
				-size.height;
			return;
		}
		position.x =
			-size.width /
			2;
		position.y =
			-size.height /
			2;
	}
}

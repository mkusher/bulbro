import * as PIXI from "pixi.js";
import {
	loadMaterialTexture,
	materialTextureSize,
} from "@/object/MaterialSprite";
import type { BulbroState } from "../..";

const blackBorderRectangleHeight = 35;
const iconSize = 26;
const rowGap = 6;
const iconTextGap = 8;

const textStyle =
	(
		fill: string,
	) =>
		new PIXI.TextStyle(
			{
				fontSize: 20,
				fill,
				stroke:
					{
						width: 4,
						color: 0x000000,
						alignment: 1,
					},
			},
		);

/** A tied sack drawn in a `iconSize` box. */
function drawBag(
	g: PIXI.Graphics,
) {
	const s =
		iconSize /
		24;
	g.roundRect(
		2 *
			s,
		8 *
			s,
		20 *
			s,
		15 *
			s,
		7 *
			s,
	)
		.fill(
			0x8b5a2b,
		)
		.stroke(
			{
				width: 2,
				color: 0x000000,
			},
		);
	g.poly(
		[
			7 *
				s,
			9 *
				s,
			8.5 *
				s,
			2 *
				s,
			15.5 *
				s,
			2 *
				s,
			17 *
				s,
			9 *
				s,
		],
	)
		.fill(
			0xa8743e,
		)
		.stroke(
			{
				width: 2,
				color: 0x000000,
			},
		);
	g.rect(
		6.5 *
			s,
		7 *
			s,
		11 *
			s,
		2.5 *
			s,
	).fill(
		0xf2c230,
	);
	// Material crystal mark on the sack
	g.poly(
		[
			12 *
				s,
			12 *
				s,
			15 *
				s,
			16 *
				s,
			12 *
				s,
			20 *
				s,
			9 *
				s,
			16 *
				s,
		],
	).fill(
		0x4fd7f0,
	);
}

/**
 * Materials of a Bulbro: a material icon with the amount, and right below it
 * the bag with materials left on the field in previous waves, when not empty.
 */
export class MaterialsIndicator {
	#gfx: PIXI.Container;
	#materialIcon: PIXI.Sprite;
	#materialsText: PIXI.Text;
	#bag: PIXI.Container;
	#bagIcon: PIXI.Container;
	#bagText: PIXI.Text;

	constructor(
		_width: number,
		_playerIndex: number,
	) {
		this.#gfx =
			new PIXI.Container();
		const padding = 10;
		this.#gfx.x =
			padding;
		this.#gfx.y =
			40 +
			blackBorderRectangleHeight +
			padding;

		this.#materialIcon =
			new PIXI.Sprite();
		this.#materialIcon.height =
			iconSize;
		this.#materialIcon.width =
			(iconSize *
				materialTextureSize.width) /
			materialTextureSize.height;
		this.#materialIcon.x =
			(iconSize -
				this
					.#materialIcon
					.width) /
			2;
		loadMaterialTexture().then(
			(
				texture,
			) => {
				this.#materialIcon.texture =
					texture;
				this.#materialIcon.height =
					iconSize;
				this.#materialIcon.width =
					(iconSize *
						materialTextureSize.width) /
					materialTextureSize.height;
			},
		);
		this.#materialsText =
			new PIXI.Text(
				{
					text: "0",
					style:
						textStyle(
							"#22ff22",
						),
				},
			);
		this.#materialsText.anchor.set(
			0,
			0.5,
		);
		this.#materialsText.x =
			iconSize +
			iconTextGap;
		this.#materialsText.y =
			iconSize /
			2;

		this.#bag =
			new PIXI.Container();
		this.#bag.y =
			iconSize +
			rowGap;
		this.#bag.visible = false;
		// The icon is drawn around its center so it can be scaled in place
		this.#bagIcon =
			new PIXI.Container();
		const bagGraphics =
			new PIXI.Graphics();
		drawBag(
			bagGraphics,
		);
		bagGraphics.x =
			-iconSize /
			2;
		bagGraphics.y =
			-iconSize /
			2;
		this.#bagIcon.addChild(
			bagGraphics,
		);
		this.#bagIcon.x =
			iconSize /
			2;
		this.#bagIcon.y =
			iconSize /
			2;
		this.#bagText =
			new PIXI.Text(
				{
					text: "0",
					style:
						textStyle(
							"#f2c230",
						),
				},
			);
		this.#bagText.anchor.set(
			0,
			0.5,
		);
		this.#bagText.x =
			iconSize +
			iconTextGap;
		this.#bagText.y =
			iconSize /
			2;
		this.#bag.addChild(
			this
				.#bagIcon,
			this
				.#bagText,
		);

		this.#gfx.addChild(
			this
				.#materialIcon,
			this
				.#materialsText,
			this
				.#bag,
		);
	}

	appendTo(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
	): void {
		parent.addChild(
			this
				.#gfx,
		);
		layer?.attach(
			this
				.#gfx,
		);
	}

	/**
	 * @param pendingBagMaterials materials already counted in the bag but
	 * still flying into it
	 */
	update(
		_width: number,
		player?: BulbroState,
		pendingBagMaterials = 0,
	) {
		this.#materialsText.text =
			player?.materialsAvailable.toString() ??
			"0";
		const bagged =
			(player?.bagMaterials ??
				0) -
			pendingBagMaterials;
		this.#bag.visible =
			bagged >
				0 ||
			pendingBagMaterials >
				0;
		this.#bagText.text =
			Math.max(
				0,
				bagged,
			).toString();
	}

	/** Center of the bag icon in global (canvas) coordinates */
	bagGlobalPosition(): PIXI.Point {
		return this.#bagIcon.getGlobalPosition();
	}

	/** Scales the bag icon, e.g. to bump it when a material drops in */
	setBagScale(
		scale: number,
	) {
		this.#bagIcon.scale.set(
			scale,
		);
	}

	/** Size of the material icon in global (canvas) pixels */
	get iconSize() {
		return (
			iconSize *
			this
				.#gfx
				.worldTransform
				.a
		);
	}
}

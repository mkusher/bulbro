import {
	isEqual,
	rotation,
	zeroPoint,
	type Direction,
	type Point,
	type Position,
	type Size,
} from "@/geometry";
import type { WeaponType } from "@/weapon";
import * as PIXI from "pixi.js";
import { OutlineFilter } from "pixi-filters/outline";
import { Assets } from "@/Assets";

type TextureConfig = {
	position: Position;
	size: Size;
	scale?: number | Point;
};
const empty = {
	position: {
		x: 0,
		y: 0,
	},
	size: {
		width: 0,
		height: 0,
	},
} as const;
export const weapons: Record<WeaponType, TextureConfig> = {
	hand: {
		position: {
			x: 0,
			y: 40,
		},
		size: {
			width: 145,
			height: 110,
		},
	},
	fist: {
		position: {
			x: 235,
			y: 20,
		},
		size: {
			width: 155,
			height: 145,
		},
	},
	pistol: {
		position: {
			x: 480,
			y: 20,
		},
		size: {
			width: 225,
			height: 165,
		},
	},
	smg: {
		position: {
			x: 760,
			y: 10,
		},
		size: {
			width: 220,
			height: 195,
		},
	},
	laserGun: {
		position: {
			x: 76,
			y: 200,
		},
		size: {
			width: 215,
			height: 170,
		},
	},
	knife: {
		position: {
			x: 28,
			y: 428,
		},
		size: {
			width: 290,
			height: 100,
		},
	},
	sword: {
		position: {
			x: 330,
			y: 260,
		},
		size: {
			width: 285,
			height: 155,
		},
	},
	ak47: {
		position: {
			x: 660,
			y: 238,
		},
		size: {
			width: 345,
			height: 137,
		},
	},
	doubleBarrelShotgun: {
		position: {
			x: 640,
			y: 370,
		},
		size: {
			width: 350,
			height: 160,
		},
	},
	brick: empty,
	orcGun: empty,
	enemyGun: empty,
	enemyFist: empty,
} as const;

export const weaponTypes = Object.keys(weapons) as WeaponType[];

type Scaling = 0.125 | 0.25 | 0.5 | 1;
export class WeaponSprite {
	#gfx = new PIXI.Container();
	#sprite = new PIXI.Sprite();
	#weaponType: WeaponType;
	#scaling: Scaling;

	constructor(weaponType: WeaponType, scaling: Scaling = 0.5) {
		this.#scaling = scaling;
		this.#gfx.addChild(this.#sprite);
		this.#weaponType = weaponType;
	}

	async init() {
		const assetName =
			this.#scaling === 1
				? "weapons"
				: this.#scaling === 0.5
					? "weaponsx05"
					: this.#scaling === 0.25
						? "weaponsx025"
						: "weaponsx0125";
		const fullTexture = await Assets.get(assetName, { scaleMode: "linear" });
		const weaponConfig = this.#weaponConfiguration;
		const weaponTexture = new PIXI.Texture({
			source: fullTexture,
			frame: new PIXI.Rectangle(
				weaponConfig.position.x * this.#scaling,
				weaponConfig.position.y * this.#scaling,
				weaponConfig.size.width * this.#scaling,
				weaponConfig.size.height * this.#scaling,
			),
		});

		this.#sprite.texture = weaponTexture;
		this.#sprite.anchor.set(0.5);

		const outlineFilter = new OutlineFilter(2, 0x000000, 1.0);

		this.#sprite.filters = [outlineFilter];
	}

	get #weaponConfiguration() {
		return weapons[this.#weaponType];
	}

	appendTo(container: PIXI.Container) {
		this.remove();
		container.addChild(this.#gfx);

		const weaponConfig = this.#weaponConfiguration;

		if (weaponConfig.scale) {
			this.#gfx.scale = weaponConfig.scale;
		}
	}

	remove() {
		this.#gfx.removeFromParent();
	}

	updatePosition(x: number, y: number) {
		this.#gfx.x = x;
		this.#gfx.y = y;
	}

	aim(direction: Direction) {
		if (isEqual(direction, zeroPoint())) {
			this.#gfx.rotation = 0;
		} else {
			this.#gfx.rotation = rotation(direction) - Math.PI / 2;
		}
		this.#gfx.scale.y = Math.abs(this.#gfx.scale.y);
		if (direction.x < 0) {
			this.#gfx.scale.y *= -1;
		}
	}
}

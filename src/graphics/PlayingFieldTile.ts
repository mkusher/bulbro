import * as PIXI from "pixi.js";
import { zeroPoint, type Position, type Size } from "../geometry";
import type { CurrentState } from "../currentState";
import { canvasSize, playingFieldSize } from "../game-canvas";

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class PlayingFieldTile {
	#sprite: PIXI.TilingSprite;
	#container: PIXI.Container;
	#scale: number;

	constructor(scale: number, size: Size) {
		this.#scale = scale;
		this.#sprite = new PIXI.TilingSprite(size);
		this.#container = new PIXI.Container();
		this.#container.addChild(this.#sprite);
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(
		state: CurrentState,
		parent: PIXI.Container,
		layer?: PIXI.IRenderLayer,
	) {
		const texture = await PIXI.Assets.load(
			"/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/1%20Tiles/FieldsTile_01.png",
		);
		this.#sprite.texture = texture;
		parent.addChild(this.#container);
		layer?.attach(this.#container);
	}

	get container() {
		return this.#container;
	}

	update(deltaTime: number, state: CurrentState): void {
		this.#moveCameraOnSmallScreen(state.players[0]?.position ?? zeroPoint());
	}

	#moveCameraOnSmallScreen(playerPosition: Position) {
		if (!this.#isSmallScreen(playingFieldSize.value, canvasSize.value)) {
			return;
		}
		const scaledPosition = {
			x: playerPosition.x / this.#scale,
			y: playerPosition.y / this.#scale,
		};

		this.#container.x = -scaledPosition.x + canvasSize.value.width / 2;
		this.#container.y = -scaledPosition.y + canvasSize.value.height / 2;
	}

	#isSmallScreen(playingFieldSize: Size, canvasSize: Size) {
		return (
			playingFieldSize.width > canvasSize.width ||
			playingFieldSize.height > canvasSize.height
		);
	}
}

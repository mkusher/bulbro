import * as PIXI from "pixi.js";
import type { BulbroState } from "../bulbro";
import type { CurrentState } from "../currentState";
import type { EnemyState } from "../enemy/EnemyState";
import { type BulbroSprite, createBulbroSprite } from "../bulbro/Sprite";
import { createEnemySprite, type EnemySprite } from "../enemy/Sprite";
import { ShotSprite } from "../shot/ShotSprite";
import { PlayingFieldTile } from "./PlayingFieldTile";
import type { Logger } from "pino";
import { MaterialSprite } from "../object/MaterialSprite";
import { classicMapSize } from "../game-canvas";
import { zeroPoint } from "@/geometry";
import type { Material } from "../object";
import type { SpawningEnemy } from "../object/SpawningEnemyState";
import { SpawningEnemySprite } from "../object/SpawningEnemySprite";
import type { Camera } from "./Camera";

export type ObjectSprite<O> = {
	init(deltaTime: number, o: O): Promise<void>;
	update(deltaTime: number, o: O): Promise<void>;
};

/**
 * Storybook scene that handles display of players, enemies, and game objects.
 * Uses generic Camera for manual positioning in stories.
 */
export class StorybookScene {
	#camera: Camera;
	#playerSprites: Map<string, BulbroSprite> = new Map();
	#enemySprites: Map<string, EnemySprite> = new Map();
	#shotSprites: Map<string, ShotSprite> = new Map();
	#materialSprites: Map<string, MaterialSprite> = new Map();
	#spawningSprites: Map<string, SpawningEnemySprite> = new Map();
	#playingFieldTile!: PlayingFieldTile;
	#playingFieldLayer: PIXI.IRenderLayer;
	#groundLayer: PIXI.IRenderLayer;
	#logger: Logger;
	#debug: boolean;

	constructor(logger: Logger, debug: boolean, camera: Camera, scale: number) {
		this.#camera = camera;
		this.#camera.zoom(scale);
		this.#logger = logger;
		this.#debug = debug;
		this.#groundLayer = new PIXI.RenderLayer();
		this.#playingFieldLayer = new PIXI.RenderLayer();
		this.#camera.stage.addChild(this.#groundLayer);
		this.#camera.stage.addChild(this.#playingFieldLayer);
		this.#playingFieldTile = new PlayingFieldTile(classicMapSize);
		this.#playingFieldTile.init(this.#camera.stage, this.#groundLayer);
	}

	/**
	 * Initializes sprites.
	 */
	async init(state: CurrentState) {
		this.#logger.info(
			{
				playingFieldSize: classicMapSize,
				mapSize: state.mapSize,
				state,
			},
			"StorybookScene init",
		);
		this.update(0, state);
	}

	/**
	 * Updates sprites each frame based on state.
	 */
	update(deltaTime: number, state: CurrentState): void {
		this.#updatePlayers(deltaTime, state);
		this.#updateEnemies(deltaTime, state);
		this.#updateShots(deltaTime, state);
		this.#updateObjects(deltaTime, state);
		this.#playingFieldTile.update(deltaTime, state);
		// Note: No automatic camera update - storybooks control camera manually
	}

	get playingFieldContainer() {
		return this.#playingFieldTile.container;
	}

	get playingFieldLayer() {
		return this.#playingFieldLayer;
	}

	get groundLayer() {
		return this.#groundLayer;
	}

	get camera() {
		return this.#camera;
	}

	#updatePlayers(deltaTime: number, state: CurrentState) {
		// Sync player sprites
		state.players.forEach((p: BulbroState) => {
			if (!this.#playerSprites.has(p.id)) {
				const sprite = createBulbroSprite(p.type, this.#debug);
				sprite.appendTo(
					this.#playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#playerSprites.set(p.id, sprite);
			}
		});
		Array.from(this.#playerSprites.entries()).forEach(([id, sprite]) => {
			if (!state.players.find((p) => p.id === id)) {
				sprite.remove();
				this.#playerSprites.delete(id);
			}
		});
		// Update player positions and opacity
		state.players.forEach((p: BulbroState) => {
			const sprite = this.#playerSprites.get(p.id)!;
			sprite.update(p, deltaTime);
		});
	}

	#updateEnemies(deltaTime: number, state: CurrentState) {
		state.enemies.forEach((e: EnemyState) => {
			if (!this.#enemySprites.has(e.id)) {
				const sprite = createEnemySprite(e.type, this.#debug);
				sprite.appendTo(
					this.#playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#enemySprites.set(e.id, sprite);
			}
			const sprite = this.#enemySprites.get(e.id)!;
			sprite.update(e, deltaTime);
		});
		Array.from(this.#enemySprites.entries()).forEach(([id, sprite]) => {
			if (!state.enemies.find((e) => e.id === id)) {
				sprite.remove();
				this.#enemySprites.delete(id);
			}
		});
	}

	#updateShots(deltaTime: number, state: CurrentState) {
		state.shots.forEach((shot) => {
			if (!this.#shotSprites.has(shot.id)) {
				const sprite = new ShotSprite(shot);
				sprite.appendTo(
					this.#playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#shotSprites.set(shot.id, sprite);
			}
		});
		Array.from(this.#shotSprites.entries()).forEach(([id, sprite]) => {
			if (!state.shots.find((e) => e.id === id)) {
				sprite.remove();
				this.#shotSprites.delete(id);
			}
		});
		state.shots.forEach((s) => {
			const sprite = this.#shotSprites.get(s.id)!;
			sprite.update(deltaTime, s);
		});
	}

	#updateObjects(deltaTime: number, state: CurrentState) {
		this.#updateMaterials(
			deltaTime,
			state.objects.filter((object) => object.type === "material"),
		);

		this.#updateSpawnings(
			deltaTime,
			state.objects.filter((object) => object.type === "spawning-enemy"),
		);
	}

	#updateSpawnings(deltaTime: number, spawnings: SpawningEnemy[]) {
		spawnings.forEach((spawning) => {
			if (!this.#spawningSprites.has(spawning.id)) {
				const sprite = new SpawningEnemySprite(this.#debug);
				sprite.appendTo(
					this.#playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#spawningSprites.set(spawning.id, sprite);
			}
			const sprite = this.#spawningSprites.get(spawning.id)!;
			sprite.update(spawning, deltaTime);
		});
		Array.from(this.#spawningSprites.entries()).forEach(([id, sprite]) => {
			if (!spawnings.find((e) => e.id === id)) {
				sprite.remove();
				this.#spawningSprites.delete(id);
			}
		});
	}

	#updateMaterials(deltaTime: number, materials: Material[]) {
		materials.forEach((material) => {
			if (!this.#materialSprites.has(material.id)) {
				const sprite = new MaterialSprite(this.#debug);
				sprite.init(
					material,
					this.#playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#materialSprites.set(material.id, sprite);
			}
			const sprite = this.#materialSprites.get(material.id)!;
			sprite.update(material, deltaTime);
		});
		Array.from(this.#materialSprites.entries()).forEach(([id, sprite]) => {
			if (!materials.find((e) => e.id === id)) {
				sprite.remove();
				this.#materialSprites.delete(id);
			}
		});
	}
}

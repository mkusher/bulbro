import * as PIXI from "pixi.js";
import type { BulbroState } from "../bulbro";
import type { WaveState } from "../waveState";
import type { EnemyState } from "../enemy/EnemyState";
import { type BulbroSprite, createBulbroSprite } from "../bulbro/Sprite";
import { createEnemySprite, type EnemySprite } from "../enemy/Sprite";
import { ShotSprite } from "../shot/ShotSprite";
import { PlayingFieldTile } from "./PlayingFieldTile";
import type { Logger } from "pino";
import { MaterialSprite } from "../object/MaterialSprite";
import { classicMapSize } from "../game-canvas";
import type { Material } from "../object";
import type { SpawningEnemy } from "../object/SpawningEnemyState";
import { SpawningEnemySprite } from "../object/SpawningEnemySprite";
import type { DeltaTime, NowTime } from "@/time";
import { deltaTime, nowTime } from "@/time";

export type ObjectSprite<O> = {
	init(deltaTime: DeltaTime, o: O): Promise<void>;
	update(deltaTime: DeltaTime, o: O): Promise<void>;
};

export interface SceneCamera {
	stage: PIXI.Container;
	zoom(scale: number): void;
}

/**
 * Base scene class that handles common sprite management logic.
 * Subclasses handle camera-specific behavior and initialization.
 */
export abstract class BaseScene<TCamera extends SceneCamera> {
	#camera: TCamera;
	#playerSprites: Map<string, BulbroSprite> = new Map();
	#enemySprites: Map<string, EnemySprite> = new Map();
	#shotSprites: Map<string, ShotSprite> = new Map();
	#materialSprites: Map<string, MaterialSprite> = new Map();
	#spawningSprites: Map<string, SpawningEnemySprite> = new Map();
	protected playingFieldTile!: PlayingFieldTile;
	#playingFieldLayer: PIXI.RenderLayer;
	#groundLayer: PIXI.RenderLayer;
	#logger: Logger;
	#debug: boolean;

	constructor(logger: Logger, debug: boolean, camera: TCamera, scale: number) {
		this.#camera = camera;
		this.#camera.zoom(scale);
		this.#logger = logger;
		this.#debug = debug;
		this.#groundLayer = new PIXI.RenderLayer();
		this.#playingFieldLayer = new PIXI.RenderLayer();
		this.#camera.stage.addChild(this.#groundLayer);
		this.#camera.stage.addChild(this.#playingFieldLayer);
		this.playingFieldTile = new PlayingFieldTile(classicMapSize);
	}

	/**
	 * Initializes the scene. Subclasses should call this and handle camera-specific setup.
	 */
	async init(state: WaveState) {
		this.#logger.info(
			{
				playingFieldSize: classicMapSize,
				mapSize: state.mapSize,
				state,
			},
			`${this.constructor.name} init`,
		);
		await this.initializePlayingField();
		this.update(deltaTime(0), nowTime(0), state);
	}

	/**
	 * Template method for playing field initialization.
	 * Subclasses can override for different initialization timing.
	 */
	protected async initializePlayingField(): Promise<void> {
		await this.playingFieldTile.init(
			this.#camera.stage,
			this.#playingFieldLayer,
			this.#groundLayer,
		);
	}

	/**
	 * Updates sprites each frame based on state.
	 * Subclasses should call this and handle camera-specific updates.
	 */
	update(deltaTime: DeltaTime, now: NowTime, state: WaveState): void {
		this.#updatePlayers(deltaTime, now, state);
		this.#updateEnemies(deltaTime, now, state);
		this.#updateShots(deltaTime, state);
		this.#updateObjects(deltaTime, state);
		this.playingFieldTile.update(deltaTime, state);
		this.updateCamera(deltaTime, state);
	}

	/**
	 * Template method for camera updates. Subclasses implement camera-specific behavior.
	 */
	protected abstract updateCamera(deltaTime: DeltaTime, state: WaveState): void;

	/**
	 * Template method for debug logging. Override to customize logging behavior.
	 */
	protected logSpriteCreation(
		type: "player" | "enemy",
		id: string,
		position: any,
		totalSprites: number,
	): void {
		if (this.#debug) {
			this.#logger.debug(
				`Creating sprite for ${type} ${id} at position`,
				position,
			);
			this.#logger.debug(
				`${type} sprite ${id} added to scene, total sprites: ${totalSprites}`,
			);
		}
	}

	get playingFieldContainer() {
		return this.playingFieldTile.container;
	}

	get playingFieldLayer() {
		return this.#playingFieldLayer;
	}

	get groundLayer() {
		return this.#groundLayer;
	}

	protected get camera(): TCamera {
		return this.#camera;
	}

	#updatePlayers(deltaTime: DeltaTime, now: NowTime, state: WaveState) {
		// Sync player sprites
		state.players.forEach((p: BulbroState) => {
			if (!this.#playerSprites.has(p.id)) {
				const sprite = createBulbroSprite(p.type, this.#debug);
				sprite.init(p);
				sprite.appendTo(
					this.playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#playerSprites.set(p.id, sprite);
				this.logSpriteCreation(
					"player",
					p.id,
					p.position,
					this.#playerSprites.size,
				);
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
			sprite.update(p, deltaTime, now);
		});
	}

	#updateEnemies(deltaTime: DeltaTime, now: NowTime, state: WaveState) {
		state.enemies.forEach((e: EnemyState) => {
			if (!this.#enemySprites.has(e.id)) {
				const sprite = createEnemySprite(e.type, this.#debug);
				sprite.appendTo(
					this.playingFieldTile.container,
					this.#playingFieldLayer,
				);
				this.#enemySprites.set(e.id, sprite);
				this.logSpriteCreation(
					"enemy",
					e.id,
					e.position,
					this.#enemySprites.size,
				);
			}
			const sprite = this.#enemySprites.get(e.id)!;
			sprite.update(e, deltaTime, now);
		});
		Array.from(this.#enemySprites.entries()).forEach(([id, sprite]) => {
			if (!state.enemies.find((e) => e.id === id)) {
				sprite.remove();
				this.#enemySprites.delete(id);
			}
		});
	}

	#updateShots(deltaTime: DeltaTime, state: WaveState) {
		state.shots.forEach((shot) => {
			if (!this.#shotSprites.has(shot.id)) {
				const sprite = new ShotSprite(shot);
				sprite.appendTo(
					this.playingFieldTile.container,
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

	#updateObjects(deltaTime: DeltaTime, state: WaveState) {
		this.#updateMaterials(
			deltaTime,
			state.objects.filter((object) => object.type === "material"),
		);

		this.#updateSpawnings(
			deltaTime,
			state.objects.filter((object) => object.type === "spawning-enemy"),
		);
	}

	#updateSpawnings(deltaTime: DeltaTime, spawnings: SpawningEnemy[]) {
		spawnings.forEach((spawning) => {
			if (!this.#spawningSprites.has(spawning.id)) {
				const sprite = new SpawningEnemySprite(this.#debug);
				sprite.appendTo(
					this.playingFieldTile.container,
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

	#updateMaterials(deltaTime: DeltaTime, materials: Material[]) {
		materials.forEach((material) => {
			if (!this.#materialSprites.has(material.id)) {
				const sprite = new MaterialSprite(this.#debug);
				sprite.init(
					material,
					this.playingFieldTile.container,
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

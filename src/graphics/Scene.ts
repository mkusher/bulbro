import * as PIXI from "pixi.js";
import type { Size } from "../geometry";
import type { BulbroState } from "../bulbro";
import type { CurrentState } from "../currentState";
import type { EnemyState } from "../enemy/EnemyState";
import { type BulbroSprite, createBulbroSprite } from "../bulbro/Sprite";
import { createEnemySprite, type EnemySprite } from "../enemy/Sprite";
import { TimerSprite } from "./TimerSprite";
import { ShotSprite } from "../shot/ShotSprite";
import { HealthSprite } from "./HealthSprite";
import { PlayingFieldTile } from "./PlayingFieldTile";
import { WaveSprite } from "./WaveSprite";
import type { Logger } from "pino";
import { MaterialSprite } from "./MaterialSprite";
import { ExperienceSprite } from "./ExperienceSprite";

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class Scene {
	#app: PIXI.Application;
	#playerSprites: Map<string, BulbroSprite> = new Map();
	#enemySprites: Map<string, EnemySprite> = new Map();
	#shotSprites: Map<string, ShotSprite> = new Map();
	#materialSprites: Map<string, MaterialSprite> = new Map();
	#timerSprite!: TimerSprite;
	#waveSprite!: WaveSprite;
	#viewSize!: Size;
	#healthSprites: Map<string, HealthSprite> = new Map();
	#experienceSprites: Map<string, ExperienceSprite> = new Map();
	#playingFieldTile!: PlayingFieldTile;
	#playingFieldLayer: PIXI.IRenderLayer;
	#uiLayer: PIXI.IRenderLayer;
	#scale: number;
	#logger: Logger;
	#debug: boolean;

	constructor(
		logger: Logger,
		debug: boolean,
		app: PIXI.Application,
		scale: number,
	) {
		this.#app = app;
		this.#scale = scale;
		this.#logger = logger;
		this.#debug = debug;
		this.#playingFieldLayer = new PIXI.RenderLayer();
		this.#uiLayer = new PIXI.RenderLayer();
		this.#app.stage.addChild(this.#playingFieldLayer);
		this.#app.stage.addChild(this.#uiLayer);
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(state: CurrentState) {
		this.#viewSize = {
			width: this.#app.view.width,
			height: this.#app.view.height,
		};
		this.#logger.info(
			{ scale: this.#scale, viewSize: this.#viewSize, mapSize: state.mapSize },
			"Scene init",
		);
		this.#playingFieldTile = new PlayingFieldTile(this.#viewSize);
		await this.#playingFieldTile.init(
			state,
			this.#app.stage,
			this.#playingFieldLayer,
		);
		// Create player sprites
		state.players.forEach((p: BulbroState, i: number) => {
			const sprite = createBulbroSprite(p.type, this.#scale, this.#debug);
			sprite.appendTo(this.#app.stage, this.#playingFieldLayer);
			this.#playerSprites.set(p.id, sprite);
			const healthSprite = new HealthSprite(this.#viewSize, i);
			this.#healthSprites.set(p.id, healthSprite);
			healthSprite.appendTo(this.#app.stage, this.#uiLayer);
			const experienceSprite = new ExperienceSprite(this.#viewSize, i);
			this.#experienceSprites.set(p.id, experienceSprite);
			experienceSprite.appendTo(this.#app.stage, this.#uiLayer);
		});
		// Create enemy sprites
		state.enemies.forEach((e: EnemyState) => {
			const sprite = createEnemySprite(e.type, this.#scale, this.#debug);
			sprite.appendTo(this.#app.stage, this.#playingFieldLayer);
			this.#enemySprites.set(e.id, sprite);
		});
		// Timer text
		this.#timerSprite = new TimerSprite();
		this.#timerSprite.appendTo(this.#app.stage, this.#uiLayer);
		this.#waveSprite = new WaveSprite();
		this.#waveSprite.appendTo(this.#app.stage, this.#uiLayer);
	}

	/**
	 * Updates sprites and UI each frame based on state.
	 */
	update(deltaTime: number, state: CurrentState): void {
		this.#updatePlayers(deltaTime, state);
		this.#updateEnemies(deltaTime, state);
		this.#updateShots(deltaTime, state);
		this.#updateObjects(deltaTime, state);
		this.#timerSprite.update(state.round, this.#viewSize.width);
		this.#waveSprite.update(state.round, this.#viewSize.width);
		state.players.forEach((player) => {
			this.#healthSprites.get(player.id)?.update(this.#viewSize, player);
			this.#experienceSprites.get(player.id)?.update(this.#viewSize, player);
		});
	}

	#updatePlayers(deltaTime: number, state: CurrentState) {
		// Sync player sprites
		state.players.forEach((p: BulbroState) => {
			if (!this.#playerSprites.has(p.id)) {
				const sprite = createBulbroSprite(p.type, this.#scale, this.#debug);
				sprite.appendTo(this.#app.stage, this.#playingFieldLayer);
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
				const sprite = createEnemySprite(e.type, this.#scale, this.#debug);
				sprite.appendTo(this.#app.stage, this.#playingFieldLayer);
				this.#enemySprites.set(e.id, sprite);
			}
		});
		Array.from(this.#enemySprites.entries()).forEach(([id, sprite]) => {
			if (!state.enemies.find((e) => e.id === id)) {
				sprite.remove();
				this.#enemySprites.delete(id);
			}
		});
		// Update enemy positions
		state.enemies.forEach((e: EnemyState) => {
			const sprite = this.#enemySprites.get(e.id)!;
			sprite.update(e, deltaTime);
		});
	}

	#updateShots(deltaTime: number, state: CurrentState) {
		state.shots.forEach((shot) => {
			if (!this.#shotSprites.has(shot.id)) {
				const sprite = new ShotSprite(this.#scale, shot);
				sprite.appendTo(this.#app.stage, this.#playingFieldLayer);
				this.#shotSprites.set(shot.id, sprite);
			}
		});
		Array.from(this.#shotSprites.entries()).forEach(([id, sprite]) => {
			if (!state.shots.find((e) => e.id === id)) {
				sprite.remove();
				this.#shotSprites.delete(id);
			}
		});
		// Update enemy positions
		state.shots.forEach((e) => {
			const sprite = this.#shotSprites.get(e.id)!;
			sprite.updatePosition(e.position);
			sprite.setAlpha(1);
		});
	}

	#updateObjects(deltaTime: number, state: CurrentState) {
		const materials = state.objects.filter(
			(object) => object.type === "material",
		);
		materials.forEach((material) => {
			if (!this.#materialSprites.has(material.id)) {
				const sprite = new MaterialSprite(this.#scale, this.#debug);
				sprite.init(material, this.#app.stage, this.#playingFieldLayer);
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

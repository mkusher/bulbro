import * as PIXI from "pixi.js";
import type { Size } from "../geometry";
import type { BulbroState } from "../bulbro";
import type { CurrentState } from "../currentState";
import type { EnemyState } from "../enemy/EnemyState";
import { type BulbroSprite, createBulbroSprite } from "../bulbro/Sprite";
import { createEnemySprite, type EnemySprite } from "../enemy/Sprite";
import { TimerSprite } from "./TimerSprite";
import { ShotSprite } from "./ShotSprite";
import { HealthSprite } from "./HealthSprite";
import { PlayingFieldTile } from "./PlayingFieldTile";
import { WaveSprite } from "./WaveSprite";
import type { Logger } from "pino";

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class Scene {
	#app: PIXI.Application;
	#playerSprites: Map<string, BulbroSprite> = new Map();
	#enemySprites: Map<string, EnemySprite> = new Map();
	#shotSprites: Map<string, ShotSprite> = new Map();
	#timerSprite!: TimerSprite;
	#waveSprite!: WaveSprite;
	#viewSize!: Size;
	#healthSprite!: HealthSprite;
	#playingFieldTile!: PlayingFieldTile;
	#scale: number;
	#logger: Logger;

	constructor(logger: Logger, app: PIXI.Application, scale: number) {
		this.#app = app;
		this.#scale = scale;
		this.#logger = logger;
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
		await this.#playingFieldTile.init(state, this.#app.stage);
		// Create player sprites
		state.players.forEach((p: BulbroState) => {
			const sprite = createBulbroSprite(p.type, this.#scale);
			sprite.appendTo(this.#app.stage);
			this.#playerSprites.set(p.id, sprite);
		});
		// Create enemy sprites
		state.enemies.forEach((e: EnemyState) => {
			const sprite = createEnemySprite(e.type, this.#scale);
			sprite.appendTo(this.#app.stage);
			this.#enemySprites.set(e.id, sprite);
		});
		// Timer text
		this.#timerSprite = new TimerSprite();
		this.#timerSprite.appendTo(this.#app.stage);
		this.#waveSprite = new WaveSprite();
		this.#waveSprite.appendTo(this.#app.stage);
		this.#healthSprite = new HealthSprite(this.#viewSize);
		this.#healthSprite.appendTo(this.#app.stage);
	}

	/**
	 * Updates sprites and UI each frame based on state.
	 */
	update(deltaTime: number, state: CurrentState): void {
		this.#updatePlayers(deltaTime, state);
		this.#updateEnemies(deltaTime, state);
		this.#updateShots(deltaTime, state);
		this.#timerSprite.update(state.round, this.#viewSize.width);
		this.#waveSprite.update(state.round, this.#viewSize.width);
		const player = state.players.find((p) => p.id === state.currentPlayerId);
		this.#healthSprite.update(this.#viewSize, player);
	}

	#updatePlayers(deltaTime: number, state: CurrentState) {
		// Sync player sprites
		state.players.forEach((p: BulbroState) => {
			if (!this.#playerSprites.has(p.id)) {
				const sprite = createBulbroSprite(p.type, this.#scale);
				sprite.appendTo(this.#app.stage);
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
				const sprite = createEnemySprite(e.type, this.#scale);
				sprite.appendTo(this.#app.stage);
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
				sprite.appendTo(this.#app.stage);
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
}

import * as PIXI from "pixi.js";
import type { Size } from "../geometry";
import type { Bulbro } from "../bulbro";
import type { CurrentState, PlayerState, EnemyState } from "../currentState";
import { PlayerSprite } from "./PlayerSprite";
import { EnemySprite } from "./EnemySprite";
import { TimerSprite } from "./TimerSprite";
import { ShotSprite } from "./ShotSprite";

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class Scene {
	#app: PIXI.Application;
	#bulbro: Bulbro;
	#roundProcess: import("../RoundProcess").RoundProcess;
	#playerSprites: Map<string, PlayerSprite> = new Map();
	#enemySprites: Map<string, EnemySprite> = new Map();
	#shotSprites: Map<string, ShotSprite> = new Map();
	#timerSprite!: TimerSprite;
	#viewSize!: Size;

	constructor(
		app: PIXI.Application,
		bulbro: Bulbro,
		roundProcess: import("../RoundProcess").RoundProcess,
	) {
		this.#app = app;
		this.#bulbro = bulbro;
		this.#roundProcess = roundProcess;
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(state: CurrentState) {
		this.#viewSize = {
			width: this.#app.view.width,
			height: this.#app.view.height,
		};
		await this.#initBackground();
		// Create player sprites
		state.players.forEach((p: PlayerState) => {
			const sprite = new PlayerSprite();
			sprite.appendTo(this.#app.stage);
			this.#playerSprites.set(p.id, sprite);
		});
		// Create enemy sprites
		state.enemies.forEach((e: EnemyState) => {
			const sprite = new EnemySprite();
			sprite.appendTo(this.#app.stage);
			this.#enemySprites.set(e.id, sprite);
		});
		// Timer text
		this.#timerSprite = new TimerSprite();
		this.#timerSprite.appendTo(this.#app.stage);
	}

	async #initBackground() {
		const texture = await PIXI.Assets.load("/assets/grass.png");
		const tilingSprite = new PIXI.TilingSprite({
			texture,
			width: this.#app.view.width,
			height: this.#app.view.height,
		});
		this.#app.stage.addChild(tilingSprite);
	}

	/**
	 * Updates sprites and UI each frame based on state.
	 */
	update(deltaTime: number, state: CurrentState): void {
		this.#updatePlayers(deltaTime, state);
		this.#updateEnemies(deltaTime, state);
		this.#updateShots(deltaTime, state);
		// Timer
		const msLeft = this.#roundProcess.getTimeLeft();
		this.#timerSprite.updateText(msLeft, this.#viewSize.width);
	}

	#updatePlayers(deltaTime: number, state: CurrentState) {
		// Sync player sprites
		state.players.forEach((p: PlayerState) => {
			if (!this.#playerSprites.has(p.id)) {
				const sprite = new PlayerSprite();
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
		state.players.forEach((p: PlayerState) => {
			const sprite = this.#playerSprites.get(p.id)!;
			sprite.updatePosition(p.position);
			sprite.setAlpha(p.healthPoints / this.#bulbro.baseStats.maxHp);
		});
	}

	#updateEnemies(deltaTime: number, state: CurrentState) {
		state.enemies.forEach((e: EnemyState) => {
			if (!this.#enemySprites.has(e.id)) {
				const sprite = new EnemySprite();
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
			sprite.updatePosition(e.position);
			sprite.setAlpha(1);
		});
	}

	#updateShots(deltaTime: number, state: CurrentState) {
		state.shots.forEach((e) => {
			if (!this.#shotSprites.has(e.id)) {
				const sprite = new ShotSprite();
				sprite.appendTo(this.#app.stage);
				this.#shotSprites.set(e.id, sprite);
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

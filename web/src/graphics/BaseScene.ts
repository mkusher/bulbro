import type { Logger } from "pino";
import * as PIXI from "pixi.js";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { BulbroState } from "../bulbro";
import {
	type BulbroSprite,
	createBulbroSprite,
} from "../bulbro/Sprite";
import type { EnemyState } from "../enemy/EnemyState";
import {
	createEnemySprite,
	type EnemySprite,
} from "../enemy/Sprite";
import { classicMapSize } from "../game-canvas";
import type { Material } from "../object";
import { MaterialSprite } from "../object/MaterialSprite";
import { SpawningEnemySprite } from "../object/SpawningEnemySprite";
import type { SpawningEnemy } from "../object/SpawningEnemyState";
import { ShotSprite } from "../shot/ShotSprite";
import type { WaveState } from "../waveState";
import { PlayingFieldTile } from "./PlayingFieldTile";

export type ObjectSprite<
	O,
> =
	{
		init(
			deltaTime: DeltaTime,
			o: O,
		): Promise<void>;
		update(
			deltaTime: DeltaTime,
			o: O,
		): Promise<void>;
	};

export interface SceneCamera {
	stage: PIXI.Container;
	zoom(
		scale: number,
	): void;
}

/**
 * Base scene class that handles common sprite management logic.
 * Subclasses handle camera-specific behavior and initialization.
 */
export abstract class BaseScene<
	TCamera extends
		SceneCamera,
> {
	#camera: TCamera;
	#playerSprites: Map<
		string,
		BulbroSprite
	> =
		new Map();
	#enemySprites: Map<
		string,
		EnemySprite
	> =
		new Map();
	#shotSprites: Map<
		string,
		ShotSprite
	> =
		new Map();
	#materialSprites: Map<
		string,
		MaterialSprite
	> =
		new Map();
	#spawningSprites: Map<
		string,
		SpawningEnemySprite
	> =
		new Map();
	protected playingFieldTile!: PlayingFieldTile;
	#playingFieldLayer: PIXI.RenderLayer;
	#groundLayer: PIXI.RenderLayer;
	#logger: Logger;
	#debug: boolean;

	constructor(
		logger: Logger,
		debug: boolean,
		camera: TCamera,
		scale: number,
	) {
		this.#camera =
			camera;
		this.#camera.zoom(
			scale,
		);
		this.#logger =
			logger;
		this.#debug =
			debug;
		this.#groundLayer =
			new PIXI.RenderLayer();
		this.#playingFieldLayer =
			new PIXI.RenderLayer();
		this.#camera.stage.addChild(
			this
				.#groundLayer,
		);
		this.#camera.stage.addChild(
			this
				.#playingFieldLayer,
		);
		this.playingFieldTile =
			new PlayingFieldTile(
				classicMapSize,
			);
	}

	/**
	 * Initializes the scene. Subclasses should call this and handle camera-specific setup.
	 */
	async init(
		state: WaveState,
	) {
		this.#logger.info(
			{
				playingFieldSize:
					classicMapSize,
				mapSize:
					state.mapSize,
				state,
			},
			`${this.constructor.name} init`,
		);
		await this.initializePlayingField();
		this.update(
			deltaTime(
				0,
			),
			nowTime(
				0,
			),
			state,
		);
	}

	/**
	 * Template method for playing field initialization.
	 * Subclasses can override for different initialization timing.
	 */
	protected async initializePlayingField(): Promise<void> {
		await this.playingFieldTile.init(
			this
				.#camera
				.stage,
			this
				.#playingFieldLayer,
			this
				.#groundLayer,
		);
	}

	/**
	 * Updates sprites each frame based on state.
	 * Subclasses should call this and handle camera-specific updates.
	 */
	update(
		deltaTime: DeltaTime,
		now: NowTime,
		state: WaveState,
	): void {
		this.#updatePlayers(
			deltaTime,
			now,
			state,
		);
		this.#updateEnemies(
			deltaTime,
			now,
			state,
		);
		this.#updateShots(
			deltaTime,
			state,
		);
		this.#updateObjects(
			deltaTime,
			state,
		);
		this.playingFieldTile.update(
			deltaTime,
			state,
		);
		this.updateCamera(
			deltaTime,
			state,
		);
	}

	/**
	 * Template method for camera updates. Subclasses implement camera-specific behavior.
	 */
	protected abstract updateCamera(
		deltaTime: DeltaTime,
		state: WaveState,
	): void;

	/**
	 * Template method for debug logging. Override to customize logging behavior.
	 */
	protected logSpriteCreation(
		type:
			| "player"
			| "enemy",
		id: string,
		position: any,
		totalSprites: number,
	): void {
		if (
			this
				.#debug
		) {
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
		return this
			.playingFieldTile
			.container;
	}

	get playingFieldLayer() {
		return this
			.#playingFieldLayer;
	}

	get groundLayer() {
		return this
			.#groundLayer;
	}

	protected get camera(): TCamera {
		return this
			.#camera;
	}

	#updatePlayers(
		deltaTime: DeltaTime,
		now: NowTime,
		state: WaveState,
	) {
		// Issue 5: build ID set once for O(1) stale-sprite lookup
		const playerIds =
			new Set(
				state.players.map(
					(
						p,
					) =>
						p.id,
				),
			);

		// Remove stale sprites
		for (const [
			id,
			sprite,
		] of this
			.#playerSprites) {
			if (
				!playerIds.has(
					id,
				)
			) {
				sprite.remove();
				this.#playerSprites.delete(
					id,
				);
			}
		}

		// Create/update sprites
		for (const p of state.players) {
			if (
				!this.#playerSprites.has(
					p.id,
				)
			) {
				const sprite =
					createBulbroSprite(
						p.type,
						this
							.#debug,
					);
				sprite.init(
					p,
				);
				sprite.appendTo(
					this
						.playingFieldTile
						.container,
					this
						.#playingFieldLayer,
				);
				this.#playerSprites.set(
					p.id,
					sprite,
				);
				this.logSpriteCreation(
					"player",
					p.id,
					p.position,
					this
						.#playerSprites
						.size,
				);
			}
			const sprite =
				this.#playerSprites.get(
					p.id,
				)!;
			sprite.update(
				p,
				deltaTime,
				now,
			);
		}
	}

	#updateEnemies(
		deltaTime: DeltaTime,
		now: NowTime,
		state: WaveState,
	) {
		// Issue 5: build ID set once for O(1) stale-sprite lookup
		const enemyIds =
			new Set(
				state.enemies.map(
					(
						e,
					) =>
						e.id,
				),
			);

		// Remove stale sprites
		for (const [
			id,
			sprite,
		] of this
			.#enemySprites) {
			if (
				!enemyIds.has(
					id,
				)
			) {
				sprite.remove();
				this.#enemySprites.delete(
					id,
				);
			}
		}

		// Create/update sprites
		for (const e of state.enemies) {
			if (
				!this.#enemySprites.has(
					e.id,
				)
			) {
				const sprite =
					createEnemySprite(
						e.type,
						this
							.#debug,
					);
				sprite.appendTo(
					this
						.playingFieldTile
						.container,
					this
						.#playingFieldLayer,
				);
				this.#enemySprites.set(
					e.id,
					sprite,
				);
				this.logSpriteCreation(
					"enemy",
					e.id,
					e.position,
					this
						.#enemySprites
						.size,
				);
			}
			const sprite =
				this.#enemySprites.get(
					e.id,
				)!;
			sprite.update(
				e,
				deltaTime,
				now,
			);
		}
	}

	#updateShots(
		deltaTime: DeltaTime,
		state: WaveState,
	) {
		// Issue 5: build ID set once for O(1) stale-sprite lookup
		const shotIds =
			new Set(
				state.shots.map(
					(
						s,
					) =>
						s.id,
				),
			);

		// Remove stale sprites
		for (const [
			id,
			sprite,
		] of this
			.#shotSprites) {
			if (
				!shotIds.has(
					id,
				)
			) {
				sprite.remove();
				this.#shotSprites.delete(
					id,
				);
			}
		}

		// Create/update sprites
		for (const s of state.shots) {
			if (
				!this.#shotSprites.has(
					s.id,
				)
			) {
				const sprite =
					new ShotSprite(
						s,
						this
							.#debug,
					);
				sprite.appendTo(
					this
						.playingFieldTile
						.container,
					this
						.#playingFieldLayer,
				);
				this.#shotSprites.set(
					s.id,
					sprite,
				);
			}
			const sprite =
				this.#shotSprites.get(
					s.id,
				)!;
			sprite.update(
				deltaTime,
				s,
			);
		}
	}

	#updateObjects(
		deltaTime: DeltaTime,
		state: WaveState,
	) {
		// Issue 6: single pass over objects instead of two separate filter calls
		const materials: Material[] =
			[];
		const spawnings: SpawningEnemy[] =
			[];
		for (const object of state.objects) {
			if (
				object.type ===
				"material"
			)
				materials.push(
					object,
				);
			else if (
				object.type ===
				"spawning-enemy"
			)
				spawnings.push(
					object,
				);
		}
		this.#updateMaterials(
			deltaTime,
			materials,
		);
		this.#updateSpawnings(
			deltaTime,
			spawnings,
		);
	}

	#updateSpawnings(
		deltaTime: DeltaTime,
		spawnings: SpawningEnemy[],
	) {
		// Issue 5: build ID set once for O(1) stale-sprite lookup
		const spawningIds =
			new Set(
				spawnings.map(
					(
						s,
					) =>
						s.id,
				),
			);

		// Remove stale sprites
		for (const [
			id,
			sprite,
		] of this
			.#spawningSprites) {
			if (
				!spawningIds.has(
					id,
				)
			) {
				sprite.remove();
				this.#spawningSprites.delete(
					id,
				);
			}
		}

		// Create/update sprites
		for (const spawning of spawnings) {
			if (
				!this.#spawningSprites.has(
					spawning.id,
				)
			) {
				const sprite =
					new SpawningEnemySprite(
						this
							.#debug,
					);
				sprite.appendTo(
					this
						.playingFieldTile
						.container,
					this
						.#playingFieldLayer,
				);
				this.#spawningSprites.set(
					spawning.id,
					sprite,
				);
			}
			const sprite =
				this.#spawningSprites.get(
					spawning.id,
				)!;
			sprite.update(
				spawning,
				deltaTime,
			);
		}
	}

	#updateMaterials(
		deltaTime: DeltaTime,
		materials: Material[],
	) {
		// Issue 5: build ID set once for O(1) stale-sprite lookup
		const materialIds =
			new Set(
				materials.map(
					(
						m,
					) =>
						m.id,
				),
			);

		// Remove stale sprites
		for (const [
			id,
			sprite,
		] of this
			.#materialSprites) {
			if (
				!materialIds.has(
					id,
				)
			) {
				sprite.remove();
				this.#materialSprites.delete(
					id,
				);
			}
		}

		// Create/update sprites
		for (const material of materials) {
			if (
				!this.#materialSprites.has(
					material.id,
				)
			) {
				const sprite =
					new MaterialSprite(
						this
							.#debug,
					);
				sprite.init(
					material,
					this
						.playingFieldTile
						.container,
					this
						.#playingFieldLayer,
				);
				this.#materialSprites.set(
					material.id,
					sprite,
				);
			}
			const sprite =
				this.#materialSprites.get(
					material.id,
				)!;
			sprite.update(
				material,
				deltaTime,
			);
		}
	}
}

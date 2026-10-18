import type { Logger } from "pino";
import * as PIXI from "pixi.js";
import { audioEngine } from "@/audio";
import type { GameEvent } from "@/game-events/GameEvents";
import type { Position } from "@/geometry";
import {
	loadMaterialTexture,
	materialDisplaySize,
	materialVisualCenterOffset,
} from "@/object/MaterialSprite";
import { requireDefined } from "@/requireDefined";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { InWaveStats } from "../bulbro/sprites/InWaveStats";
import { canvasSize } from "../game-canvas";
import type { WaveState } from "../waveState";
import { BaggingAnimation } from "./BaggingAnimation";
import type { Camera } from "./Camera";
import { DustCloudEffect } from "./DustCloudEffect";
import { ExplosionEffects } from "./ExplosionEffects";
import { HitIndicators } from "./HitIndicators";
import { LaserEffects } from "./LaserEffects";
import { Scene } from "./Scene";
import { TimerSprite } from "./TimerSprite";
import { WaveSprite } from "./WaveSprite";

/**
 * Decorator that adds UI elements (timer, wave number, health bars) to a Scene.
 */
export class StageWithUi {
	#scene: Scene;
	#timerSprite!: TimerSprite;
	#waveSprite!: WaveSprite;
	#inWaveStats: Map<
		string,
		InWaveStats
	> =
		new Map();
	#uiLayer: PIXI.RenderLayer;
	#baggingLayer: PIXI.RenderLayer;
	#camera: Camera;
	#logger: Logger;
	#hitIndicators: HitIndicators;
	#explosionEffects: ExplosionEffects;
	#laserEffects: LaserEffects;
	#dustEffects: Map<
		string,
		DustCloudEffect
	> =
		new Map();
	#lastPlayerPositions: Map<
		string,
		Position
	> =
		new Map();
	#lastNow: NowTime =
		nowTime(
			0,
		);
	/** Materials counted in the bag that are still flying into it */
	#pendingBagMaterials = 0;

	constructor(
		logger: Logger,
		debug: boolean,
		camera: Camera,
		scale: number,
	) {
		this.#logger =
			logger;
		this.#camera =
			camera;
		this.#scene =
			new Scene(
				logger,
				debug,
				camera,
				scale,
			);

		// End-wave materials render above the field and below the stats and other UI.
		this.#baggingLayer =
			new PIXI.RenderLayer();
		this.#camera.stage.addChild(
			this
				.#baggingLayer,
		);

		// Create UI layer and sprites
		this.#uiLayer =
			new PIXI.RenderLayer();
		this.#camera.stage.addChild(
			this
				.#uiLayer,
		);

		this.#timerSprite =
			new TimerSprite();
		this.#timerSprite.appendTo(
			this
				.#camera
				.ui,
			this
				.#uiLayer,
		);

		this.#waveSprite =
			new WaveSprite();
		this.#waveSprite.appendTo(
			this
				.#camera
				.ui,
			this
				.#uiLayer,
		);

		this.#laserEffects =
			new LaserEffects();
		this.#laserEffects.appendTo(
			this
				.playingFieldContainer,
			this
				.#uiLayer,
		);
		this.#explosionEffects =
			new ExplosionEffects();
		this.#explosionEffects.appendTo(
			this
				.playingFieldContainer,
			this
				.#uiLayer,
		);

		this.#hitIndicators =
			new HitIndicators();
		this.#hitIndicators.appendTo(
			this
				.playingFieldContainer,
			this
				.#uiLayer,
		);
	}

	/**
	 * Initializes both scene and UI elements.
	 */
	async init(
		state: WaveState,
	) {
		this.#logger.info(
			{
				canvasSize:
					canvasSize.value,
				state,
			},
			"StageWithUi init",
		);
		await this.#scene.init(
			state,
		);
		this.update(
			deltaTime(
				0,
			),
			nowTime(
				0,
			),
			state,
			[],
		);
	}

	/**
	 * Updates both scene and UI elements each frame.
	 */
	update(
		deltaTime: DeltaTime,
		now: NowTime,
		state: WaveState,
		events: GameEvent[],
	): void {
		this.#lastNow =
			now;
		// Update scene (players, enemies, shots, objects)
		this.#scene.update(
			deltaTime,
			now,
			state,
		);

		// Update UI elements
		this.#timerSprite.update(
			state.round,
			canvasSize
				.value
				.width,
		);
		this.#waveSprite.update(
			state.round,
			canvasSize
				.value
				.width,
		);
		this.#updatePlayerStats(
			state,
		);
		this.#laserEffects.update(
			deltaTime,
			events,
		);
		this.#explosionEffects.update(
			deltaTime,
			events,
		);
		this.#hitIndicators.update(
			deltaTime,
			events,
			state,
		);
		this.#updateDustEffects(
			deltaTime,
			state,
		);
	}

	/**
	 * Animates materials left on the field flying into the bag of the first
	 * player. Rendering has to keep running on the ticker until it resolves.
	 */
	async playBaggingAnimation(
		state: WaveState,
		ticker: PIXI.Ticker,
	): Promise<void> {
		const materials =
			state.objects.filter(
				(
					o,
				) =>
					o.type ===
					"material",
			);
		const indicator =
			state
				.players[0] &&
			this.#inWaveStats.get(
				state
					.players[0]
					.id,
			)
				?.materialsIndicator;
		if (
			materials.length ===
				0 ||
			!indicator
		)
			return;

		const ui =
			this
				.#camera
				.ui;
		const field =
			this
				.playingFieldContainer;
		const from =
			materials.map(
				(
					m,
				) => {
					const position =
						ui.toLocal(
							field.toGlobal(
								{
									x:
										m
											.position
											.x +
										materialVisualCenterOffset.x,
									y:
										m
											.position
											.y +
										materialVisualCenterOffset.y,
								},
							),
						);
					return {
						x: position.x,
						y: position.y,
						value:
							m.value,
					};
				},
			);
		const animation =
			new BaggingAnimation(
				ui,
				this
					.#baggingLayer,
				await loadMaterialTexture(),
				from,
				() =>
					ui.toLocal(
						indicator.bagGlobalPosition(),
					),
				materialDisplaySize.height *
					field
						.worldTransform
						.a,
				indicator.iconSize,
			);

		// The materials now fly as part of the UI instead of lying on the field
		const remainingState =
			{
				...state,
				objects:
					state.objects.filter(
						(
							o,
						) =>
							o.type !==
							"material",
					),
			};
		this.#scene.update(
			deltaTime(
				0,
			),
			this
				.#lastNow,
			remainingState,
		);
		this.#pendingBagMaterials =
			animation.total;
		this.#updatePlayerStats(
			remainingState,
		);

		const {
			promise,
			resolve,
		} =
			Promise.withResolvers<void>();
		let lastSoundAt = 0;
		const step =
			() => {
				if (
					animation.update(
						ticker.deltaMS,
					) >
						0 &&
					ticker.lastTime -
						lastSoundAt >
						70
				) {
					lastSoundAt =
						ticker.lastTime;
					audioEngine.playEffect(
						"collectCoins",
					);
				}
				this.#pendingBagMaterials =
					animation.total -
					animation.arrived;
				indicator.setBagScale(
					animation.bagScale,
				);
				this.#updatePlayerStats(
					remainingState,
				);
				if (
					animation.isDone
				) {
					ticker.remove(
						step,
					);
					indicator.setBagScale(
						1,
					);
					animation.destroy();
					resolve();
				}
			};
		ticker.add(
			step,
		);
		return promise;
	}

	// Expose scene properties for backward compatibility
	get playingFieldContainer() {
		return this
			.#scene
			.playingFieldContainer;
	}

	get playingFieldLayer() {
		return this
			.#scene
			.playingFieldLayer;
	}

	get groundLayer() {
		return this
			.#scene
			.groundLayer;
	}

	get camera() {
		return this
			.#scene
			.camera;
	}

	#updateDustEffects(
		deltaTime: DeltaTime,
		state: WaveState,
	) {
		state.players.forEach(
			(
				player,
			) => {
				if (
					!this.#dustEffects.has(
						player.id,
					)
				) {
					const dust =
						new DustCloudEffect();
					dust.appendTo(
						this
							.playingFieldContainer,
						this
							.playingFieldLayer,
					);
					this.#dustEffects.set(
						player.id,
						dust,
					);
				}
				const dust =
					requireDefined(
						this.#dustEffects.get(
							player.id,
						),
					);
				const lastPos =
					this.#lastPlayerPositions.get(
						player.id,
					);
				const isMoving =
					lastPos !==
						undefined &&
					(lastPos.x !==
						player
							.position
							.x ||
						lastPos.y !==
							player
								.position
								.y);
				this.#lastPlayerPositions.set(
					player.id,
					{
						x: player
							.position
							.x,
						y: player
							.position
							.y,
					},
				);
				dust.update(
					deltaTime,
					player.position,
					player.lastDirection,
					isMoving,
				);
			},
		);
	}

	#updatePlayerStats(
		state: WaveState,
	) {
		state.players.forEach(
			(
				player,
				i,
			) => {
				if (
					!this.#inWaveStats.get(
						player.id,
					)
				) {
					const sprite =
						new InWaveStats(
							canvasSize.value,
							i,
						);
					sprite.appendTo(
						this
							.#camera
							.ui,
						this
							.#uiLayer,
					);
					this.#inWaveStats.set(
						player.id,
						sprite,
					);
				}
				this.#inWaveStats
					.get(
						player.id,
					)
					?.update(
						canvasSize.value,
						player,
						this
							.#pendingBagMaterials,
					);
			},
		);
	}
}

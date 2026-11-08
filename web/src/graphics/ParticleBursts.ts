import * as PIXI from "pixi.js";
import type { GameEvent } from "@/game-events/GameEvents";
import type {
	Direction,
	Position,
} from "@/geometry";
import { materialVisualCenterOffset } from "@/object/MaterialSprite";
import {
	pickRandom,
	randomAngle,
	randomInRange,
} from "@/random";
import type { DeltaTime } from "@/time";
import type { WaveState } from "@/waveState";

export type BurstConfig =
	{
		countMin: number;
		countMax: number;
		sizeMin: number;
		sizeMax: number;
		/** Initial scatter speed in px per second, in a random direction */
		speedMin: number;
		speedMax: number;
		/** Extra speed in px per second along the burst direction (hit direction) */
		driftSpeed: number;
		durationMinMs: number;
		durationMaxMs: number;
		/** Random offset from the center the particles start at */
		spawnRadius: number;
		colors: number[];
	};

const ENEMY_COLORS =
	[
		0xd8262b,
		0xa3121a,
		0xff4a4a,
	];
const MATERIAL_COLORS =
	[
		0x3d8bff,
		0x1f5fd1,
		0x8ec5ff,
	];

export const hitBurst: BurstConfig =
	{
		countMin: 2,
		countMax: 3,
		sizeMin: 5,
		sizeMax: 8,
		speedMin: 90,
		speedMax: 180,
		driftSpeed: 160,
		durationMinMs: 280,
		durationMaxMs: 420,
		spawnRadius: 8,
		colors:
			ENEMY_COLORS,
	};

export const deathBurst: BurstConfig =
	{
		countMin: 8,
		countMax: 11,
		sizeMin: 7,
		sizeMax: 12,
		speedMin: 140,
		speedMax: 320,
		driftSpeed: 140,
		durationMinMs: 450,
		durationMaxMs: 700,
		spawnRadius: 14,
		colors:
			ENEMY_COLORS,
	};

export const materialBurst: BurstConfig =
	{
		countMin: 3,
		countMax: 4,
		sizeMin: 4,
		sizeMax: 7,
		speedMin: 80,
		speedMax: 170,
		driftSpeed: 90,
		durationMinMs: 250,
		durationMaxMs: 400,
		spawnRadius: 6,
		colors:
			MATERIAL_COLORS,
	};

/** Velocity multiplier applied per second, slows the particles down */
const DRAG_PER_SECOND = 0.04;
/** Hard cap to keep big fights cheap to render */
const MAX_PARTICLES = 400;

type Particle =
	{
		graphic: PIXI.Graphics;
		elapsedMs: number;
		durationMs: number;
		velocityX: number;
		velocityY: number;
		spin: number;
	};

/**
 * Throws particles: red ones out of enemies when they are hit (small splash)
 * or killed (bigger burst), drifting along the hit direction, and blue ones
 * when a material is collected.
 */
export class ParticleBursts {
	#container: PIXI.Container =
		new PIXI.Container();
	#particles: Particle[] =
		[];
	/** Material positions of the previous frame, collected ones are already gone from the state */
	#knownMaterials =
		new Map<
			string,
			Position
		>();

	get particleCount(): number {
		return this
			.#particles
			.length;
	}

	appendTo(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
	): void {
		parent.addChild(
			this
				.#container,
		);
		layer.attach(
			this
				.#container,
		);
	}

	update(
		deltaTime: DeltaTime,
		events: GameEvent[],
		state: WaveState,
	): void {
		for (const event of events) {
			switch (
				event.type
			) {
				case "enemyReceivedHit": {
					const enemy =
						state.enemies.find(
							(
								e,
							) =>
								e.id ===
								event.enemyId,
						);
					if (
						enemy
					)
						this.spawn(
							enemy.position,
							hitBurst,
							event.hitDirection,
						);
					break;
				}
				case "enemyDied":
					this.spawn(
						event.position,
						deathBurst,
						event.hitDirection,
					);
					break;
				case "materialCollected": {
					const position =
						this.#knownMaterials.get(
							event.materialId,
						);
					if (
						!position
					)
						break;
					const player =
						state.players.find(
							(
								p,
							) =>
								p.id ===
								event.playerId,
						);
					this.spawn(
						position,
						materialBurst,
						player
							? {
									x:
										player
											.position
											.x -
										position.x,
									y:
										player
											.position
											.y -
										position.y,
								}
							: undefined,
					);
					break;
				}
			}
		}

		this.#knownMaterials.clear();
		for (const object of state.objects) {
			if (
				object.type ===
				"material"
			)
				this.#knownMaterials.set(
					object.id,
					{
						x:
							object
								.position
								.x +
							materialVisualCenterOffset.x,
						y:
							object
								.position
								.y +
							materialVisualCenterOffset.y,
					},
				);
		}

		this.#animate(
			deltaTime,
		);
	}

	remove(): void {
		this.#container.destroy(
			{
				children: true,
			},
		);
		this.#particles =
			[];
		this.#knownMaterials.clear();
	}

	/** Throws a burst of particles from the position, drifting along the direction when given */
	spawn(
		position: Position,
		config: BurstConfig,
		direction?: Direction,
	) {
		const count =
			Math.min(
				Math.round(
					randomInRange(
						config.countMin,
						config.countMax,
					),
				),
				MAX_PARTICLES -
					this
						.#particles
						.length,
			);
		const directionLength =
			direction
				? Math.hypot(
						direction.x,
						direction.y,
					)
				: 0;
		const driftX =
			direction &&
			directionLength >
				0
				? (direction.x /
						directionLength) *
					config.driftSpeed
				: 0;
		const driftY =
			direction &&
			directionLength >
				0
				? (direction.y /
						directionLength) *
					config.driftSpeed
				: 0;
		for (
			let i = 0;
			i <
			count;
			i++
		) {
			const angle =
				randomAngle();
			const speed =
				randomInRange(
					config.speedMin,
					config.speedMax,
				);
			const size =
				randomInRange(
					config.sizeMin,
					config.sizeMax,
				);
			const graphic =
				new PIXI.Graphics()
					.rect(
						-size /
							2,
						-size /
							2,
						size,
						size,
					)
					.fill(
						pickRandom(
							config.colors,
						),
					);
			const offset =
				Math.random() *
				config.spawnRadius;
			graphic.x =
				position.x +
				Math.cos(
					angle,
				) *
					offset;
			graphic.y =
				position.y +
				Math.sin(
					angle,
				) *
					offset;
			graphic.rotation =
				randomAngle();
			this.#container.addChild(
				graphic,
			);
			this.#particles.push(
				{
					graphic,
					elapsedMs: 0,
					durationMs:
						randomInRange(
							config.durationMinMs,
							config.durationMaxMs,
						),
					velocityX:
						Math.cos(
							angle,
						) *
							speed +
						driftX,
					velocityY:
						Math.sin(
							angle,
						) *
							speed +
						driftY,
					spin: randomInRange(
						-10,
						10,
					),
				},
			);
		}
	}

	#animate(
		deltaTime: DeltaTime,
	) {
		if (
			this
				.#particles
				.length ===
			0
		)
			return;
		const seconds =
			deltaTime /
			1000;
		const drag =
			DRAG_PER_SECOND **
			seconds;
		this.#particles =
			this.#particles.filter(
				(
					particle,
				) => {
					particle.elapsedMs +=
						deltaTime;
					const progress =
						Math.min(
							particle.elapsedMs /
								particle.durationMs,
							1,
						);
					if (
						progress >=
						1
					) {
						particle.graphic.destroy();
						return false;
					}
					particle.velocityX *=
						drag;
					particle.velocityY *=
						drag;
					particle.graphic.x +=
						particle.velocityX *
						seconds;
					particle.graphic.y +=
						particle.velocityY *
						seconds;
					particle.graphic.rotation +=
						particle.spin *
						seconds;
					particle.graphic.alpha =
						1 -
						progress *
							progress;
					particle.graphic.scale.set(
						1 -
							0.5 *
								progress,
					);
					return true;
				},
			);
	}
}

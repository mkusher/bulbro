import * as PIXI from "pixi.js";
import type {
	Direction,
	Position,
} from "@/geometry";
import type { DeltaTime } from "@/time";

const DUST_DURATION_MS = 800;
const DUST_CLOUD_COUNT_MIN = 2;
const DUST_CLOUD_COUNT_MAX = 3;
const DUST_SIZE_MIN = 3;
const DUST_SIZE_MAX = 6;
const DUST_SPREAD = 12;
const DUST_TRAVEL_DISTANCE = 8;
const DUST_COLOR = 0x6b8b5e;
const DUST_SPAWN_INTERVAL_MS = 180;

type DustParticle =
	{
		graphic: PIXI.Graphics;
		elapsedMs: number;
		velocityX: number;
		velocityY: number;
	};

export class DustCloudEffect {
	#container: PIXI.Container =
		new PIXI.Container();
	#particles: DustParticle[] =
		[];
	#lastSpawnMs = 0;
	#timeSinceLastSpawn = 0;

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
		position: Position,
		direction: Direction,
		isMoving: boolean,
	): void {
		if (
			isMoving
		) {
			this.#timeSinceLastSpawn +=
				deltaTime;
			if (
				this
					.#timeSinceLastSpawn >=
				DUST_SPAWN_INTERVAL_MS
			) {
				this.#spawn(
					position,
					direction,
				);
				this.#timeSinceLastSpawn = 0;
			}
		} else {
			this.#timeSinceLastSpawn =
				DUST_SPAWN_INTERVAL_MS;
		}

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
								DUST_DURATION_MS,
							1,
						);
					const eased =
						easeOutQuad(
							progress,
						);

					particle.graphic.x +=
						particle.velocityX *
						(deltaTime /
							DUST_DURATION_MS);
					particle.graphic.y +=
						particle.velocityY *
						(deltaTime /
							DUST_DURATION_MS);
					particle.graphic.alpha =
						0.6 *
						(1 -
							eased);
					particle.graphic.scale.set(
						1 +
							eased *
								0.5,
					);

					if (
						progress >=
						1
					) {
						particle.graphic.removeFromParent();
						particle.graphic.destroy();
						return false;
					}
					return true;
				},
			);
	}

	remove(): void {
		for (const particle of this
			.#particles) {
			particle.graphic.removeFromParent();
			particle.graphic.destroy();
		}
		this.#particles =
			[];
		this.#container.removeFromParent();
	}

	#spawn(
		position: Position,
		direction: Direction,
	): void {
		const count =
			DUST_CLOUD_COUNT_MIN +
			Math.floor(
				Math.random() *
					(DUST_CLOUD_COUNT_MAX -
						DUST_CLOUD_COUNT_MIN +
						1),
			);

		for (
			let i = 0;
			i <
			count;
			i++
		) {
			const size =
				DUST_SIZE_MIN +
				Math.random() *
					(DUST_SIZE_MAX -
						DUST_SIZE_MIN);
			const graphic =
				new PIXI.Graphics();
			graphic.circle(
				0,
				0,
				size,
			);
			graphic.fill(
				{
					color:
						DUST_COLOR,
					alpha: 0.6,
				},
			);

			const spreadX =
				(Math.random() -
					0.5) *
				DUST_SPREAD;
			const spreadY =
				(Math.random() -
					0.5) *
				DUST_SPREAD;
			graphic.x =
				position.x +
				spreadX;
			graphic.y =
				position.y +
				spreadY;

			const velocityX =
				-direction.x *
					DUST_TRAVEL_DISTANCE +
				(Math.random() -
					0.5) *
					4;
			const velocityY =
				-direction.y *
					DUST_TRAVEL_DISTANCE +
				(Math.random() -
					0.5) *
					4;

			this.#container.addChild(
				graphic,
			);
			this.#particles.push(
				{
					graphic,
					elapsedMs: 0,
					velocityX,
					velocityY,
				},
			);
		}
	}
}

function easeOutQuad(
	t: number,
): number {
	return (
		1 -
		(1 -
			t) *
			(1 -
				t)
	);
}

import * as PIXI from "pixi.js";
import type {
	GameEvent,
	ShotExplodedEvent,
} from "@/game-events/GameEvents";
import type { DeltaTime } from "@/time";

const EXPLOSION_DURATION_MS = 550;
/** Share of the animation the flash takes to reach its full size */
const FLASH_SHARE = 0.25;
const FLASH_COLOR = 0xfff6c2;
const FIREBALL_COLOR = 0xff7a1a;
const FIREBALL_CORE_COLOR = 0xffc93c;
const SHOCKWAVE_COLOR = 0xffe2a8;
const SMOKE_COLOR = 0x5a5048;
const SMOKE_PUFFS = 7;

type SmokePuff =
	{
		graphic: PIXI.Graphics;
		angle: number;
		distance: number;
	};

type Explosion =
	{
		container: PIXI.Container;
		radius: number;
		elapsedMs: number;
		flash: PIXI.Graphics;
		fireball: PIXI.Graphics;
		shockwave: PIXI.Graphics;
		smoke: SmokePuff[];
	};

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

function easeOutCubic(
	t: number,
): number {
	return (
		1 -
		(1 -
			t) **
			3
	);
}

/**
 * Animates explosions of explosive shots: a bright flash, an expanding
 * fireball and shockwave covering the explosion radius, and smoke puffs.
 */
export class ExplosionEffects {
	#container: PIXI.Container =
		new PIXI.Container();
	#explosions: Explosion[] =
		[];

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
	): void {
		for (const event of events) {
			if (
				event.type ===
				"shotExploded"
			)
				this.#spawn(
					event,
				);
		}
		if (
			this
				.#explosions
				.length ===
			0
		)
			return;
		this.#explosions =
			this.#explosions.filter(
				(
					explosion,
				) => {
					explosion.elapsedMs +=
						deltaTime;
					const progress =
						Math.min(
							explosion.elapsedMs /
								EXPLOSION_DURATION_MS,
							1,
						);
					this.#animate(
						explosion,
						progress,
					);
					if (
						progress >=
						1
					) {
						explosion.container.destroy(
							{
								children: true,
							},
						);
						return false;
					}
					return true;
				},
			);
	}

	#animate(
		explosion: Explosion,
		progress: number,
	) {
		const flashProgress =
			Math.min(
				progress /
					FLASH_SHARE,
				1,
			);
		explosion.flash.scale.set(
			0.3 +
				0.5 *
					easeOutQuad(
						flashProgress,
					),
		);
		explosion.flash.alpha =
			1 -
			flashProgress;

		const grow =
			easeOutCubic(
				progress,
			);
		explosion.fireball.scale.set(
			0.4 +
				0.6 *
					grow,
		);
		explosion.fireball.alpha =
			0.85 *
			(1 -
				progress *
					progress);

		explosion.shockwave.scale.set(
			0.2 +
				0.85 *
					grow,
		);
		explosion.shockwave.alpha =
			1 -
			progress;

		for (const puff of explosion.smoke) {
			const d =
				puff.distance *
				grow;
			puff.graphic.x =
				Math.cos(
					puff.angle,
				) *
				d;
			puff.graphic.y =
				Math.sin(
					puff.angle,
				) *
					d -
				explosion.radius *
					0.15 *
					progress;
			puff.graphic.scale.set(
				0.6 +
					0.8 *
						grow,
			);
			puff.graphic.alpha =
				0.55 *
				(1 -
					easeOutQuad(
						progress,
					));
		}
	}

	#spawn(
		event: ShotExplodedEvent,
	): void {
		const radius =
			event.radius;
		if (
			radius <=
			0
		)
			return;
		const container =
			new PIXI.Container();
		container.x =
			event.position.x;
		container.y =
			event.position.y;

		const shockwave =
			new PIXI.Graphics()
				.circle(
					0,
					0,
					radius,
				)
				.stroke(
					{
						width: 6,
						color:
							SHOCKWAVE_COLOR,
					},
				);
		const fireball =
			new PIXI.Graphics()
				.circle(
					0,
					0,
					radius,
				)
				.fill(
					{
						color:
							FIREBALL_COLOR,
						alpha: 0.6,
					},
				)
				.circle(
					0,
					0,
					radius *
						0.6,
				)
				.fill(
					FIREBALL_CORE_COLOR,
				);
		const smoke: SmokePuff[] =
			[];
		for (
			let i = 0;
			i <
			SMOKE_PUFFS;
			i++
		) {
			const angle =
				(i /
					SMOKE_PUFFS) *
					Math.PI *
					2 +
				Math.random() *
					0.6;
			const graphic =
				new PIXI.Graphics()
					.circle(
						0,
						0,
						radius *
							(0.16 +
								Math.random() *
									0.1),
					)
					.fill(
						SMOKE_COLOR,
					);
			smoke.push(
				{
					graphic,
					angle,
					distance:
						radius *
						(0.55 +
							Math.random() *
								0.35),
				},
			);
		}
		const flash =
			new PIXI.Graphics()
				.circle(
					0,
					0,
					radius,
				)
				.fill(
					FLASH_COLOR,
				);

		container.addChild(
			...smoke.map(
				(
					puff,
				) =>
					puff.graphic,
			),
			fireball,
			shockwave,
			flash,
		);
		this.#container.addChild(
			container,
		);
		const explosion: Explosion =
			{
				container,
				radius,
				elapsedMs: 0,
				flash,
				fireball,
				shockwave,
				smoke,
			};
		this.#animate(
			explosion,
			0,
		);
		this.#explosions.push(
			explosion,
		);
	}
}

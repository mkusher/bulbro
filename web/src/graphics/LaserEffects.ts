import * as PIXI from "pixi.js";
import type {
	GameEvent,
	LaserFiredEvent,
} from "@/game-events/GameEvents";
import type { DeltaTime } from "@/time";

const BEAM_DURATION_MS = 160;

/** Brief purple beams drawn from the muzzle to the resolved collision/range limit. */
export class LaserEffects {
	#container =
		new PIXI.Container();
	#beams: {
		graphic: PIXI.Graphics;
		elapsed: number;
	}[] =
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
		this.#beams =
			this.#beams.filter(
				(
					beam,
				) => {
					beam.elapsed +=
						deltaTime;
					if (
						beam.elapsed >=
						BEAM_DURATION_MS
					) {
						beam.graphic.destroy();
						return false;
					}
					beam.graphic.alpha =
						(1 -
							beam.elapsed /
								BEAM_DURATION_MS) **
						2;
					return true;
				},
			);
		for (const event of events) {
			if (
				event.type ===
				"laserFired"
			)
				this.#spawn(
					event,
				);
		}
	}

	#spawn(
		event: LaserFiredEvent,
	): void {
		const beam =
			new PIXI.Graphics();
		for (const style of [
			{
				width: 15,
				color: 0x8c28ff,
				alpha: 0.16,
			},
			{
				width: 7,
				color: 0xb247ff,
				alpha: 0.55,
			},
			{
				width: 3,
				color: 0xe2a3ff,
				alpha: 1,
			},
		]) {
			beam
				.moveTo(
					event
						.from
						.x,
					event
						.from
						.y,
				)
				.lineTo(
					event
						.to
						.x,
					event
						.to
						.y,
				)
				.stroke(
					{
						...style,
						cap: "round",
					},
				);
		}
		beam
			.circle(
				event
					.from
					.x,
				event
					.from
					.y,
				6,
			)
			.fill(
				{
					color: 0xcf7dff,
					alpha: 0.8,
				},
			);
		beam
			.circle(
				event
					.to
					.x,
				event
					.to
					.y,
				5,
			)
			.fill(
				0xe2a3ff,
			);
		this.#container.addChild(
			beam,
		);
		this.#beams.push(
			{
				graphic:
					beam,
				elapsed: 0,
			},
		);
	}
}

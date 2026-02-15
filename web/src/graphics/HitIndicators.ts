import * as PIXI from "pixi.js";
import type { GameEvent } from "@/game-events/GameEvents";
import type { Position } from "@/geometry";
import type { DeltaTime } from "@/time";
import { uuid } from "@/uuid";
import type { WaveState } from "@/waveState";

const INDICATOR_DURATION_MS = 1000;
const INDICATOR_RISE = 64;
const PLAYER_DAMAGE_COLOR =
	"#ff2c2c";
const ENEMY_DAMAGE_COLOR =
	"#ffd166";

type IndicatorEntry =
	{
		id: string;
		container: PIXI.Container;
		text: PIXI.Text;
		elapsedMs: number;
		startPosition: Position;
	};

function createTextStyle(
	fill: string,
): PIXI.TextStyle {
	return new PIXI.TextStyle(
		{
			fontSize: 18,
			fontWeight:
				"700",
			fill,
			stroke:
				{
					width: 3,
					color: 0x000000,
					alignment: 1,
				},
		},
	);
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

export class HitIndicators {
	#container: PIXI.Container =
		new PIXI.Container();
	#indicators: IndicatorEntry[] =
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
						!enemy
					)
						break;
					this.#spawn(
						{
							position:
								enemy.position,
							amount:
								event.damage,
							color:
								ENEMY_DAMAGE_COLOR,
						},
					);
					break;
				}
				case "enemyDied": {
					this.#spawn(
						{
							position:
								event.position,
							amount:
								event.damage,
							color:
								ENEMY_DAMAGE_COLOR,
						},
					);
					break;
				}
				case "bulbroReceivedHit": {
					const player =
						state.players.find(
							(
								p,
							) =>
								p.id ===
								event.bulbroId,
						);
					if (
						!player
					)
						break;
					this.#spawn(
						{
							position:
								player.position,
							amount:
								event.damage,
							color:
								PLAYER_DAMAGE_COLOR,
						},
					);
					break;
				}
				case "bulbroDied": {
					this.#spawn(
						{
							position:
								event.position,
							amount:
								event.damage,
							color:
								PLAYER_DAMAGE_COLOR,
						},
					);
					break;
				}
			}
		}
		if (
			this
				.#indicators
				.length ===
			0
		) {
			return;
		}
		const elapsedMs =
			deltaTime;
		this.#indicators =
			this.#indicators.filter(
				(
					indicator,
				) => {
					indicator.elapsedMs +=
						elapsedMs;
					const progress =
						Math.min(
							indicator.elapsedMs /
								INDICATOR_DURATION_MS,
							1,
						);
					const eased =
						easeOutQuad(
							progress,
						);
					indicator.container.y =
						indicator
							.startPosition
							.y -
						INDICATOR_RISE *
							eased;
					indicator.container.alpha =
						1 -
						progress;
					if (
						progress >=
						1
					) {
						indicator.container.removeFromParent();
						return false;
					}
					return true;
				},
			);
	}

	#spawn({
		position,
		amount,
		color,
	}: {
		position: Position;
		amount: number;
		color: string;
	}): void {
		if (
			amount <=
			0
		) {
			return;
		}
		const text =
			new PIXI.Text(
				`-${Math.round(
					amount,
				)}`,
				createTextStyle(
					color,
				),
			);
		text.anchor.set(
			0.5,
		);
		const container =
			new PIXI.Container();
		container.x =
			position.x;
		container.y =
			position.y;
		container.addChild(
			text,
		);
		this.#container.addChild(
			container,
		);
		this.#indicators.push(
			{
				id: uuid(),
				container,
				text,
				elapsedMs: 0,
				startPosition:
					{
						x: position.x,
						y: position.y,
					},
			},
		);
	}
}

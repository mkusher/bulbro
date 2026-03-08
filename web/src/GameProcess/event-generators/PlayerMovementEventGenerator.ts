import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { PlayerControl } from "../../controls";
import type { GameEventInternal } from "../../game-events/GameEvents";
import {
	zeroPoint,
	type Direction,
} from "../../geometry";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

/**
 * Generates movement events for local players based on control input.
 */
export class PlayerMovementEventGenerator
	implements
		EventGenerator
{
	#controls: PlayerControl[];

	constructor(
		controls: PlayerControl[],
	) {
		this.#controls =
			controls;
	}

	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		_now: NowTime,
	): GameEventInternal[] {
		const events: GameEventInternal[] =
			[];
		const directions: Direction[] =
			this.#controls.map(
				(
					c,
				) =>
					c.direction,
			);

		for (
			let i = 0;
			i <
			state
				.players
				.length;
			i++
		) {
			const player =
				state
					.players[
					i
				]!;
			if (
				player.isAlive()
			) {
				const direction =
					directions[
						i
					] ??
					zeroPoint();
				const moveEvent =
					player.move(
						direction,
						state.mapSize,
						[],
						deltaTime,
					);
				if (
					moveEvent
				) {
					events.push(
						moveEvent,
					);
				}
			}
		}

		return events;
	}
}

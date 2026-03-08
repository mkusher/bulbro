import type { Signal } from "@preact/signals";
import type { GameEvent } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import {
	applyEnemyMovedBatch,
	applyMaterialMovedBatch,
	applyShotEventsBatch,
	updateState,
} from "../../waveState";
import type { GameEventsProcessor } from "../index";

export class WaveStateProcessor
	implements
		GameEventsProcessor
{
	#waveStateSignal: Signal<WaveState | null>;

	constructor(
		waveStateSignal: Signal<WaveState | null>,
	) {
		this.#waveStateSignal =
			waveStateSignal;
	}

	handleEvents(
		events: GameEvent[],
	): void {
		const state =
			this
				.#waveStateSignal
				.value;
		if (
			!state
		)
			return;

		// Issue 2: Separate high-volume movement events for batch processing.
		// Other event types are still applied sequentially via the reducer.
		type EnemyMovedEv =
			Extract<
				GameEvent,
				{
					type: "enemyMoved";
				}
			>;
		type ShotMovedEv =
			Extract<
				GameEvent,
				{
					type: "shotMoved";
				}
			>;
		type ShotExpiredEv =
			Extract<
				GameEvent,
				{
					type: "shotExpired";
				}
			>;
		type MaterialMovedEv =
			Extract<
				GameEvent,
				{
					type: "materialMoved";
				}
			>;

		const enemyMovedEvents: EnemyMovedEv[] =
			[];
		const shotMovedEvents: ShotMovedEv[] =
			[];
		const shotExpiredEvents: ShotExpiredEv[] =
			[];
		const materialMovedEvents: MaterialMovedEv[] =
			[];
		const otherEvents: GameEvent[] =
			[];

		for (const event of events) {
			if (
				event.type ===
				"enemyMoved"
			) {
				enemyMovedEvents.push(
					event as EnemyMovedEv,
				);
			} else if (
				event.type ===
				"shotMoved"
			) {
				shotMovedEvents.push(
					event as ShotMovedEv,
				);
			} else if (
				event.type ===
				"shotExpired"
			) {
				shotExpiredEvents.push(
					event as ShotExpiredEv,
				);
			} else if (
				event.type ===
				"materialMoved"
			) {
				materialMovedEvents.push(
					event as MaterialMovedEv,
				);
			} else {
				otherEvents.push(
					event,
				);
			}
		}

		// Apply other events sequentially (low volume, varied state changes)
		let newState =
			otherEvents.reduce(
				(
					currentState,
					event,
				) =>
					updateState(
						currentState,
						event,
					),
				state,
			);

		// Apply high-volume events in single passes
		newState =
			applyEnemyMovedBatch(
				newState,
				enemyMovedEvents,
			);
		newState =
			applyShotEventsBatch(
				newState,
				shotMovedEvents,
				shotExpiredEvents,
			);
		newState =
			applyMaterialMovedBatch(
				newState,
				materialMovedEvents,
			);

		// Update lastMovementsAt if any batch movement events occurred
		if (
			enemyMovedEvents.length >
			0
		) {
			newState =
				{
					...newState,
					lastMovementsAt:
						enemyMovedEvents[0]!
							.occurredAt,
				};
		} else if (
			materialMovedEvents.length >
			0
		) {
			newState =
				{
					...newState,
					lastMovementsAt:
						materialMovedEvents[0]!
							.occurredAt,
				};
		}

		newState =
			{
				...newState,
				players:
					newState.players.map(
						(
							p,
						) =>
							p.aim(
								newState.enemies,
							),
					),
			};
		this.#waveStateSignal.value =
			newState;
	}

	get state() {
		return this
			.#waveStateSignal
			.value;
	}
}

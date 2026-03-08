import type { Logger } from "pino";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { PlayerControl } from "../controls";
import type {
	GameEvent,
	GameEventInternal,
} from "../game-events/GameEvents";
import {
	withEventMeta,
	withEventMetaMultiple,
} from "../game-events/GameEvents";
import { logger as defaultLogger } from "../logger";
import type { WaveState } from "../waveState";
import { getTimeLeft } from "../waveState";
import type { TickProcess } from "./index";
import type { EventGenerator } from "./event-generators";
import {
	EnemyBehaviorEventGenerator,
	EnemySpawnEventsGenerator,
	MaterialsMovementEventsGenerator,
	PlayerHealEventGenerator,
	PlayerMovementEventGenerator,
	PlayerWeaponEventGenerator,
	ShotMovementEventGenerator,
} from "./event-generators";

/**
 * Encapsulates per-tick game updates: player movement, enemy movement, spawning, and rendering.
 */
export class FullGameTickProcess
	implements
		TickProcess
{
	#logger =
		defaultLogger.child(
			{
				component:
					"TickProcess",
			},
		);
	#generators: EventGenerator[];

	constructor(
		logger: Logger,
		controls: PlayerControl[],
	) {
		this.#logger =
			logger.child(
				{},
			);
		this.#logger.debug(
			"TickProcess initialized",
		);
		this.#generators =
			[
				new PlayerHealEventGenerator(),
				new PlayerMovementEventGenerator(
					controls,
				),
				new EnemyBehaviorEventGenerator(),
				new PlayerWeaponEventGenerator(),
				new ShotMovementEventGenerator(),
				new MaterialsMovementEventsGenerator(),
				new EnemySpawnEventsGenerator(),
			];
	}

	tick(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEvent[] {
		this.#logger.debug(
			{
				event:
					"tick",
				occurredAt:
					now,
				deltaTime,
			},
			"Tick start",
		);

		return this.#generateTickEvents(
			state,
			deltaTime,
			now,
		);
	}

	/**
	 * Generate all events for this tick without applying them to state
	 */
	#generateTickEvents(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEvent[] {
		if (
			!state
				.round
				.isRunning ||
			getTimeLeft(
				state.round,
			) <=
				0
		) {
			this.#logger.debug(
				"tick skipped; round not running",
			);
			const tickEvent =
				{
					type: "tick" as const,
				};
			return [
				withEventMeta(
					tickEvent,
					deltaTime,
					now,
				),
			];
		}

		// Collect all base events without EventMeta
		const baseEvents: GameEventInternal[] =
			[];

		// Run all event generators
		for (const generator of this
			.#generators) {
			baseEvents.push(
				...generator.generate(
					state,
					deltaTime,
					now,
				),
			);
		}

		// Generate tick event
		baseEvents.push(
			{
				type: "tick" as const,
			},
		);

		// Add EventMeta to all events and return
		return withEventMetaMultiple(
			baseEvents,
			deltaTime,
			now,
		);
	}
}

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
import { EnemySpawner } from "../Spawner/EnemySpawner";
import type { WaveState } from "../waveState";
import {
	generateMaterialMovementEvents,
	getTimeLeft,
} from "../waveState";
import type { TickProcess } from "./index";
import type { EventGenerator } from "./event-generators";
import {
	EnemyBehaviorEventGenerator,
	PlayerHealEventGenerator,
	PlayerMovementEventGenerator,
	PlayerWeaponEventGenerator,
	ShotMovementEventGenerator,
} from "./event-generators";

/**
 * Encapsulates per-tick game updates: player movement, enemy movement, spawning, and rendering.
 */
export class BaseTickProcess
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
	#enemySpawner: EnemySpawner;
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
		this.#enemySpawner =
			new EnemySpawner();
		this.#generators =
			[
				new PlayerHealEventGenerator(),
				new PlayerMovementEventGenerator(
					controls,
				),
				new EnemyBehaviorEventGenerator(),
				new PlayerWeaponEventGenerator(),
				new ShotMovementEventGenerator(),
			];
	}

	/**
	 * Run one tick: produces events for movement, enemy AI, spawning, and rendering.
	 */
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

		// Generate individual material movement events
		const materialMoveEvents =
			generateMaterialMovementEvents(
				state,
				deltaTime,
			);
		baseEvents.push(
			...materialMoveEvents,
		);

		// Generate enemy spawn events
		baseEvents.push(
			...this.#enemySpawner.tick(
				state,
				deltaTime,
				now,
			),
		);

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

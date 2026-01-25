import type { Logger } from "pino";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { PlayerControl } from "./controls";
import { EnemySpawner } from "./enemy/EnemySpawner";
import type {
	GameEvent,
	GameEventInternal,
	GameEventQueue,
} from "./game-events/GameEvents";
import {
	withEventMeta,
	withEventMetaMultiple,
} from "./game-events/GameEvents";
import {
	type Direction,
	zeroPoint,
} from "./geometry";
import type { StageWithUi } from "./graphics/StageWithUi";
import { logger as defaultLogger } from "./logger";
import type { WaveState } from "./waveState";
import {
	generateMaterialMovementEvents,
	getTimeLeft,
	updateState,
} from "./waveState";
import { audioController } from "./audio/AudioController";

/**
 * Encapsulates per-tick game updates: player movement, enemy movement, spawning, and rendering.
 */
export class TickProcess {
	#scene: StageWithUi;
	#logger =
		defaultLogger.child(
			{
				component:
					"TickProcess",
			},
		);
	#controls: PlayerControl[];
	#eventQueue: GameEventQueue;
	#enemySpawner: EnemySpawner;

	constructor(
		logger: Logger,
		scene: StageWithUi,
		controls: PlayerControl[],
		eventQueue: GameEventQueue,
		debug: boolean,
	) {
		this.#scene =
			scene;
		this.#logger =
			logger.child(
				{},
			);
		this.#logger.debug(
			"TickProcess initialized",
		);
		this.#controls =
			controls;
		this.#eventQueue =
			eventQueue;
		this.#enemySpawner =
			new EnemySpawner(
				this
					.#logger,
			);
	}

	/**
	 * Run one tick: produces events for movement, enemy AI, spawning, and rendering.
	 */
	tick(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): WaveState {
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

		// Phase 1: Generate all events for this tick
		const events =
			this.#generateTickEvents(
				state,
				deltaTime,
				now,
			);

		// Phase 2: Add events to queue for network synchronization
		this.#addEventsToQueue(
			events,
		);

		// Phase 3: Apply events to state to get new state
		let newState =
			this.#applyEventsToState(
				state,
				events,
			);
		newState =
			this.#aim(
				newState,
			);

		// Phase 3.5: Handle audio events
		audioController.handleEvents(
			events,
		);

		// Phase 4: Update rendering
		this.#scene.update(
			deltaTime,
			now,
			newState,
		);

		return newState;
	}

	/**
	 * Generate all events for this tick without applying them to state
	 */
	#generateTickEvents(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEvent[] {
		// Collect all base events without EventMeta
		const baseEvents: GameEventInternal[] =
			[];

		const localPlayerDirections: Direction[] =
			this.#controls.map(
				(
					c,
				) =>
					c.direction,
			);

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
			baseEvents.push(
				tickEvent,
			);
			// Convert to GameEvents with EventMeta and return early
			return [
				withEventMeta(
					tickEvent,
					deltaTime,
					now,
				),
			];
		}

		// Generate heal events for each player
		state.players.forEach(
			(
				player,
			) => {
				if (
					player.isAlive() &&
					player.healthPoints <
						player
							.stats
							.maxHp
				) {
					const healResult =
						player.healByHpRegeneration(
							now,
						);
					// Only add to events if it returned a heal event (not 'this')
					if (
						healResult !==
							player &&
						typeof healResult ===
							"object" &&
						"type" in
							healResult &&
						healResult.type ===
							"bulbroHealed"
					) {
						baseEvents.push(
							healResult,
						);
					}
				}
			},
		);

		// Generate player movement events
		state.players.forEach(
			(
				player,
				i,
			) => {
				if (
					player.isAlive()
				) {
					const direction =
						localPlayerDirections[
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
						baseEvents.push(
							moveEvent,
						);
					}
				}
			},
		);

		// Generate individual enemy movement events
		state.enemies.forEach(
			(
				enemy,
			) => {
				if (
					enemy.killedAt
				) {
					return;
				}
				baseEvents.push(
					...enemy.move(
						state,
						now,
						deltaTime,
					),
				);
				baseEvents.push(
					...enemy.attack(
						state,
						now,
						deltaTime,
					),
				);
			},
		);

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
		this.#generateEnemySpawnEvents(
			state,
			deltaTime,
			now,
			baseEvents,
		);

		// Generate player weapon shooting events
		this.#generatePlayerWeaponEvents(
			state,
			deltaTime,
			now,
			baseEvents,
		);

		// Generate shot movement events
		this.#generateShotMovementEvents(
			state,
			now,
			deltaTime,
			baseEvents,
		);

		// Generate tick event
		const tickEvent =
			{
				type: "tick" as const,
			};
		baseEvents.push(
			tickEvent,
		);

		// Add EventMeta to all events and return
		return withEventMetaMultiple(
			baseEvents,
			deltaTime,
			now,
		);
	}

	#generateEnemySpawnEvents(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
		baseEvents: GameEventInternal[],
	): void {
		baseEvents.push(
			...this.#enemySpawner.tick(
				state,
				deltaTime,
				now,
			),
		);
	}

	#generatePlayerWeaponEvents(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
		baseEvents: GameEventInternal[],
	): void {
		state.players.forEach(
			(
				player,
			) => {
				baseEvents.push(
					...player.attack(
						state.enemies,
						deltaTime,
						now,
					),
				);
			},
		);
	}

	#generateShotMovementEvents(
		state: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
		baseEvents: GameEventInternal[],
	): void {
		state.shots.forEach(
			(
				shot,
			) => {
				// Keep the existing moveShot event structure
				// The complex collision detection and hit processing is still handled in currentState.ts
				const shotMoveEvent =
					{
						type: "moveShot" as const,
						shotId:
							shot.id,
						direction:
							shot.direction,
						chance:
							Math.random(),
					};
				baseEvents.push(
					shotMoveEvent,
				);
			},
		);
	}

	#addEventsToQueue(
		events: GameEvent[],
	): void {
		events.forEach(
			(
				event,
			) =>
				this.#eventQueue.addEvent(
					event,
				),
		);
	}

	#applyEventsToState(
		state: WaveState,
		events: GameEvent[],
	): WaveState {
		return events.reduce(
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
	}

	#aim(
		state: WaveState,
	) {
		return {
			...state,
			players:
				state.players.map(
					(
						p,
					) =>
						p.aim(
							state.enemies,
						),
				),
		};
	}
}

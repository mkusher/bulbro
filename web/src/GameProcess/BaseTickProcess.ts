import type { Logger } from "pino";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { BULBRO_SIZE } from "../bulbro";
import type { PlayerControl } from "../controls";
import { ENEMY_SIZE } from "../enemy";
import { EnemySpawner } from "../enemy/EnemySpawner";
import type {
	GameEvent,
	GameEventInternal,
} from "../game-events/GameEvents";
import {
	withEventMeta,
	withEventMetaMultiple,
} from "../game-events/GameEvents";
import type { TickProcess } from "./index";
import {
	type Direction,
	distance,
	rectContainsPoint,
	rectFromCenter,
	rectIntersectsLine,
	zeroPoint,
} from "../geometry";
import { logger as defaultLogger } from "../logger";
import { movePosition } from "../physics";
import type { WaveState } from "../waveState";
import {
	generateMaterialMovementEvents,
	getTimeLeft,
} from "../waveState";

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
	#controls: PlayerControl[];
	#enemySpawner: EnemySpawner;

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
		this.#controls =
			controls;
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
		const {
			mapSize,
			shots,
			enemies,
			players,
		} =
			state;
		const bounds =
			{
				x: 0,
				y: 0,
				width:
					mapSize.width,
				height:
					mapSize.height,
			};

		for (const shot of shots) {
			const prevPos =
				shot.position;
			const nextPos =
				movePosition(
					prevPos,
					shot.speed,
					shot.direction,
					deltaTime,
				);

			// Check bounds and range
			if (
				!rectContainsPoint(
					bounds,
					nextPos,
				) ||
				distance(
					shot.startPosition,
					nextPos,
				) >
					shot.range
			) {
				// Generate shotExpired event for out of bounds or out of range shots
				baseEvents.push(
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position:
							nextPos,
					},
				);
				continue;
			}

			const segment =
				{
					start:
						prevPos,
					end: nextPos,
				};
			let isHit = false;

			// Player shots hitting enemies
			if (
				shot.shooterType ===
				"player"
			) {
				for (const enemy of enemies) {
					if (
						enemy.killedAt
					)
						continue;
					const enemyRect =
						rectFromCenter(
							enemy.position,
							ENEMY_SIZE,
						);
					if (
						rectIntersectsLine(
							enemyRect,
							segment,
						)
					) {
						isHit = true;
						const hitEvent =
							enemy.beHit(
								shot,
								now,
							);
						baseEvents.push(
							hitEvent,
						);
						break;
					}
				}
			}

			// Enemy shots hitting players
			if (
				shot.shooterType ===
				"enemy"
			) {
				for (const player of players) {
					if (
						!player.isAlive()
					)
						continue;
					const playerRect =
						rectFromCenter(
							player.position,
							BULBRO_SIZE,
						);
					if (
						rectIntersectsLine(
							playerRect,
							segment,
						)
					) {
						isHit = true;
						const hitEvent =
							player.beHit(
								shot.damage,
								now,
							);
						baseEvents.push(
							hitEvent,
						);
						break;
					}
				}
			}

			// If hit, generate shotExpired event to remove the shot
			if (
				isHit
			) {
				baseEvents.push(
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position:
							nextPos,
					},
				);
			} else {
				// If no hit, generate shot move event
				const shotMoveEvent =
					shot.move(
						nextPos,
					);
				baseEvents.push(
					shotMoveEvent,
				);
			}
		}
	}
}

import type { CurrentState } from "./currentState";
import {
	getTimeLeft,
	updateState,
	generateEnemyMovementEvents,
	generateMaterialMovementEvents,
} from "./currentState";
import type { StageWithUi } from "./graphics/StageWithUi";
import { logger as defaultLogger } from "./logger";
import {
	shouldSpawnEnemy,
	isWeaponReadyToShoot,
	findClosestEnemyInRange,
	shoot,
	isInRange,
	findClosestPlayerInRange,
} from "./game-formulas";
import { addition, zeroPoint, type Direction } from "./geometry";
import type { Logger } from "pino";
import { allEnemies } from "./enemies-definitions";
import { EnemyState, spawnEnemy } from "./enemy";
import { v4 as uuidv4 } from "uuid";
import type { PlayerControl } from "./controls";
import type {
	GameEvent,
	GameEventQueue,
	GameEventInternal,
	BulbroHealedEvent,
} from "./game-events/GameEvents";
import { withEventMeta, withEventMetaMultiple } from "./game-events/GameEvents";

/**
 * Encapsulates per-tick game updates: player movement, enemy movement, spawning, and rendering.
 */
export class TickProcess {
	#scene: StageWithUi;
	#logger = defaultLogger.child({ component: "TickProcess" });
	#controls: PlayerControl[];
	#eventQueue: GameEventQueue;

	constructor(
		logger: Logger,
		scene: StageWithUi,
		controls: PlayerControl[],
		eventQueue: GameEventQueue,
		debug: boolean,
	) {
		this.#scene = scene;
		this.#logger = logger.child({});
		this.#logger.debug("TickProcess initialized");
		this.#controls = controls;
		this.#eventQueue = eventQueue;
	}

	/**
	 * Run one tick: produces events for movement, enemy AI, spawning, and rendering.
	 */
	tick(state: CurrentState, deltaTime: number, now: number): CurrentState {
		this.#logger.debug(
			{ event: "tick", occurredAt: now, deltaTime },
			"Tick start",
		);

		// Phase 1: Generate all events for this tick
		const events = this.#generateTickEvents(state, deltaTime, now);

		// Phase 2: Add events to queue for network synchronization
		this.#addEventsToQueue(events);

		// Phase 3: Apply events to state to get new state
		const newState = this.#applyEventsToState(state, events);

		// Phase 4: Update rendering
		this.#scene.update(deltaTime, newState);

		return newState;
	}

	/**
	 * Generate all events for this tick without applying them to state
	 */
	#generateTickEvents(
		state: CurrentState,
		deltaTime: number,
		now: number,
	): GameEvent[] {
		// Collect all base events without EventMeta
		const baseEvents: GameEventInternal[] = [];

		const localPlayerDirections: Direction[] = this.#controls.map(
			(c) => c.direction,
		);

		if (!state.round.isRunning || getTimeLeft(state.round) <= 0) {
			this.#logger.debug("tick skipped; round not running");
			const tickEvent = { type: "tick" as const };
			baseEvents.push(tickEvent);
			// Convert to GameEvents with EventMeta and return early
			return [withEventMeta(tickEvent, deltaTime, now)];
		}

		// Generate heal events for each player
		state.players.forEach((player) => {
			if (player.isAlive() && player.healthPoints < player.stats.maxHp) {
				const healResult = player.healByHpRegeneration(now);
				// Only add to events if it returned a heal event (not 'this')
				if (
					healResult !== player &&
					typeof healResult === "object" &&
					"type" in healResult &&
					healResult.type === "bulbroHealed"
				) {
					baseEvents.push(healResult);
				}
			}
		});

		// Generate player movement events
		state.players.forEach((player, i) => {
			if (player.isAlive()) {
				const direction = localPlayerDirections[i] ?? zeroPoint();
				const moveEvent = player.move(direction, state.mapSize, [], deltaTime);
				if (moveEvent) {
					baseEvents.push(moveEvent);
				}
			}
		});

		// Generate individual enemy movement events
		const enemyMoveEvents = generateEnemyMovementEvents(state, deltaTime);
		baseEvents.push(...enemyMoveEvents);

		// Generate individual material movement events
		const materialMoveEvents = generateMaterialMovementEvents(state, deltaTime);
		baseEvents.push(...materialMoveEvents);

		// Generate enemy spawn events
		this.#generateEnemySpawnEvents(state, deltaTime, now, baseEvents);

		// Generate player weapon shooting events
		this.#generatePlayerWeaponEvents(state, deltaTime, now, baseEvents);

		// Generate enemy weapon shooting events
		this.#generateEnemyWeaponEvents(state, deltaTime, now, baseEvents);

		// Generate shot movement events
		this.#generateShotMovementEvents(state, now, deltaTime, baseEvents);

		// Generate tick event
		const tickEvent = { type: "tick" as const };
		baseEvents.push(tickEvent);

		// Add EventMeta to all events and return
		return withEventMetaMultiple(baseEvents, deltaTime, now);
	}

	#generateEnemySpawnEvents(
		state: CurrentState,
		deltaTime: number,
		now: number,
		baseEvents: GameEventInternal[],
	): void {
		if (shouldSpawnEnemy(now, state)) {
			const id = uuidv4();
			const position = {
				x: Math.random() * state.mapSize.width,
				y: Math.random() * state.mapSize.height,
			};
			const enemiesToSpawn = allEnemies;
			const randomEnemy =
				enemiesToSpawn[Math.floor(enemiesToSpawn.length * Math.random())]!;
			const enemy: EnemyState = spawnEnemy(id, position, randomEnemy);

			this.#logger.debug(
				{ event: "spawnEnemy", id, position, enemy },
				"spawning enemy",
			);

			const spawnEvent = {
				type: "spawnEnemy" as const,
				enemy,
			};
			baseEvents.push(spawnEvent);
		}
	}

	#generatePlayerWeaponEvents(
		state: CurrentState,
		deltaTime: number,
		now: number,
		baseEvents: GameEventInternal[],
	): void {
		state.players.forEach((player) => {
			if (!player.isAlive()) return;
			player.weapons.forEach((weapon) => {
				const reloadTime = weapon.statsBonus.attackSpeed ?? 0;
				const attackSpeed = player.stats.attackSpeed;
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						reloadTime,
						attackSpeed,
						now,
					)
				) {
					this.#logger.debug(
						{ weapon, player: player },
						"Weapon is ready to shoot",
					);
					const target = findClosestEnemyInRange(
						player,
						weapon,
						state.enemies.filter((e) => !e.killedAt),
					);
					if (target && isInRange(player, target, weapon)) {
						const shot = shoot(player, "player", weapon, target.position);
						this.#logger.info(
							{
								playerId: player.id,
								weaponId: weapon.id,
								targetId: target.id,
								shot,
							},
							"Player is attacking a target",
						);

						// Generate attack event using player's hit method
						const attackEvent = player.hit(weapon.id, target.id, shot);
						baseEvents.push(attackEvent);

						// Generate shot fired event
						const shotEvent = {
							type: "shot" as const,
							shot,
							weaponId: weapon.id,
						};
						baseEvents.push(shotEvent);
					}
				}
			});
		});
	}

	#generateEnemyWeaponEvents(
		state: CurrentState,
		deltaTime: number,
		now: number,
		baseEvents: GameEventInternal[],
	): void {
		state.enemies.forEach((enemy) => {
			if (enemy.killedAt) {
				return;
			}
			enemy.weapons.forEach((weapon) => {
				const reloadTime = weapon.statsBonus?.attackSpeed ?? 1;
				const attackSpeed = enemy.stats.attackSpeed ?? 0;
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						reloadTime,
						attackSpeed,
						now,
					)
				) {
					this.#logger.debug({ weapon, enemy }, "Weapon is ready to shoot");
					const target = findClosestPlayerInRange(enemy, weapon, state.players);
					if (target && isInRange(enemy, target, weapon)) {
						this.#logger.debug(
							{ enemy, target, weapon },
							"Enemy is attacking a target",
						);

						const shot = shoot(enemy, "enemy", weapon, target.position);

						// Generate attack event using enemy's hit method
						const attackEvent = enemy.hit(weapon.id, target.id, shot);
						baseEvents.push(attackEvent);

						// Generate shot fired event
						const shotEvent = {
							type: "shot" as const,
							shot,
							weaponId: weapon.id,
						};
						baseEvents.push(shotEvent);
					}
				}
			});
		});
	}

	#generateShotMovementEvents(
		state: CurrentState,
		now: number,
		deltaTime: number,
		baseEvents: GameEventInternal[],
	): void {
		state.shots.forEach((shot) => {
			// Keep the existing moveShot event structure
			// The complex collision detection and hit processing is still handled in currentState.ts
			const shotMoveEvent = {
				type: "moveShot" as const,
				shotId: shot.id,
				direction: shot.direction,
				chance: Math.random(),
			};
			baseEvents.push(shotMoveEvent);
		});
	}

	#addEventsToQueue(events: GameEvent[]): void {
		events.forEach((event) => this.#eventQueue.addEvent(event));
	}

	#applyEventsToState(state: CurrentState, events: GameEvent[]): CurrentState {
		return events.reduce(
			(currentState, event) => updateState(currentState, event),
			state,
		);
	}
}

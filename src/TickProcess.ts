import type { CurrentState } from "./currentState";
import { updateState } from "./currentState";
import type { Scene } from "./graphics/Scene";
import type { RoundProcess } from "./RoundProcess";
import { v4 as uuidv4 } from "uuid";
import { logger as defaultLogger } from "./logger";
import {
	shouldSpawnEnemy,
	isWeaponReadyToShoot,
	findClosestEnemyInRange,
	shoot,
} from "./game-formulas";
import { direction, distance } from "./geometry";
import { keysToDirection, type ArrowKeys } from "./keyboard";

/**
 * Encapsulates per-tick game updates: player movement, enemy movement, spawning, and rendering.
 */
export class TickProcess {
	#scene: Scene;
	#roundProcess?: RoundProcess;
	#spawnInterval: number = 1000;
	#lastSpawnAt?: number;
	#logger = defaultLogger.child({ component: "TickProcess" });

	constructor(
		scene: Scene,
		roundProcess: RoundProcess | undefined,
		now?: TickProcess,
	) {
		this.#scene = scene;
		this.#roundProcess = roundProcess;
		this.#lastSpawnAt = now?.lastSpawnAt;
		this.#logger = this.#logger.child({ spawnInterval: this.#spawnInterval });
		this.#logger.debug("TickProcess initialized");
	}

	get lastSpawnAt() {
		return this.#lastSpawnAt;
	}

	/**
	 * Run one tick: applies movement, enemy AI, spawning, and rendering.
	 */
	tick(
		state: CurrentState,
		deltaTime: number,
		keys: ArrowKeys,
		now: number,
	): CurrentState {
		if (!this.#roundProcess || !this.#roundProcess.isRunning()) {
			this.#logger.debug("tick skipped; round not running");
			this.#scene.update(deltaTime, state);
			return state;
		}
		this.#logger.debug({ event: "tick", now, deltaTime }, "Tick start");
		this.#roundProcess.tick();
		let newState = state;
		newState = this.#movePlayer(newState, deltaTime, keys);
		newState = this.#moveEnemies(newState, deltaTime);
		newState = this.#spawnEnemies(newState, now);
		newState = this.#shootPlayersWeapons(newState, now);
		newState = this.#moveShoots(newState, now, deltaTime);
		this.#scene.update(deltaTime, newState);
		return newState;
	}

	/** Handle player movement via state reducer */
	#movePlayer(
		state: CurrentState,
		deltaTime: number,
		keys: ArrowKeys,
	): CurrentState {
		const direction = keysToDirection(keys);
		return updateState(state, { type: "move", direction, deltaTime });
	}

	/** Update enemies to move towards nearest player */
	#moveEnemies(state: CurrentState, deltaTime: number): CurrentState {
		let newState = state;
		const players = state.players;
		if (players.length > 0) {
			state.enemies.forEach((enemy) => {
				// pick first as baseline
				let closest = players[0]!;
				let minDist = Infinity;
				players.forEach((p) => {
					const dist = distance(p.position, enemy.position);
					if (dist < minDist) {
						minDist = dist;
						closest = p;
					}
				});
				const d = direction(enemy.position, closest.position);
				newState = updateState(newState, {
					type: "moveEnemy",
					id: enemy.id,
					direction: d,
					deltaTime,
				});
			});
		}
		return newState;
	}

	/** Spawn new enemies over time */
	#spawnEnemies(state: CurrentState, now: number): CurrentState {
		let newState = state;
		if (shouldSpawnEnemy(now, this.#spawnInterval, state)) {
			const id = uuidv4();
			const position = {
				x: Math.random() * newState.mapSize.width,
				y: Math.random() * newState.mapSize.height,
			};
			const speed = 20;
			const healthPoints = 50;
			this.#logger.debug(
				{ event: "spawnEnemy", id, position, speed, healthPoints },
				"spawning enemy",
			);
			const now = Date.now();
			newState = updateState(newState, {
				type: "spawnEnemy",
				id,
				position,
				speed,
				healthPoints,
				now,
			});
		}
		return newState;
	}

	/** Players' weapons shooting action */
	#shootPlayersWeapons(state: CurrentState, now: number): CurrentState {
		let newState = state;
		state.players.forEach((player) => {
			player.weapons.forEach((weapon) => {
				const reloadTime = 1000;
				const attackSpeed = 1;
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						reloadTime,
						attackSpeed,
						now,
					)
				) {
					const target = findClosestEnemyInRange(player, newState.enemies);
					if (target) {
						this.#logger.debug(
							{ playerId: player.id, weaponId: weapon.id, targetId: target.id },
							"shootPlayersWeapons",
						);

						const shot = shoot(player, weapon, target.position);
						newState = updateState(newState, {
							type: "shot",
							now,
							shot,
							playerId: player.id,
							weaponId: weapon.id,
						});
					}
				}
			});
		});
		return newState;
	}

	/** Players' weapons shooting action */
	#moveShoots(
		state: CurrentState,
		now: number,
		deltaTime: number,
	): CurrentState {
		let newState = state;
		state.shots.forEach((shot) => {
			newState = updateState(newState, {
				type: "moveShot",
				shotId: shot.id,
				direction: shot.direction,
				deltaTime,
			});
		});
		return newState;
	}
}

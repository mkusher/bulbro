import type { CurrentState } from "./currentState";
import type { EnemyState } from "./enemy/EnemyState";
import {
	getTimeLeft,
	healPlayers,
	moveMaterials,
	updateState,
} from "./currentState";
import type { Scene } from "./graphics/Scene";
import { v4 as uuidv4 } from "uuid";
import { logger as defaultLogger } from "./logger";
import {
	shouldSpawnEnemy,
	isWeaponReadyToShoot,
	findClosestEnemyInRange,
	shoot,
	isInRange,
	findClosestPlayerInRange,
} from "./game-formulas";
import { direction, distance, type Direction } from "./geometry";
import type { Logger } from "pino";
import { babyEnemy, chaserEnemy, spitterEnemy } from "./enemies-definitions";
import { spawnEnemy } from "./enemy";

/**
 * Encapsulates per-tick game updates: player movement, enemy movement, spawning, and rendering.
 */
export class TickProcess {
	#scene: Scene;
	#logger = defaultLogger.child({ component: "TickProcess" });

	constructor(logger: Logger, scene: Scene) {
		this.#scene = scene;
		this.#logger = logger.child({});
		this.#logger.debug("TickProcess initialized");
	}

	/**
	 * Run one tick: applies movement, enemy AI, spawning, and rendering.
	 */
	tick(
		state: CurrentState,
		deltaTime: number,
		localPlayerDirections: Direction[],
		now: number,
	): CurrentState {
		this.#logger.debug({ event: "tick", now, deltaTime }, "Tick start");
		let newState = state;
		if (!state.round.isRunning || getTimeLeft(state.round) <= 0) {
			this.#logger.debug("tick skipped; round not running");
			newState = this.#tick(newState, now, deltaTime);
			this.#scene.update(deltaTime, newState);
			return newState;
		}
		newState = this.#healPlayers(newState, deltaTime);
		newState = this.#moveLocalPlayers(
			newState,
			deltaTime,
			localPlayerDirections,
		);
		newState = this.#moveEnemies(newState, deltaTime);
		newState = this.#moveObjects(newState, deltaTime, now);
		newState = this.#spawnEnemies(newState, deltaTime, now);
		newState = this.#shootPlayersWeapons(newState, deltaTime, now);
		newState = this.#shootEnemyWeapons(newState, deltaTime, now);
		newState = this.#moveShoots(newState, now, deltaTime);
		newState = this.#tick(newState, now, deltaTime);
		this.#scene.update(deltaTime, newState);
		return newState;
	}

	/** Handle player movement via state reducer */
	#healPlayers(state: CurrentState, deltaTime: number): CurrentState {
		return healPlayers(state, {
			type: "heal",
			deltaTime,
			now: Date.now(),
		});
	}

	/** Handle player movement via state reducer */
	#moveLocalPlayers(
		state: CurrentState,
		deltaTime: number,
		localPlayerDirections: Direction[],
	): CurrentState {
		return state.players.reduce(
			(state, player, i) =>
				updateState(state, {
					type: "move",
					direction: localPlayerDirections[i] ?? { x: 0, y: 0 },
					deltaTime,
					now: Date.now(),
					currentPlayerId: player.id,
				}),
			state,
		);
	}

	/** Update enemies to move towards nearest player */
	#moveEnemies(state: CurrentState, deltaTime: number): CurrentState {
		let newState = state;
		const players = state.players;
		if (players.length > 0) {
			state.enemies.forEach((enemy) => {
				if (enemy.killedAt) {
					return;
				}
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
					now: Date.now(),
				});
			});
		}
		return newState;
	}

	#moveObjects(
		state: CurrentState,
		deltaTime: number,
		now: number,
	): CurrentState {
		return moveMaterials(state, {
			type: "moveObjects",
			deltaTime,
			now,
		});
	}

	/** Spawn new enemies over time */
	#spawnEnemies(
		state: CurrentState,
		deltaTime: number,
		now: number,
	): CurrentState {
		let newState = state;
		if (shouldSpawnEnemy(now, state)) {
			const id = uuidv4();
			const position = {
				x: Math.random() * newState.mapSize.width,
				y: Math.random() * newState.mapSize.height,
			};
			const enemiesToSpawn = [babyEnemy, chaserEnemy, spitterEnemy];
			const randomEnemy =
				enemiesToSpawn[Math.floor(enemiesToSpawn.length * Math.random())] ??
				babyEnemy;
			const enemy: EnemyState = spawnEnemy(id, position, randomEnemy);
			this.#logger.debug(
				{ event: "spawnEnemy", id, position, enemy },
				"spawning enemy",
			);
			const now = Date.now();
			newState = updateState(newState, {
				type: "spawnEnemy",
				enemy,
				now,
				deltaTime,
			});
		}
		return newState;
	}

	#shootPlayersWeapons(
		state: CurrentState,
		deltaTime: number,
		now: number,
	): CurrentState {
		let newState = state;
		state.players.forEach((player) => {
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
						newState.enemies.filter((e) => !e.killedAt),
					);
					if (target && isInRange(player, target, weapon)) {
						this.#logger.info(
							{ playerId: player.id, weaponId: weapon.id, targetId: target.id },
							"Player is attacking a target",
						);

						const shot = shoot(player, "player", weapon, target.position);
						newState = updateState(newState, {
							type: "shot",
							deltaTime,
							now,
							shot,
							weaponId: weapon.id,
						});
					}
				}
			});
		});
		return newState;
	}

	/** Players' weapons shooting action */
	#shootEnemyWeapons(
		state: CurrentState,
		deltaTime: number,
		now: number,
	): CurrentState {
		let newState = state;
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
					const target = findClosestPlayerInRange(
						enemy,
						weapon,
						newState.players,
					);
					if (target && isInRange(enemy, target, weapon)) {
						this.#logger.debug(
							{ enemy, target, weapon },
							"Enemy is attacking a target",
						);

						const shot = shoot(enemy, "enemy", weapon, target.position);
						newState = updateState(newState, {
							type: "shot",
							deltaTime,
							now,
							shot,
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
				now,
				chance: Math.random(),
			});
		});
		return newState;
	}

	#tick(state: CurrentState, now: number, deltaTime: number): CurrentState {
		return updateState(state, { now, deltaTime });
	}
}

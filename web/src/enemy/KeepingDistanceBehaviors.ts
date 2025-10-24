import {
	findClosest,
	findClosestPlayerInRange,
	isInRange,
	isWeaponReadyToShoot,
	minWeaponRange,
	shoot,
} from "../game-formulas";
import { direction, distance } from "../geometry";
import type { EnemyBehaviors } from "./EnemyBehaviors";
import { EnemyState } from "./EnemyState";
import type { WaveState } from "../waveState";
import type { EnemyEvent } from "@/game-events/GameEvents";
import { DefaultEnemyBehaviors } from "./DefaultEnemyBehaviors";
import { KnockbackMovement } from "./KnockbackMovement";
import type { MovableObject } from "@/movement/Movement";
import type { DeltaTime, NowTime } from "@/time";

export class KeepkingDistanceBehaviors implements EnemyBehaviors {
	#default: DefaultEnemyBehaviors;
	constructor() {
		this.#default = new DefaultEnemyBehaviors();
	}
	move(
		currentEnemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		const obstacles: MovableObject[] = [];

		const knockbackMovement = new KnockbackMovement();

		const events = knockbackMovement.move(
			currentEnemy,
			waveState.mapSize,
			obstacles,
			now,
			deltaTime,
		);

		if (events) {
			return events;
		}

		if (currentEnemy.killedAt) {
			return [];
		}

		const lookupRanges = {
			from: 0.75,
			to: 1,
		};

		const actualRange = currentEnemy.stats.range / 4;

		if (currentEnemy.isStartingRaging(now)) {
			return [];
		}

		const closest = findClosest(currentEnemy, waveState.players);

		if (!closest) {
			return [];
		}

		const closestDistance = distance(currentEnemy.position, closest.position);
		if (closestDistance < actualRange * lookupRanges.from) {
			const awayDirection = direction(closest.position, currentEnemy.position);
			return this.#default.moveToDirection(
				currentEnemy,
				waveState,
				obstacles,
				awayDirection,
				deltaTime,
			);
		}
		if (
			closestDistance > actualRange * lookupRanges.from &&
			closestDistance < actualRange * lookupRanges.to
		) {
			return [];
		}

		return this.#default.move(currentEnemy, waveState, now, deltaTime);
	}

	attack(
		currentEnemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		const target = findClosest(currentEnemy, waveState.players);

		if (!target) {
			return [];
		}

		const d = distance(target.position, currentEnemy.position);
		const actualRange = currentEnemy.stats.range / 8;

		if (currentEnemy.isStartingRaging(now)) {
			return [];
		}

		if (!currentEnemy.ragingStartedAt && d <= actualRange) {
			const dir = direction(currentEnemy.position, target.position);
			return [
				{
					type: "enemyRagingStarted",
					enemyId: currentEnemy.id,
					direction: dir,
				},
			];
		}

		if (currentEnemy.isRaging(now)) {
			const baseEvents: EnemyEvent[] = [];
			currentEnemy.weapons.forEach((weapon) => {
				const reloadTime = weapon.statsBonus?.attackSpeed ?? 1;
				const attackSpeed = currentEnemy.stats.attackSpeed ?? 0;
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						reloadTime,
						attackSpeed,
						now,
					)
				) {
					if (target && currentEnemy.ragingDirection) {
						const shot = shoot(currentEnemy, "enemy", weapon, {
							x:
								currentEnemy.position.x + currentEnemy.ragingDirection.x * 1000,
							y:
								currentEnemy.position.y + currentEnemy.ragingDirection.y * 1000,
						});

						const attackEvent: EnemyEvent = {
							type: "enemyAttacked",
							enemyId: currentEnemy.id,
							weaponId: weapon.id,
							targetId: target.id,
							shot,
						};
						baseEvents.push(attackEvent);

						const shotEvent: EnemyEvent = {
							type: "shot",
							shot,
							weaponId: weapon.id,
						};
						baseEvents.push(shotEvent);
					}
				}
			});
			return baseEvents;
		}

		return [];
	}
}

import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	findClosest,
	findClosestPlayerInRange,
	isInRange,
	isWeaponReadyToShoot,
	shoot,
} from "../game-formulas";
import {
	type Direction,
	direction,
	isEqual,
} from "../geometry";
import {
	type MovableObject,
	Movement,
} from "../movement/Movement";
import type { WaveState } from "../waveState";
import type { EnemyBehaviors } from "./EnemyBehaviors";
import type { EnemyState } from "./EnemyState";
import { KnockbackMovement } from "./KnockbackMovement";

export class DefaultEnemyBehaviors
	implements
		EnemyBehaviors
{
	move(
		currentEnemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		const obstacles: MovableObject[] =
			[];

		const knockbackMovement =
			new KnockbackMovement();

		const events =
			knockbackMovement.move(
				currentEnemy,
				waveState.mapSize,
				obstacles,
				now,
				deltaTime,
			);

		if (
			events
		) {
			return events;
		}
		if (
			currentEnemy.killedAt
		) {
			return [];
		}

		const closest =
			findClosest(
				currentEnemy,
				waveState.players,
			);

		if (
			!closest
		) {
			return [];
		}

		const closestBulbroDirection =
			direction(
				currentEnemy.position,
				closest.position,
			);

		return this.moveToDirection(
			currentEnemy,
			waveState,
			obstacles,
			closestBulbroDirection,
			deltaTime,
		);
	}

	moveToDirection(
		currentEnemy: EnemyState,
		waveState: WaveState,
		obstacles: MovableObject[],
		moveDirection: Direction,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		const mover =
			new Movement(
				currentEnemy.toMovableObject(),
				waveState.mapSize,
				obstacles,
			);
		const newPos =
			mover.getPositionAfterMove(
				moveDirection,
				currentEnemy
					.stats
					.speed,
				deltaTime,
			);

		if (
			isEqual(
				currentEnemy.position,
				newPos,
			)
		)
			return [];

		const lastDirection =
			direction(
				currentEnemy.position,
				newPos,
			);
		return [
			{
				type: "enemyMoved",
				enemyId:
					currentEnemy.id,
				from: currentEnemy.position,
				to: newPos,
				direction:
					lastDirection,
			},
		];
	}

	attack(
		enemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		const baseEvents: EnemyEvent[] =
			[];
		enemy.weapons.forEach(
			(
				weapon,
			) => {
				const weaponTime =
					weapon
						.statsBonus
						?.attackSpeed ??
					1;
				const entityAttackSpeed =
					enemy
						.stats
						.attackSpeed ??
					0;
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						weaponTime,
						entityAttackSpeed,
						now,
					)
				) {
					const target =
						findClosestPlayerInRange(
							enemy,
							weapon,
							waveState.players,
						);
					if (
						target &&
						isInRange(
							enemy,
							target,
							weapon,
						)
					) {
						const shot =
							shoot(
								enemy,
								"enemy",
								weapon,
								target.position,
							);

						// Generate attack event
						const attackEvent: EnemyEvent =
							{
								type: "enemyAttacked",
								enemyId:
									enemy.id,
								weaponId:
									weapon.id,
								targetId:
									target.id,
								shot,
							};
						baseEvents.push(
							attackEvent,
						);

						// Generate shot fired event
						const shotEvent: EnemyEvent =
							{
								type: "shot",
								shot,
								weaponId:
									weapon.id,
							};
						baseEvents.push(
							shotEvent,
						);
					}
				}
			},
		);
		return baseEvents;
	}
}

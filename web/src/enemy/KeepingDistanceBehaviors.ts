import type { EnemyEvent } from "@/game-events/GameEvents";
import type { MovableObject } from "@/movement/Movement";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	findClosest,
	findClosestPlayerInRange,
	isInRange,
	isWeaponReadyToShoot,
	minWeaponRange,
} from "../game-formulas";
import {
	direction,
	distance,
} from "../geometry";
import type { WaveState } from "../waveState";
import {
	attack,
	attackDescription,
	attackSideEvents,
} from "../weapon/Attack";
import { ChasingBehavior } from "./ChasingBehavior";
import type { EnemyBehaviors } from "./EnemyBehaviors";
import type { EnemyState } from "./EnemyState";
import { KnockbackMovement } from "./KnockbackMovement";

const lookupRanges =
	{
		from: 0.5,
		to: 1,
	};

export class KeepkingDistanceBehaviors
	implements
		EnemyBehaviors
{
	#default: ChasingBehavior;
	constructor() {
		this.#default =
			new ChasingBehavior();
	}
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

		const actualRange =
			currentEnemy
				.stats
				.range /
			2;

		if (
			currentEnemy.isStartingRaging(
				now,
			)
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

		const closestDistance =
			distance(
				currentEnemy.position,
				closest.position,
			);
		if (
			closestDistance <
			actualRange *
				lookupRanges.from
		) {
			const awayDirection =
				direction(
					closest.position,
					currentEnemy.position,
				);
			return this.#default.moveToDirection(
				currentEnemy,
				waveState,
				obstacles,
				awayDirection,
				deltaTime,
			);
		}
		if (
			closestDistance >
				actualRange *
					lookupRanges.from &&
			closestDistance <
				actualRange *
					lookupRanges.to
		) {
			return [];
		}

		return this.#default.move(
			currentEnemy,
			waveState,
			now,
			deltaTime,
		);
	}

	attack(
		currentEnemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		if (
			currentEnemy.isStartingRaging(
				now,
			)
		) {
			return [];
		}
		const target =
			findClosest(
				currentEnemy,
				waveState.players,
			);

		if (
			!target
		) {
			return [];
		}

		const d =
			distance(
				target.position,
				currentEnemy.position,
			);
		const actualRange =
			currentEnemy
				.stats
				.range /
			2;

		if (
			!currentEnemy.ragingStartedAt &&
			d <=
				actualRange
		) {
			const dir =
				direction(
					currentEnemy.position,
					target.position,
				);
			return [
				{
					type: "enemyRagingStarted",
					enemyId:
						currentEnemy.id,
					direction:
						dir,
				},
			];
		}

		if (
			currentEnemy.isRaging(
				now,
			)
		) {
			const baseEvents: EnemyEvent[] =
				[];
			currentEnemy.weapons.forEach(
				(
					weapon,
				) => {
					const weaponTime =
						weapon
							.statsBonus
							?.cooldown ??
						1;
					const entityAttackSpeed =
						currentEnemy
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
						if (
							target &&
							currentEnemy.ragingDirection
						) {
							const performed =
								attack(
									currentEnemy,
									"enemy",
									weapon,
									{
										id: target.id,
										aimAt:
											{
												x:
													currentEnemy
														.position
														.x +
													currentEnemy
														.ragingDirection
														.x *
														1000,
												y:
													currentEnemy
														.position
														.y +
													currentEnemy
														.ragingDirection
														.y *
														1000,
											},
									},
									now,
								);
							if (
								!performed
							)
								return;
							baseEvents.push(
								{
									type: "enemyAttacked",
									enemyId:
										currentEnemy.id,
									...attackDescription(
										weapon.id,
										target.id,
										performed,
									),
								},
								...attackSideEvents(
									weapon.id,
									performed,
								),
							);
						}
					}
				},
			);
			return baseEvents;
		}

		return [];
	}
}

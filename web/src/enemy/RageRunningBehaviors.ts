import type { EnemyEvent } from "@/game-events/GameEvents";
import type { MovableObject } from "@/movement/Movement";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { findClosest } from "../game-formulas";
import {
	direction,
	distance,
} from "../geometry";
import type { WaveState } from "../waveState";
import { ChasingBehavior } from "./ChasingBehavior";
import type { EnemyBehaviors } from "./EnemyBehaviors";
import {
	type EnemyState,
	RAGE_STARTING_DURATION,
} from "./EnemyState";
import { predictTargetPosition } from "./EnemyTactics";
import { KnockbackMovement } from "./KnockbackMovement";

const RAGE_SPEED_MULTIPLIER = 3;

export class RageRunningBehaviors
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
		} else if (
			currentEnemy.killedAt
		) {
			return [];
		} else if (
			currentEnemy.isStartingRaging(
				now,
			)
		) {
			return [];
		} else if (
			currentEnemy.isRaging(
				now,
			) &&
			currentEnemy.ragingDirection
		) {
			const ragingEnemy =
				currentEnemy.withSpeed(
					currentEnemy
						.stats
						.speed *
						RAGE_SPEED_MULTIPLIER,
				);
			return this.#default.moveToDirection(
				ragingEnemy,
				waveState,
				obstacles,
				currentEnemy.ragingDirection,
				deltaTime,
			);
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
				.range *
			4;

		if (
			currentEnemy.canStartRaging(
				now,
			) &&
			d <=
				actualRange
		) {
			// Aim the charge where the target will be once it lands
			const chargeTime =
				(d /
					(currentEnemy
						.stats
						.speed *
						RAGE_SPEED_MULTIPLIER)) *
				1000;
			const dir =
				direction(
					currentEnemy.position,
					predictTargetPosition(
						target,
						now,
						RAGE_STARTING_DURATION +
							chargeTime,
					),
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
		return this.#default.attack(
			currentEnemy,
			waveState,
			now,
			deltaTime,
		);
	}
}

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

export class RageRunningBehaviors implements EnemyBehaviors {
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
		} else if (currentEnemy.killedAt) {
			return [];
		} else if (currentEnemy.isStartingRaging(now)) {
			return [];
		} else if (currentEnemy.isRaging(now) && currentEnemy.ragingDirection) {
			const ragingEnemy = currentEnemy.withSpeed(currentEnemy.stats.speed * 2);
			return this.#default.moveToDirection(
				ragingEnemy,
				waveState,
				obstacles,
				currentEnemy.ragingDirection,
				deltaTime,
			);
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
		const actualRange = currentEnemy.stats.range * 4;

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
		return this.#default.attack(currentEnemy, waveState, now, deltaTime);
	}
}

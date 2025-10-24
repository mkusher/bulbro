import { direction, isEqual, type Size } from "@/geometry";
import { Movement, type MovableObject } from "@/movement/Movement";
import type { EnemyState } from "./EnemyState";
import { knockbackSpeed, knockbackTimeout } from "@/game-formulas";
import type { EnemyEvent } from "@/game-events/GameEvents";
import type { DeltaTime, NowTime } from "@/time";

export class KnockbackMovement {
	move(
		subject: EnemyState,
		borders: Size,
		obstacles: MovableObject[],
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] | undefined {
		const mover = new Movement(subject.toMovableObject(), borders, obstacles);

		const knockback = subject.knockback;

		if (knockback && now - knockback.startedAt <= knockbackTimeout) {
			const newPos = mover.getPositionAfterMove(
				knockback.direction,
				knockback.strength * knockbackSpeed,
				deltaTime,
			);
			if (isEqual(subject.position, newPos)) return [];
			return [
				{
					type: "enemyMoved",
					enemyId: subject.id,
					from: subject.position,
					to: newPos,
					direction: direction(subject.position, newPos),
				},
			];
		}
	}
}

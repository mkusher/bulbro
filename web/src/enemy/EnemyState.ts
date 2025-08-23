import {
	direction,
	distance,
	isEqual,
	type Direction,
	type Position,
	type Size,
} from "../geometry";
import type { EnemyCharacter } from "./EnemyCharacter";
import type { WeaponState } from "../currentState";
import { Movement, type MovableObject, type Shape } from "../movement/Movement";
import { ENEMY_SIZE } from "./index";
import type { ShotState } from "../shot/ShotState";
import { knockbackSpeed, knockbackTimeout } from "../game-formulas";
import type { BulbroState } from "../bulbro";
import type { EnemyType as BulbaEnemyType } from "./sprites/EnemiesFrames";
import type {
	EnemyMovedEvent,
	EnemyAttackedEvent,
	EnemyReceivedHitEvent,
	EnemyDiedEvent,
	GameEvent,
} from "../game-events/GameEvents";

export type EnemyType = "orc" | "slime" | BulbaEnemyType;

/**
 * Immutable runtime state of a single enemy.
 */
export type EnemyStats = {
	maxHp: number;
	hpRegeneration: number;
	damage: number;
	meleeDamage: number;
	rangedDamage: number;
	elementalDamage: number;
	attackSpeed: number;
	critChance: number;
	range: number;
	armor: number;
	dodge: number;
	speed: number;
	materialsDropped: number;
	knockback: number;
};

export type Knockback = {
	strength: number;
	direction: Direction;
	startedAt: number;
};

export type EnemyStateProps = {
	readonly id: string;
	readonly type: EnemyType;
	readonly position: Position;
	readonly healthPoints: number;
	readonly weapons: WeaponState[];
	readonly stats: EnemyStats;
	readonly lastMovedAt: number;
	readonly lastHitAt: number;
	readonly killedAt?: number;
	readonly knockback?: Knockback;
	readonly lastDirection?: Direction;
};

export class EnemyState implements EnemyStateProps {
	#props: EnemyStateProps;

	get id() {
		return this.#props.id;
	}
	get type() {
		return this.#props.type;
	}
	get position() {
		return this.#props.position;
	}
	get healthPoints() {
		return this.#props.healthPoints;
	}
	get weapons() {
		return this.#props.weapons;
	}
	get stats() {
		return this.#props.stats;
	}
	get lastMovedAt() {
		return this.#props.lastMovedAt;
	}
	get lastHitAt() {
		return this.#props.lastHitAt;
	}
	get killedAt() {
		return this.#props.killedAt;
	}
	get knockback() {
		return this.#props.knockback;
	}
	get lastDirection() {
		return this.#props.lastDirection;
	}

	constructor(props: EnemyStateProps) {
		this.#props = props;
	}

	toJSON() {
		return { ...this.#props };
	}

	/** Returns this enemy as a MovableObject for collision logic. */
	toMovableObject() {
		return {
			position: this.position,
			shape: {
				type: "rectangle",
				width: ENEMY_SIZE.width,
				height: ENEMY_SIZE.height,
			} as const,
		} as const;
	}

	/** Returns a new state with the enemy moved to a new position. */
	moveToClosestBulbro(
		bulbros: BulbroState[],
		obstacles: MovableObject[],
		mapSize: Size,
		deltaTime: number,
		now: number,
	): EnemyState {
		const mover = new Movement(this.toMovableObject(), mapSize, obstacles);
		const knockback = this.knockback;
		if (knockback && now - knockback.startedAt <= knockbackTimeout) {
			const newPos = mover.getPositionAfterMove(
				knockback.direction,
				knockback.strength * knockbackSpeed,
				deltaTime,
			);
			if (isEqual(this.position, newPos)) return this;
			return new EnemyState({
				...this.#props,
				position: newPos,
				lastMovedAt: now,
			});
		}
		if (this.killedAt) {
			return this;
		}
		// pick first as baseline
		let minDist = Infinity;
		let closest: BulbroState | undefined = bulbros[0];
		bulbros.forEach((p) => {
			const dist = distance(this.position, p.position);
			if (dist < minDist) {
				minDist = dist;
				closest = p;
			}
		});
		if (!closest) {
			return this;
		}
		const closestBulbroDirection = direction(this.position, closest.position);
		const newPos = mover.getPositionAfterMove(
			closestBulbroDirection,
			this.stats.speed,
			deltaTime,
		);
		if (isEqual(this.position, newPos)) return this;
		return this.#internalMove(newPos, now);
	}

	/** Internal method for direct state movement (used by legacy methods). */
	#internalMove(newPos: Position, now: number): EnemyState {
		const lastDirection = direction(this.position, newPos);
		return new EnemyState({
			...this.#props,
			position: newPos,
			lastMovedAt: now,
			knockback: undefined,
			lastDirection,
		});
	}

	/** Returns a move event for the Enemy. */
	move(newPos: Position, now: number): EnemyMovedEvent {
		return {
			type: "enemyMoved",
			enemyId: this.id,
			from: this.position,
			to: newPos,
			direction: direction(this.position, newPos),
		};
	}

	/** Returns an attack event for the Enemy. */
	hit(weaponId: string, targetId?: string, shot?: any): EnemyAttackedEvent {
		return {
			type: "enemyAttacked",
			enemyId: this.id,
			weaponId,
			targetId,
			shot,
		};
	}

	/** Returns a received hit or death event for the Enemy. */
	beHit(shot: ShotState, now: number): EnemyReceivedHitEvent | EnemyDiedEvent {
		const newHealthPoints = this.healthPoints - shot.damage;

		if (newHealthPoints <= 0 && this.healthPoints > 0) {
			// Enemy dies
			return {
				type: "enemyDied",
				enemyId: this.id,
				position: { x: this.position.x, y: this.position.y },
			};
		}

		// Enemy takes damage but survives
		return {
			type: "enemyReceivedHit",
			enemyId: this.id,
			damage: shot.damage,
		};
	}

	/** Apply a single event to this Enemy state and return the new state. */
	applyEvent(event: GameEvent): EnemyState {
		switch (event.type) {
			case "enemyMoved":
				if (event.enemyId !== this.id) return this;
				return new EnemyState({
					...this.#props,
					position: event.to,
					lastMovedAt: Date.now(),
					lastDirection: event.direction,
					knockback: undefined,
				});

			case "enemyAttacked":
				if (event.enemyId !== this.id) return this;
				const weapons = this.weapons.map((ws) =>
					ws.id === event.weaponId ? { ...ws, lastStrikedAt: Date.now() } : ws,
				);
				return new EnemyState({
					...this.#props,
					weapons,
				});

			case "enemyReceivedHit":
				if (event.enemyId !== this.id) return this;
				return new EnemyState({
					...this.#props,
					healthPoints: Math.max(this.healthPoints - event.damage, 0),
					lastHitAt: Date.now(),
				});

			case "enemyDied":
				if (event.enemyId !== this.id) return this;
				return new EnemyState({
					...this.#props,
					healthPoints: 0,
					killedAt: Date.now(),
				});

			default:
				return this;
		}
	}

	/** Apply multiple events to this Enemy state and return the new state. */
	applyEvents(events: GameEvent[]): EnemyState {
		return events.reduce(
			(state: EnemyState, event) => state.applyEvent(event),
			this,
		);
	}

	toMaterial() {
		return {
			type: "material",
			id: this.id,
			position: this.position,
			value: this.stats.materialsDropped,
		} as const;
	}
}

/**
 * Spawns a new enemy state from a character definition.
 */
export function spawnEnemy(
	id: string,
	position: Position,
	character: EnemyCharacter,
): EnemyState {
	const weapons: WeaponState[] = character.weapons.map((w) => ({
		id: w.id,
		lastStrikedAt: 0,
		statsBonus: w.statsBonus,
		shotSpeed: w.shotSpeed,
	}));
	return new EnemyState({
		id,
		type: character.sprite,
		position,
		healthPoints: character.stats.maxHp,
		weapons,
		stats: character.stats,
		lastMovedAt: Date.now(),
		lastHitAt: 0,
	});
}

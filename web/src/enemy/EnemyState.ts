import { type Direction, type Position } from "../geometry";
import type { EnemyCharacter } from "./EnemyCharacter";
import type { WaveState, WeaponState } from "../waveState";
import { ENEMY_SIZE } from "./index";
import type { ShotState } from "../shot/ShotState";
import type { EnemyType } from "./sprites/EnemiesFrames";
import type {
	EnemyReceivedHitEvent,
	EnemyDiedEvent,
	GameEvent,
	EnemyEvent,
} from "../game-events/GameEvents";
import { toWeaponState } from "@/weapon";
import type { EnemyBehaviors } from "./EnemyBehaviors";
import { DefaultEnemyBehaviors } from "./DefaultEnemyBehaviors";
import { getBehaviors } from "./BehaviorsMap";
import type { DeltaTime, NowTime } from "@/time";

export type { EnemyType };

export const RAGE_STARTING_DURATION = 500;
export const RAGE_TOTAL_DURATION = 1500;

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
	readonly behaviors?: EnemyBehaviors;
	readonly ragingStartedAt?: number;
	readonly ragingDirection?: Direction;
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
	get behaviors(): EnemyBehaviors {
		return this.#props.behaviors!;
	}
	get ragingStartedAt() {
		return this.#props.ragingStartedAt;
	}
	get ragingDirection() {
		return this.#props.ragingDirection;
	}

	constructor(props: EnemyStateProps) {
		this.#props = {
			...props,
			behaviors: props.behaviors ?? new DefaultEnemyBehaviors(),
		};
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

	move(state: WaveState, now: NowTime, deltaTime: DeltaTime) {
		return this.behaviors.move(this, state, now, deltaTime);
	}

	withSpeed(speed: number) {
		return new EnemyState({
			...this.#props,
			stats: {
				...this.#props.stats,
				speed,
			},
		});
	}

	attack(state: WaveState, now: NowTime, deltaTime: DeltaTime): EnemyEvent[] {
		return this.behaviors.attack(this, state, now, deltaTime);
	}

	/** Returns a received hit or death event for the Enemy. */
	beHit(shot: ShotState, now: NowTime): EnemyReceivedHitEvent | EnemyDiedEvent {
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
					lastMovedAt: event.occurredAt,
					lastDirection: event.direction,
					knockback: undefined,
				});

			case "enemyAttacked":
				if (event.enemyId !== this.id) return this;
				const weapons = this.weapons.map((ws) =>
					ws.id === event.weaponId
						? { ...ws, lastStrikedAt: event.occurredAt }
						: ws,
				);
				return new EnemyState({
					...this.#props,
					weapons,
					ragingStartedAt: undefined,
				});

			case "enemyReceivedHit":
				if (event.enemyId !== this.id) return this;
				return new EnemyState({
					...this.#props,
					healthPoints: Math.max(this.healthPoints - event.damage, 0),
					lastHitAt: event.occurredAt,
				});

			case "enemyDied":
				if (event.enemyId !== this.id) return this;
				return new EnemyState({
					...this.#props,
					healthPoints: 0,
					killedAt: event.occurredAt,
				});

			case "enemyRagingStarted":
				if (event.enemyId !== this.id) return this;
				return new EnemyState({
					...this.#props,
					ragingStartedAt: event.occurredAt,
					ragingDirection: event.direction,
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

	isStartingRaging(now: NowTime): boolean {
		if (!this.ragingStartedAt) return false;
		return now - this.ragingStartedAt < RAGE_STARTING_DURATION;
	}

	isRaging(now: NowTime): boolean {
		if (!this.ragingStartedAt) return false;
		if (this.isStartingRaging(now)) return false;
		return now - this.ragingStartedAt < RAGE_TOTAL_DURATION;
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
	const weapons: WeaponState[] = character.weapons.map(toWeaponState);
	return new EnemyState({
		id,
		type: character.sprite,
		position,
		healthPoints: character.stats.maxHp,
		weapons,
		stats: character.stats,
		lastMovedAt: 0,
		lastHitAt: 0,
		behaviors: getBehaviors(character.behaviors),
	});
}

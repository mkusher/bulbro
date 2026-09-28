import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { toWeaponState } from "@/weapon";
import {
	applyAttackToWeapons,
	applyStrikeSweptToWeapons,
} from "@/weapon/Attack";
import type {
	EnemyDiedEvent,
	EnemyEvent,
	EnemyReceivedHitEvent,
	GameEvent,
	KnockbackDescription,
} from "../game-events/GameEvents";
import type {
	Direction,
	Position,
} from "../geometry";
import {
	CONSUMABLE_HEAL_AMOUNT,
	type Consumable,
	consumableIdFor,
} from "../object/ConsumableState";
import type {
	WaveState,
	WeaponState,
} from "../waveState";
import { getBehaviors } from "./BehaviorsMap";
import type { EnemyBehaviors } from "./EnemyBehaviors";
import type { EnemyCharacter } from "./EnemyCharacter";
import { ENEMY_SIZE } from "./index";
import type { EnemyType } from "./sprites/EnemiesFrames";

export type {
	EnemyType,
};

export const RAGE_STARTING_DURATION = 500;
export const RAGE_TOTAL_DURATION = 1500;
export const DEATH_DURATION = 1000;

/**
 * Immutable runtime state of a single enemy.
 */
export type EnemyStats =
	{
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

export type Knockback =
	{
		strength: number;
		direction: Direction;
		startedAt: number;
	};

export type EnemyStateProps =
	{
		readonly behaviorType?: import("./EnemyCharacter").EnemyCharacter["behaviors"];
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
		readonly lastHorizontalDirection: number;
		readonly behaviors?: EnemyBehaviors;
		readonly ragingStartedAt?: number;
		readonly ragingDirection?: Direction;
		/** Chance (0..1) to drop a consumable on death */
		readonly consumableDropChance?: number;
	};

export class EnemyState
	implements
		EnemyStateProps
{
	#props: EnemyStateProps;

	get id() {
		return this
			.#props
			.id;
	}
	get type() {
		return this
			.#props
			.type;
	}
	get position() {
		return this
			.#props
			.position;
	}
	get healthPoints() {
		return this
			.#props
			.healthPoints;
	}
	get weapons() {
		return this
			.#props
			.weapons;
	}
	get stats() {
		return this
			.#props
			.stats;
	}
	get lastMovedAt() {
		return this
			.#props
			.lastMovedAt;
	}
	get lastHitAt() {
		return this
			.#props
			.lastHitAt;
	}
	get killedAt() {
		return this
			.#props
			.killedAt;
	}
	get knockback() {
		return this
			.#props
			.knockback;
	}
	get lastDirection() {
		return this
			.#props
			.lastDirection;
	}
	get lastHorizontalDirection() {
		return this
			.#props
			.lastHorizontalDirection;
	}
	get behaviors(): EnemyBehaviors {
		return this
			.#props
			.behaviors!;
	}
	get consumableDropChance() {
		return (
			this
				.#props
				.consumableDropChance ??
			0
		);
	}
	get ragingStartedAt() {
		return this
			.#props
			.ragingStartedAt;
	}
	get ragingDirection() {
		return this
			.#props
			.ragingDirection;
	}

	constructor(
		props: EnemyStateProps,
	) {
		this.#props =
			{
				...props,
				behaviors:
					props.behaviors &&
					typeof props
						.behaviors
						.move ===
						"function"
						? props.behaviors
						: getBehaviors(
								props.behaviorType,
							),
			};
	}

	toJSON() {
		return {
			...this
				.#props,
		};
	}

	/** Returns this enemy as a MovableObject for collision logic. */
	toMovableObject() {
		return {
			position:
				this
					.position,
			shape:
				{
					type: "rectangle",
					width:
						ENEMY_SIZE.width,
					height:
						ENEMY_SIZE.height,
				} as const,
		} as const;
	}

	move(
		state: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	) {
		return this.behaviors.move(
			this,
			state,
			now,
			deltaTime,
		);
	}

	withSpeed(
		speed: number,
	) {
		return new EnemyState(
			{
				...this
					.#props,
				stats:
					{
						...this
							.#props
							.stats,
						speed,
					},
			},
		);
	}

	attack(
		state: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[] {
		return this.behaviors.attack(
			this,
			state,
			now,
			deltaTime,
		);
	}

	/** Returns a received hit or death event for the Enemy. */
	beHit(
		hit: {
			damage: number;
		},
		now: NowTime,
		knockback?: KnockbackDescription,
		random: () => number = Math.random,
	):
		| EnemyReceivedHitEvent
		| EnemyDiedEvent {
		const newHealthPoints =
			Math.max(
				this
					.healthPoints -
					hit.damage,
				0,
			);

		if (
			newHealthPoints <=
			0
		) {
			// Enemy dies
			const dropsConsumable =
				random() <
				this
					.consumableDropChance;
			return {
				type: "enemyDied",
				...(dropsConsumable
					? {
							consumableId:
								consumableIdFor(
									this
										.id,
								),
						}
					: {}),
				enemyId:
					this
						.id,
				damage:
					hit.damage,
				position:
					{
						x: this
							.position
							.x,
						y: this
							.position
							.y,
					},
			};
		}

		// Enemy takes damage but survives
		return {
			type: "enemyReceivedHit",
			enemyId:
				this
					.id,
			damage:
				this
					.healthPoints -
				newHealthPoints,
			newHealthPoints,
			...(knockback &&
			knockback.strength >
				0
				? {
						knockback,
					}
				: {}),
		};
	}

	/** Apply a single event to this Enemy state and return the new state. */
	applyEvent(
		event: GameEvent,
	): EnemyState {
		switch (
			event.type
		) {
			case "enemyMoved":
				if (
					event.enemyId !==
					this
						.id
				)
					return this;
				return new EnemyState(
					{
						...this
							.#props,
						position:
							event.to,
						lastMovedAt:
							event.occurredAt,
						lastDirection:
							event.direction,
						lastHorizontalDirection:
							event
								.direction
								.x !==
							0
								? event
										.direction
										.x
								: this
										.#props
										.lastHorizontalDirection,
					},
				);

			case "enemyAttacked":
				if (
					event.enemyId !==
					this
						.id
				)
					return this;
				return new EnemyState(
					{
						...this
							.#props,
						weapons:
							applyAttackToWeapons(
								this
									.weapons,
								event,
							),
						ragingStartedAt:
							undefined,
					},
				);

			case "strikeSwept":
				if (
					event.attackerType !==
						"enemy" ||
					event.attackerId !==
						this
							.id
				)
					return this;
				return new EnemyState(
					{
						...this
							.#props,
						weapons:
							applyStrikeSweptToWeapons(
								this
									.weapons,
								event,
							),
					},
				);

			case "enemyReceivedHit":
				if (
					event.enemyId !==
					this
						.id
				)
					return this;
				return new EnemyState(
					{
						...this
							.#props,
						healthPoints:
							Math.max(
								this
									.healthPoints -
									event.damage,
								0,
							),
						lastHitAt:
							event.occurredAt,
						knockback:
							event.knockback
								? {
										...event.knockback,
										startedAt:
											event.occurredAt,
									}
								: this
										.#props
										.knockback,
					},
				);

			case "enemyDied":
				if (
					event.enemyId !==
					this
						.id
				)
					return this;
				return new EnemyState(
					{
						...this
							.#props,
						healthPoints: 0,
						killedAt:
							event.occurredAt,
					},
				);

			case "enemyRagingStarted":
				if (
					event.enemyId !==
					this
						.id
				)
					return this;
				return new EnemyState(
					{
						...this
							.#props,
						ragingStartedAt:
							event.occurredAt,
						ragingDirection:
							event.direction,
					},
				);

			default:
				return this;
		}
	}

	/** Apply multiple events to this Enemy state and return the new state. */
	applyEvents(
		events: GameEvent[],
	): EnemyState {
		return events.reduce(
			(
				state: EnemyState,
				event,
			) =>
				state.applyEvent(
					event,
				),
			this,
		);
	}

	toConsumable(
		consumableId: string,
	): Consumable {
		return {
			type: "consumable",
			id: consumableId,
			position:
				this
					.position,
			hp: CONSUMABLE_HEAL_AMOUNT,
		};
	}

	toMaterial() {
		return {
			type: "material",
			id: this
				.id,
			position:
				this
					.position,
			value:
				this
					.stats
					.materialsDropped,
		} as const;
	}

	isStartingRaging(
		now: NowTime,
	): boolean {
		if (
			!this
				.ragingStartedAt
		)
			return false;
		return (
			now -
				this
					.ragingStartedAt <
			RAGE_STARTING_DURATION
		);
	}

	isRaging(
		now: NowTime,
	): boolean {
		if (
			!this
				.ragingStartedAt
		)
			return false;
		if (
			this.isStartingRaging(
				now,
			)
		)
			return false;
		return (
			now -
				this
					.ragingStartedAt <
			RAGE_TOTAL_DURATION
		);
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
	const weapons: WeaponState[] =
		character.weapons.map(
			toWeaponState,
		);
	return new EnemyState(
		{
			id,
			type: character.sprite,
			position,
			healthPoints:
				character
					.stats
					.maxHp,
			weapons,
			stats:
				character.stats,
			lastMovedAt: 0,
			lastHitAt: 0,
			lastHorizontalDirection: 1,
			behaviors:
				getBehaviors(
					character.behaviors,
				),
			consumableDropChance:
				character.consumableDropChance,
			behaviorType:
				character.behaviors,
		},
	);
}

import type { EnemyState } from "@/enemy";
import type {
	AttackDescription,
	BulbroAttackedEvent,
	BulbroDiedEvent,
	BulbroEvent,
	BulbroHealedEvent,
	BulbroMovedEvent,
	BulbroReceivedHitEvent,
	GameEvent,
} from "@/game-events/GameEvents";
import type { LockedShopOffer } from "@/shop/LockedShopOffer";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	applyAttackToWeapons,
	applyStrikeSweptToWeapons,
	attack,
	attackDescription,
	attackSideEvents,
} from "@/weapon/Attack";
import {
	calculateWeaponWorldOffset,
	computeStats,
	damageAfterArmor,
	findClosestEnemyInRange,
	getDodgeChance,
	getHpRegenerationPerSecond,
	getLifeStealChance,
	harvestingGrowthPerWave,
	isInRange,
	isWeaponReadyToShoot,
	lifeStealCooldown,
	lifeStealHeal,
	type StatSource,
	weaponCooldownSeconds,
} from "../game-formulas";
import {
	addition,
	type Direction,
	direction,
	isEqual,
	type Position,
	round,
	type Size,
	zeroPoint,
} from "../geometry";
import {
	findItemById,
	itemIdFromStatSourceId,
	itemStatSourceId,
} from "../items/Items";
import {
	type MovableObject,
	Movement,
	type Shape,
} from "../movement/Movement";
import {
	findUpgradeById,
	levelUpgradeStatSourceId,
	upgradeBonuses,
} from "../upgrades/Upgrades";
import type { WeaponState } from "../waveState";
import { toWeaponState } from "../weapon";
import { combineWeapons } from "../weapon/WeaponTiers";
import type {
	Bulbro,
	Stats,
} from "./BulbroCharacter";
import { BULBRO_SIZE } from "./index";
import {
	getLevelForExperience,
	getTotalExperienceForLevel,
} from "./Levels";
import type { FaceType } from "./Sprite";

/** Protection after taking damage, in milliseconds. */
export const hitInvulnerabilityDuration = 200;

type BulbroStateProperties =
	{
		readonly id: string;
		readonly type: FaceType;
		/** Id of the character definition the Bulbro was spawned from */
		readonly characterId: string;
		readonly position: Position;
		readonly level: number;
		readonly totalExperience: number;
		readonly materialsAvailable: number;
		/**
		 * Materials left on the field when a wave ended. Every later pickup
		 * takes one out of the bag and pays it out on top of the picked one.
		 */
		readonly bagMaterials?: number;
		readonly healthPoints: number;
		readonly stats: Stats;
		/** Where the stat points come from; `stats` is computed from them */
		readonly statSources: StatSource[];
		/** When life steal healed the Bulbro the last time */
		readonly lastLifeStealAt?: number;
		readonly weapons: WeaponState[];
		/** Owned item IDs in acquisition order; duplicates represent separate copies. */
		readonly items: readonly string[];
		readonly lastMovedAt: number;
		readonly lastHitAt: number;
		readonly invulnerableUntil?: number;
		readonly healedByHpRegenerationAt: number;
		readonly killedAt?: number;
		readonly lastDirection: Direction;
		readonly lastHorizontalDirection: number;
		readonly rerollCount: number;
		readonly lockedShopOffers?: readonly LockedShopOffer[];
		/** Level-up upgrade re-rolls done in the current wave */
		readonly upgradeRerollCount?: number;
	};

/**
 * Immutable runtime state of a single Bulbro (player).
 */
export class BulbroState
	implements
		BulbroStateProperties
{
	#props: BulbroStateProperties;

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
	get characterId() {
		return this
			.#props
			.characterId;
	}
	get position() {
		return this
			.#props
			.position;
	}
	get speed() {
		return this
			.#props
			.stats
			.speed;
	}
	get statSources() {
		return this
			.#props
			.statSources;
	}
	get lastLifeStealAt() {
		return this
			.#props
			.lastLifeStealAt;
	}
	get level() {
		return this
			.#props
			.level;
	}
	/** Level-up upgrades already picked */
	get levelUpgradesTaken() {
		return this.statSources.filter(
			(
				s,
			) =>
				s.kind ===
				"upgrade",
		)
			.length;
	}
	/** Levels gained that still wait for an upgrade to be picked */
	get pendingLevelUps() {
		return Math.max(
			0,
			this
				.level -
				this
					.levelUpgradesTaken,
		);
	}
	/** Level the next upgrade is picked for */
	get nextLevelUpLevel() {
		return (
			this
				.levelUpgradesTaken +
			1
		);
	}
	/** Owned item IDs in acquisition order, including duplicate copies. */
	get items() {
		return this
			.#props
			.items;
	}
	get totalExperience() {
		return this
			.#props
			.totalExperience;
	}
	get materialsAvailable() {
		return this
			.#props
			.materialsAvailable;
	}
	get bagMaterials() {
		return (
			this
				.#props
				.bagMaterials ??
			0
		);
	}
	get healthPoints() {
		return this
			.#props
			.healthPoints;
	}
	get stats() {
		const tools =
			this.weapons.filter(
				(
					w,
				) =>
					w.type ===
						"wrench" ||
					w.type ===
						"screwdriver",
			).length;
		const engineering =
			Math.max(
				0,
				Math.min(
					6,
					tools,
				) -
					1,
			);
		const harvesting =
			this.weapons.reduce(
				(
					sum,
					w,
				) =>
					sum +
					(w
						.statsBonus
						.harvesting ??
						0),
				0,
			);
		return harvesting ||
			engineering
			? {
					...this
						.#props
						.stats,
					engineering:
						this
							.#props
							.stats
							.engineering +
						engineering,
					harvesting:
						this
							.#props
							.stats
							.harvesting +
						harvesting,
				}
			: this
					.#props
					.stats;
	}
	get weapons() {
		return this
			.#props
			.weapons;
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
	get lastDirection() {
		return this
			.#props
			.lastDirection;
	}

	get healedByHpRegenerationAt() {
		return this
			.#props
			.healedByHpRegenerationAt;
	}

	get lastHorizontalDirection() {
		return this
			.#props
			.lastHorizontalDirection;
	}

	get upgradeRerollCount() {
		return (
			this
				.#props
				.upgradeRerollCount ??
			0
		);
	}

	get lockedShopOffers() {
		return (
			this
				.#props
				.lockedShopOffers ??
			[]
		);
	}

	get rerollCount() {
		return this
			.#props
			.rerollCount;
	}

	constructor(
		props: Omit<
			BulbroStateProperties,
			"items"
		> & {
			items?: readonly string[];
		},
	) {
		if (
			!Number.isSafeInteger(
				props
					.stats
					.maxWeapons,
			) ||
			props
				.stats
				.maxWeapons <
				0 ||
			props
				.weapons
				.length >
				props
					.stats
					.maxWeapons
		) {
			throw new Error(
				"Weapon limit exceeded or invalid maximum weapon count",
			);
		}
		this.#props =
			{
				...props,
				// Migrate snapshots written before inventory was stored explicitly.
				items:
					props.items ??
					props.statSources.flatMap(
						(
							source,
						) => {
							const id =
								source.kind ===
								"item"
									? itemIdFromStatSourceId(
											source.id,
										)
									: undefined;
							return id
								? [
										id,
									]
								: [];
						},
					),
			};
	}

	toJSON() {
		return {
			...this
				.#props,
			items:
				[
					...this
						.items,
				],
		};
	}

	useWeapons(
		weapons: WeaponState[],
	) {
		return new BulbroState(
			{
				...this
					.#props,
				weapons,
			},
		);
	}

	/**
	 * Spends materials from this Bulbro.
	 * Returns a new BulbroState with reduced materials.
	 */
	spendMaterials(
		amount: number,
	) {
		return new BulbroState(
			{
				...this
					.#props,
				materialsAvailable:
					Math.max(
						0,
						this
							.#props
							.materialsAvailable -
							amount,
					),
			},
		);
	}

	isAlive() {
		return (
			this
				.healthPoints >
			0
		);
	}

	/** Returns a move event for the Bulbro. */
	move(
		direction: Direction,
		mapSize: Size,
		obstacles: MovableObject[],
		deltaTime: DeltaTime,
	):
		| BulbroMovedEvent
		| undefined {
		const mover =
			new Movement(
				this.toMovableObject(),
				mapSize,
				obstacles,
			);
		const to =
			mover.getPositionAfterMove(
				direction,
				this
					.speed,
				deltaTime,
			);
		if (
			isEqual(
				this
					.position,
				to,
			)
		) {
			return;
		}
		return {
			type: "bulbroMoved",
			bulbroId:
				this
					.id,
			from: this
				.position,
			to,
			direction,
		};
	}

	prepareForWave(
		position: Position,
		direction: Direction,
		_now: NowTime,
	): BulbroEvent[] {
		return [
			{
				type: "bulbroInitializedForWave",
				bulbroId:
					this
						.id,
				position,
				direction,
			},
		];
	}
	moveFromDirection(
		position: Position,
		direction: Direction,
		_now: NowTime,
	): BulbroMovedEvent {
		const roundedPosition =
			round(
				position,
			);
		return {
			type: "bulbroMoved",
			bulbroId:
				this
					.id,
			from: this
				.position,
			to: roundedPosition,
			direction:
				isEqual(
					direction,
					zeroPoint(),
				)
					? zeroPoint()
					: direction,
		};
	}

	attack(
		enemies: EnemyState[],
		_deltaTime: DeltaTime,
		now: NowTime,
	) {
		const baseEvents: BulbroEvent[] =
			[];
		if (
			!this.isAlive()
		)
			return baseEvents;
		this.weapons.forEach(
			(
				weapon,
			) => {
				const weaponCooldown =
					weaponCooldownSeconds(
						weapon,
					);
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						weaponCooldown,
						this
							.stats
							.attackSpeed,
						now,
					)
				) {
					const target =
						findClosestEnemyInRange(
							this,
							weapon,
							enemies.filter(
								(
									e,
								) =>
									!e.killedAt,
							),
						);
					if (
						!target ||
						!isInRange(
							this,
							target,
							weapon,
							"player",
						)
					) {
						return;
					}
					const performed =
						attack(
							this,
							"player",
							weapon,
							{
								id: target.id,
								aimAt:
									target.position,
							},
							now,
						);
					if (
						!performed
					)
						return;
					baseEvents.push(
						this.hit(
							attackDescription(
								weapon.id,
								target.id,
								performed,
							),
						),
						...attackSideEvents(
							weapon.id,
							performed,
						),
					);
				}
			},
		);
		return baseEvents;
	}

	aim(
		enemies: EnemyState[],
	) {
		return new BulbroState(
			{
				...this
					.#props,
				weapons:
					this.weapons.map(
						(
							weapon,
							index,
						) => {
							const target =
								findClosestEnemyInRange(
									this,
									{
										...weapon,
										statsBonus:
											{
												...weapon.statsBonus,
												range:
													Math.max(
														100,
														weapon
															.statsBonus
															?.range ??
															0,
													) *
													1.5,
											},
									},
									enemies.filter(
										(
											e,
										) =>
											!e.killedAt,
									),
								);
							if (
								!target
							) {
								return {
									...weapon,
									aimingDirection:
										zeroPoint(),
								};
							}

							const offset =
								calculateWeaponWorldOffset(
									index,
									this
										.weapons
										.length,
									this
										.lastHorizontalDirection,
								);
							const position =
								addition(
									this
										.position,
									offset,
								);
							const aimingDirection =
								direction(
									position,
									target.position,
								);
							// When facing left, the sprite container is flipped (scale.x = -1),
							// so we need to flip the x component of the aiming direction
							// for the weapon to aim correctly in the flipped coordinate space
							const directionMultiplier =
								this
									.lastHorizontalDirection <
								0
									? -1
									: 1;
							const adjustedDirection =
								{
									x:
										aimingDirection.x *
										directionMultiplier,
									y: aimingDirection.y,
								};
							return {
								...weapon,
								aimingDirection:
									adjustedDirection,
							};
						},
					),
			},
		);
	}

	/** Returns an attack event for the Bulbro. */
	hit(
		description: AttackDescription,
	): BulbroAttackedEvent {
		return {
			type: "bulbroAttacked",
			bulbroId:
				this
					.id,
			...description,
		};
	}

	/**
	 * Returns a received hit or death event for the Bulbro,
	 * or nothing when protected, dead, dodging, or taking no damage.
	 * Positive armor reduces damage; negative armor increases it.
	 */
	beHit(
		damage: number,
		now: NowTime,
		random: () => number = Math.random,
	):
		| BulbroReceivedHitEvent
		| BulbroDiedEvent
		| undefined {
		if (
			!this.isAlive() ||
			this.isInvulnerable(
				now,
			) ||
			damage <=
				0
		) {
			return undefined;
		}
		if (
			random() <
			getDodgeChance(
				this
					.stats
					.dodge,
			)
		) {
			return undefined;
		}
		const damageTaken =
			damageAfterArmor(
				damage,
				this
					.stats
					.armor,
			);
		const newHealthPoints =
			Math.max(
				this
					.healthPoints -
					damageTaken,
				0,
			);

		if (
			newHealthPoints <=
				0 &&
			this
				.healthPoints >
				0
		) {
			// Bulbro dies
			return {
				type: "bulbroDied",
				bulbroId:
					this
						.id,
				damage:
					damageTaken,
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

		// Bulbro takes damage but survives
		return {
			type: "bulbroReceivedHit",
			bulbroId:
				this
					.id,
			damage:
				damageTaken,
		};
	}

	isInvulnerable(
		now: number,
	): boolean {
		return (
			now <
			(this
				.#props
				.invulnerableUntil ??
				0)
		);
	}

	/**
	 * Rolls life steal for a hit this Bulbro dealt: returns a heal event
	 * with a chance of the life steal stat, at most 10 times per second.
	 */
	stealLife(
		now: NowTime,
		random: () => number = Math.random,
	):
		| BulbroHealedEvent
		| undefined {
		if (
			!this.isAlive() ||
			this
				.healthPoints >=
				this
					.stats
					.maxHp ||
			now -
				(this
					.lastLifeStealAt ??
					-Infinity) <
				lifeStealCooldown ||
			random() >=
				getLifeStealChance(
					this
						.stats
						.lifeSteal,
				)
		) {
			return undefined;
		}
		return {
			type: "bulbroHealed",
			bulbroId:
				this
					.id,
			hp: lifeStealHeal,
			source:
				"lifeSteal",
		};
	}

	/** Adds one owned copy and applies its stat bonuses without spending materials. */
	withItem(
		itemId: string,
	): BulbroState {
		const item =
			findItemById(
				itemId,
			);
		if (
			!item
		)
			return this;
		const upgraded =
			this.withStatSource(
				{
					id: itemStatSourceId(
						item.id,
						this
							.items
							.length,
					),
					kind: "item",
					bonuses:
						item.bonuses,
				},
			);
		return new BulbroState(
			{
				...upgraded.#props,
				items:
					[
						...this
							.items,
						item.id,
					],
				healthPoints:
					Math.min(
						this
							.healthPoints,
						upgraded
							.stats
							.maxHp,
					),
			},
		);
	}

	/** Replaces the stat source with the same id (or adds it) and recomputes stats. */
	withStatSource(
		source: StatSource,
	) {
		const statSources =
			[
				...this.statSources.filter(
					(
						s,
					) =>
						s.id !==
						source.id,
				),
				source,
			];
		return new BulbroState(
			{
				...this
					.#props,
				statSources,
				stats:
					computeStats(
						statSources,
					),
			},
		);
	}

	/**
	 * End of wave harvesting (Brotato): gives as many materials and experience
	 * as the harvesting stat, then grows harvesting by 5% (rounded up).
	 * Negative harvesting takes materials and experience away instead (never a
	 * level) and does not grow.
	 */
	harvest() {
		const harvesting =
			Math.floor(
				this
					.stats
					.harvesting,
			);
		if (
			harvesting <
			0
		)
			return this.loseMaterials(
				-harvesting,
			);
		if (
			harvesting ===
			0
		)
			return this;
		const growthSource =
			this.statSources.find(
				(
					s,
				) =>
					s.id ===
					harvestingGrowthStatSourceId,
			);
		const grown =
			this.withStatSource(
				{
					id: harvestingGrowthStatSourceId,
					kind: "harvestingGrowth",
					bonuses:
						{
							harvesting:
								(growthSource
									?.bonuses
									.harvesting ??
									0) +
								Math.ceil(
									harvesting *
										harvestingGrowthPerWave,
								),
						},
				},
			);
		return grown.gainMaterials(
			harvesting,
		);
	}

	/** Puts materials left on the field at the end of a wave into the bag. */
	bagMaterialsLeft(
		amount: number,
	) {
		if (
			amount <=
			0
		)
			return this;
		return new BulbroState(
			{
				...this
					.#props,
				bagMaterials:
					this
						.bagMaterials +
					amount,
			},
		);
	}

	/** Collects the pickup value plus an equal value from the bag, capped by its balance. */
	collectMaterial(
		value: number,
	) {
		if (
			value <=
			0
		)
			return this;
		const bonus =
			Math.min(
				value,
				this
					.bagMaterials,
			);
		return new BulbroState(
			{
				...this
					.#props,
				bagMaterials:
					this
						.bagMaterials -
					bonus,
			},
		).gainMaterials(
			value +
				bonus,
		);
	}

	/**
	 * Removes materials and the same amount of experience. Experience never
	 * drops below the current level, so a level is never lost.
	 */
	loseMaterials(
		amount: number,
	) {
		if (
			amount <=
			0
		)
			return this;
		return new BulbroState(
			{
				...this
					.#props,
				materialsAvailable:
					Math.max(
						0,
						this
							.materialsAvailable -
							amount,
					),
				totalExperience:
					Math.max(
						Math.min(
							this
								.totalExperience,
							getTotalExperienceForLevel(
								this
									.level,
							),
						),
						this
							.totalExperience -
							amount,
					),
			},
		);
	}

	/** Adds materials and the same amount of experience, leveling up if needed. */
	gainMaterials(
		amount: number,
	) {
		if (
			amount <=
			0
		)
			return this;
		const totalExperience =
			this
				.totalExperience +
			amount;
		const level =
			Math.max(
				this
					.level,
				getLevelForExperience(
					totalExperience,
				),
			);
		const gained =
			new BulbroState(
				{
					...this
						.#props,
					materialsAvailable:
						this
							.materialsAvailable +
						amount,
					totalExperience,
					level,
				},
			);
		if (
			level ===
			this
				.level
		)
			return gained;
		// Every level gives +1 max HP (and heals it while alive)
		const leveled =
			gained.withStatSource(
				levelStatSource(
					level,
				),
			);
		if (
			!this.isAlive()
		)
			return leveled;
		return new BulbroState(
			{
				...leveled.#props,
				healthPoints:
					Math.min(
						leveled
							.stats
							.maxHp,
						this
							.healthPoints +
							level -
							this
								.level,
					),
			},
		);
	}

	healByHpRegeneration(
		now: NowTime,
	) {
		if (
			this
				.healthPoints >=
			this
				.stats
				.maxHp
		) {
			return this;
		}

		const timeSinceLastHeal =
			now -
			this
				.healedByHpRegenerationAt;
		if (
			timeSinceLastHeal <
			1_000
		) {
			return this;
		}

		const hpPerSecond =
			getHpRegenerationPerSecond(
				this
					.stats
					.hpRegeneration,
			);
		if (
			hpPerSecond <=
			0
		) {
			return this;
		}

		return {
			type: "bulbroHealed",
			bulbroId:
				this
					.id,
			hp:
				(hpPerSecond *
					timeSinceLastHeal) /
				1000,
			source:
				"regeneration",
		} as BulbroHealedEvent;
	}
	/** Returns this player as a MovableObject for collision logic. */
	toMovableObject(): MovableObject {
		return {
			position:
				this
					.position,
			shape:
				{
					type: "rectangle",
					width:
						BULBRO_SIZE.width,
					height:
						BULBRO_SIZE.height,
				} as Shape,
		};
	}

	/** Apply a single event to this Bulbro state and return the new state. */
	applyEvent(
		event: GameEvent,
	): BulbroState {
		switch (
			event.type
		) {
			case "bulbroInitializedForWave":
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						rerollCount: 0,
						upgradeRerollCount: 0,
						position:
							round(
								event.position,
							),
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
						lastMovedAt:
							event.occurredAt,
						lastHitAt:
							event.occurredAt,
						invulnerableUntil:
							undefined,
						healedByHpRegenerationAt:
							event.occurredAt,
						healthPoints:
							this
								.stats
								.maxHp,
						killedAt:
							undefined,
						weapons:
							this.weapons.map(
								(
									ws,
								) => ({
									...ws,
									lastStrikedAt:
										event.occurredAt,
									shotsFired:
										undefined,
									strike:
										undefined,
								}),
							),
					},
				);

			case "bulbroMoved":
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						position:
							round(
								event.to,
							),
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

			case "bulbroAttacked":
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						weapons:
							applyAttackToWeapons(
								this
									.weapons,
								event,
							),
					},
				);

			case "strikeSwept":
				if (
					event.attackerType !==
						"player" ||
					event.attackerId !==
						this
							.id
				)
					return this;
				return new BulbroState(
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

			case "bulbroReceivedHit":
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				return new BulbroState(
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
						invulnerableUntil:
							event.occurredAt +
							hitInvulnerabilityDuration,
					},
				);

			case "bulbroDied":
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						healthPoints: 0,
						killedAt:
							event.occurredAt,
					},
				);

			case "materialCollected":
				// Co-op shares every pickup: whoever collects it, every Bulbro
				// gets its value in materials and experience. Harvesting does not change
				// pickups; it pays out at the end of the wave (see harvest).
				return this.collectMaterial(
					event.value,
				);

			case "consumableCollected": {
				if (
					event.playerId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						healthPoints:
							Math.min(
								this
									.healthPoints +
									event.hp,
								this
									.stats
									.maxHp,
							),
					},
				);
			}

			case "bulbroHealed": {
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				const healthPoints =
					Math.min(
						this
							.healthPoints +
							event.hp,
						this
							.stats
							.maxHp,
					);
				if (
					event.source ===
					"medicalTurret"
				)
					return this.isAlive()
						? new BulbroState(
								{
									...this
										.#props,
									healthPoints,
								},
							)
						: this;
				return new BulbroState(
					event.source ===
						"lifeSteal"
						? {
								...this
									.#props,
								healthPoints,
								lastLifeStealAt:
									event.occurredAt,
							}
						: {
								...this
									.#props,
								healthPoints,
								healedByHpRegenerationAt:
									event.occurredAt,
							},
				);
			}

			case "shopLocksChanged":
				if (
					event.playerId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						lockedShopOffers:
							event.offers,
					},
				);

			case "shopRerolled":
				if (
					event.playerId !==
					this
						.id
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						materialsAvailable:
							Math.max(
								0,
								this
									.materialsAvailable -
									event.cost,
							),
						rerollCount:
							event.rerollCount,
					},
				);

			case "upgradeSelected": {
				if (
					event.playerId !==
						this
							.id ||
					event.level !==
						this
							.nextLevelUpLevel ||
					event.level >
						this
							.level
				)
					return this;
				const upgrade =
					findUpgradeById(
						event.upgradeId,
					);
				if (
					!upgrade
				)
					return this;
				const upgraded =
					this.withStatSource(
						{
							id: levelUpgradeStatSourceId(
								event.level,
							),
							kind: "upgrade",
							bonuses:
								upgradeBonuses(
									upgrade,
									event.tier,
								),
						},
					);
				return new BulbroState(
					{
						...upgraded.#props,
					},
				);
			}

			case "upgradesRerolled":
				if (
					event.playerId !==
						this
							.id ||
					event.level !==
						this
							.nextLevelUpLevel ||
					this
						.pendingLevelUps ===
						0 ||
					this
						.materialsAvailable <
						event.cost
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						materialsAvailable:
							this
								.materialsAvailable -
							event.cost,
						upgradeRerollCount:
							event.rerollCount,
					},
				);

			case "shopPurchased": {
				if (
					event.playerId !==
						this
							.id ||
					!Number.isFinite(
						event.price,
					) ||
					event.price <
						0 ||
					event.price >
						this
							.materialsAvailable
				)
					return this;
				const item =
					event.itemId !==
					undefined
						? findItemById(
								event.itemId,
							)
						: undefined;
				if (
					event.itemId !==
						undefined &&
					!item
				)
					return this;
				const paid =
					new BulbroState(
						{
							...this
								.#props,
							materialsAvailable:
								Math.max(
									0,
									this
										.materialsAvailable -
										event.price,
								),
						},
					);
				return item
					? paid.withItem(
							item.id,
						)
					: paid;
			}

			case "weaponSold": {
				if (
					event.playerId !==
						this
							.id ||
					!Number.isFinite(
						event.price,
					) ||
					event.price <
						0 ||
					this
						.weapons
						.length <=
						1 ||
					!this.weapons.some(
						(
							w,
						) =>
							w.id ===
							event.weaponId,
					)
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						materialsAvailable:
							this
								.materialsAvailable +
							event.price,
						weapons:
							this.weapons.filter(
								(
									w,
								) =>
									w.id !==
									event.weaponId,
							),
					},
				);
			}

			case "weaponsCombined": {
				if (
					event.playerId !==
					this
						.id
				)
					return this;
				const weapons =
					combineWeapons(
						this
							.weapons,
						event.weaponId,
						event.consumedWeaponId,
					);
				if (
					!weapons
				)
					return this;
				return new BulbroState(
					{
						...this
							.#props,
						weapons,
					},
				);
			}

			default:
				return this;
		}
	}

	/** Apply multiple events to this Bulbro state and return the new state. */
	applyEvents(
		events: GameEvent[],
	): BulbroState {
		return events.reduce(
			(
				state: BulbroState,
				event,
			) =>
				state.applyEvent(
					event,
				),
			this,
		);
	}
}

export const characterStatSourceId =
	"character";
export const harvestingGrowthStatSourceId =
	"harvesting-growth";
export const levelStatSourceId =
	"level";

/** +1 max HP per level reached. */
export function levelStatSource(
	level: number,
): StatSource {
	return {
		id: levelStatSourceId,
		kind: "level",
		bonuses:
			{
				maxHp:
					level,
			},
	};
}

/**
 * Spawns a new BulbroState from a character definition.
 * The level is at least the one reached with the given experience.
 */
export function spawnBulbro(
	id: string,
	_type: FaceType,
	position: Position,
	level: number,
	experience: number,
	character: Bulbro,
): BulbroState {
	const weapons: WeaponState[] =
		character.weapons.map(
			toWeaponState,
		);
	const startLevel =
		Math.max(
			level,
			getLevelForExperience(
				experience,
			),
		);
	const statSources: StatSource[] =
		[
			{
				id: characterStatSourceId,
				kind: "character",
				bonuses:
					character.statBonuses,
			},
			...(startLevel >
			0
				? [
						levelStatSource(
							startLevel,
						),
					]
				: []),
		];
	const stats =
		computeStats(
			statSources,
		);
	return new BulbroState(
		{
			id,
			type: character
				.style
				.faceType,
			characterId:
				character.id,
			level:
				startLevel,
			totalExperience:
				experience,
			position,
			healthPoints:
				stats.maxHp,
			stats,
			statSources,
			weapons,
			items:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			materialsAvailable: 0,
			lastDirection:
				zeroPoint(),
			lastHorizontalDirection: 1,
			rerollCount: 0,
		},
	);
}

/**
 * Restores a Bulbro received from another player. Item stat sources are rebuilt
 * from the owned items and stats are recomputed, so a remote Bulbro always has
 * the stats its inventory gives on this client. Unknown items are dropped.
 */
export function restoreBulbroState(
	props: ConstructorParameters<
		typeof BulbroState
	>[0],
): BulbroState {
	const items =
		(
			props.items ??
			[]
		).flatMap(
			(
				id,
			) => {
				const item =
					findItemById(
						id,
					);
				return item
					? [
							item,
						]
					: [];
			},
		);
	const statSources: StatSource[] =
		[
			...props.statSources.filter(
				(
					source,
				) =>
					source.kind !==
					"item",
			),
			...items.map(
				(
					item,
					index,
				): StatSource => ({
					id: itemStatSourceId(
						item.id,
						index,
					),
					kind: "item",
					bonuses:
						item.bonuses,
				}),
			),
		];
	const stats =
		computeStats(
			statSources,
		);
	return new BulbroState(
		{
			...props,
			items:
				items.map(
					(
						item,
					) =>
						item.id,
				),
			statSources,
			stats,
			healthPoints:
				Math.min(
					props.healthPoints,
					stats.maxHp,
				),
		},
	);
}

import type { EnemyState } from "@/enemy";
import type {
	AttackDescription,
	BulbroAttackedEvent,
	BulbroCollectedMaterialEvent,
	BulbroDiedEvent,
	BulbroEvent,
	BulbroHealedEvent,
	BulbroInitializedForWaveEvent,
	BulbroMovedEvent,
	BulbroReceivedHitEvent,
	GameEvent,
	MaterialCollectedEvent,
} from "@/game-events/GameEvents";
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
} from "../game-formulas";
import {
	addition,
	type Direction,
	direction,
	isEqual,
	type Position,
	round,
	type Size,
	subtraction,
	zeroPoint,
} from "../geometry";
import {
	type MovableObject,
	Movement,
	type Shape,
} from "../movement/Movement";
import type { Material } from "../object";
import {
	findUpgradeById,
	levelUpgradeStatSourceId,
	upgradeBonuses,
} from "../upgrades/Upgrades";
import type {
	WaveState,
	WeaponState,
} from "../waveState";
import { toWeaponState } from "../weapon";
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

type BulbroStateProperties =
	{
		readonly id: string;
		readonly type: FaceType;
		readonly position: Position;
		readonly level: number;
		readonly totalExperience: number;
		readonly materialsAvailable: number;
		readonly healthPoints: number;
		readonly stats: Stats;
		/** Where the stat points come from; `stats` is computed from them */
		readonly statSources: StatSource[];
		/** When life steal healed the Bulbro the last time */
		readonly lastLifeStealAt?: number;
		readonly weapons: WeaponState[];
		readonly lastMovedAt: number;
		readonly lastHitAt: number;
		readonly healedByHpRegenerationAt: number;
		readonly killedAt?: number;
		readonly lastDirection: Direction;
		readonly lastHorizontalDirection: number;
		readonly rerollCount: number;
		/** Level-up upgrade re-rolls done for the current level */
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
	get healthPoints() {
		return this
			.#props
			.healthPoints;
	}
	get stats() {
		return this
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

	get rerollCount() {
		return this
			.#props
			.rerollCount;
	}

	constructor(
		props: BulbroStateProperties,
	) {
		this.#props =
			props;
	}

	toJSON() {
		return {
			...this
				.#props,
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
		now: NowTime,
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
		now: NowTime,
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
		deltaTime: DeltaTime,
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
					weapon
						.statsBonus
						.cooldown ??
					1;
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
	 * or nothing when the hit was dodged. Armor reduces the damage.
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

	/** Returns a material collection event for the Bulbro. */
	takeMaterial(
		material: Material,
	): BulbroCollectedMaterialEvent {
		return {
			type: "bulbroCollectedMaterial",
			bulbroId:
				this
					.id,
			materialId:
				material.id,
		};
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

			case "bulbroCollectedMaterial":
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				// Note: We'd need the material value to update experience/materials
				// For now, just return the same state as we don't have the full material object
				return this;

			case "materialCollected":
				// Co-op shares every pickup: whoever collects it, every Bulbro
				// gets a material and experience. Harvesting does not change
				// pickups; it pays out at the end of the wave (see harvest).
				return this.gainMaterials(
					1,
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
						upgradeRerollCount: 0,
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

			case "shopPurchased":
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
									event.price,
							),
					},
				);

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
	type: FaceType,
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

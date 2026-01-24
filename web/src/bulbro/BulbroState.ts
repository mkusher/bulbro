import type { EnemyState } from "@/enemy";
import type {
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
	calculateStats,
	calculateWeaponPosition,
	findClosestEnemyInRange,
	getHpRegenerationPerSecond,
	isInRange,
	isWeaponReadyToShoot,
	shoot,
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
import type { FaceType } from "./Sprite";

type BulbroStateProperties =
	{
		readonly id: string;
		readonly type: FaceType;
		readonly position: Position;
		readonly speed: number;
		readonly level: number;
		readonly totalExperience: number;
		readonly materialsAvailable: number;
		readonly healthPoints: number;
		readonly stats: Stats;
		readonly weapons: WeaponState[];
		readonly lastMovedAt: number;
		readonly lastHitAt: number;
		readonly healedByHpRegenerationAt: number;
		readonly killedAt?: number;
		readonly lastDirection: Direction;
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
			.speed;
	}
	get level() {
		return this
			.#props
			.level;
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
				const reloadTime =
					weapon
						.statsBonus
						.attackSpeed ??
					0;
				const attackSpeed =
					this
						.stats
						.attackSpeed;
				if (
					isWeaponReadyToShoot(
						weapon.lastStrikedAt,
						reloadTime,
						attackSpeed,
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
						target &&
						isInRange(
							this,
							target,
							weapon,
						)
					) {
						const shot =
							shoot(
								this,
								"player",
								weapon,
								target.position,
							);

						// Generate attack event using player's hit method
						const attackEvent =
							this.hit(
								weapon.id,
								target.id,
								shot,
							);
						baseEvents.push(
							attackEvent,
						);

						// Generate shot fired event
						const shotEvent =
							{
								type: "shot" as const,
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
								calculateWeaponPosition(
									weapon,
									index,
									this
										.weapons
										.length,
								);
							const directionMultiplier =
								this
									.lastDirection
									.x <
								0
									? -1
									: 1;
							const position =
								{
									x:
										this
											.position
											.x +
										offset.x *
											directionMultiplier,
									y:
										this
											.position
											.y +
										offset.y -
										BULBRO_SIZE.height /
											2,
								};
							const aimingDirection =
								direction(
									position,
									target.position,
								);
							const reversed =
								{
									x:
										aimingDirection.x *
										directionMultiplier,
									y:
										-aimingDirection.y,
								};
							return {
								...weapon,
								aimingDirection:
									reversed,
							};
						},
					),
			},
		);
	}

	/** Returns an attack event for the Bulbro. */
	hit(
		weaponId: string,
		targetId?: string,
		shot?: any,
	): BulbroAttackedEvent {
		return {
			type: "bulbroAttacked",
			bulbroId:
				this
					.id,
			weaponId,
			targetId,
			shot,
		};
	}

	/** Returns a received hit event for the Bulbro. */
	beHit(
		damage: number,
		now: NowTime,
	):
		| BulbroReceivedHitEvent
		| BulbroDiedEvent {
		const newHealthPoints =
			Math.max(
				this
					.healthPoints -
					damage,
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
			damage,
		};
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

		const timeSinceLastHit =
			now -
			this
				.lastHitAt;

		const hpPerSecond =
			getHpRegenerationPerSecond(
				this
					.stats
					.hpRegeneration,
			);

		return {
			type: "bulbroHealed",
			bulbroId:
				this
					.id,
			hp:
				(hpPerSecond *
					Math.min(
						timeSinceLastHeal,
						timeSinceLastHit,
					)) /
				1000,
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
					},
				);

			case "bulbroAttacked": {
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				const weapons =
					this.weapons.map(
						(
							ws,
						) =>
							ws.id ===
							event.weaponId
								? {
										...ws,
										lastStrikedAt:
											event.occurredAt,
									}
								: ws,
					);
				return new BulbroState(
					{
						...this
							.#props,
						weapons,
					},
				);
			}

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
				// Update materials count when material is collected
				return new BulbroState(
					{
						...this
							.#props,
						materialsAvailable:
							this
								.materialsAvailable +
							1,
						totalExperience:
							this
								.totalExperience +
							1,
					},
				);

			case "bulbroHealed": {
				if (
					event.bulbroId !==
					this
						.id
				)
					return this;
				const newHealth =
					Math.min(
						this
							.healthPoints +
							event.hp,
						this
							.stats
							.maxHp,
					);
				return new BulbroState(
					{
						...this
							.#props,
						healthPoints:
							newHealth,
						healedByHpRegenerationAt:
							event.occurredAt,
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

/**
 * Spawns a new BulbroState from a character definition.
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
	return new BulbroState(
		{
			id,
			type: character
				.style
				.faceType,
			level,
			totalExperience:
				experience,
			position,
			speed:
				calculateStats(
					character.statBonuses,
				)
					.speed,
			healthPoints:
				calculateStats(
					character.statBonuses,
				)
					.maxHp,
			stats:
				calculateStats(
					character.statBonuses,
				),
			weapons,
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			materialsAvailable: 0,
			lastDirection:
				zeroPoint(),
		},
	);
}

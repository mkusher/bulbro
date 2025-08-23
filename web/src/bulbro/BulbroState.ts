import {
	direction,
	isEqual,
	round,
	zeroPoint,
	type Direction,
	type Position,
	type Size,
} from "../geometry";
import type { Material } from "../object";
import type { WeaponState } from "../currentState";
import type { Bulbro, Stats } from "./BulbroCharacter";
import { Movement, type MovableObject, type Shape } from "../movement/Movement";
import { BULBRO_SIZE } from "./index";
import { toWeaponState } from "../weapon";
import type { SpriteType } from "./Sprite";
import { getHpRegenerationPerSecond } from "../game-formulas";
import type {
	BulbroHealedEvent,
	BulbroMovedEvent,
	BulbroAttackedEvent,
	BulbroReceivedHitEvent,
	BulbroCollectedMaterialEvent,
	BulbroDiedEvent,
	MaterialCollectedEvent,
	GameEvent,
} from "@/game-events/GameEvents";

type BulbroStateProperties = {
	readonly id: string;
	readonly type: SpriteType;
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
export class BulbroState implements BulbroStateProperties {
	#props: BulbroStateProperties;

	get id() {
		return this.#props.id;
	}
	get type() {
		return this.#props.type;
	}
	get position() {
		return this.#props.position;
	}
	get speed() {
		return this.#props.speed;
	}
	get level() {
		return this.#props.level;
	}
	get totalExperience() {
		return this.#props.totalExperience;
	}
	get materialsAvailable() {
		return this.#props.materialsAvailable;
	}
	get healthPoints() {
		return this.#props.healthPoints;
	}
	get stats() {
		return this.#props.stats;
	}
	get weapons() {
		return this.#props.weapons;
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
	get lastDirection() {
		return this.#props.lastDirection;
	}

	get healedByHpRegenerationAt() {
		return this.#props.healedByHpRegenerationAt;
	}

	constructor(props: BulbroStateProperties) {
		this.#props = props;
	}

	toJSON() {
		return { ...this.#props };
	}

	useWeapons(weapons: WeaponState[]) {
		return new BulbroState({
			...this.#props,
			weapons,
		});
	}

	isAlive() {
		return this.healthPoints > 0;
	}

	/** Returns a move event for the Bulbro. */
	move(
		direction: Direction,
		mapSize: Size,
		obstacles: MovableObject[],
		deltaTime: number,
	): BulbroMovedEvent | undefined {
		const mover = new Movement(this.toMovableObject(), mapSize, obstacles);
		const to = mover.getPositionAfterMove(direction, this.speed, deltaTime);
		if (isEqual(this.position, to)) {
			return;
		}
		return {
			type: "bulbroMoved",
			bulbroId: this.id,
			from: this.position,
			to,
			direction,
		};
	}

	moveFromDirection(
		position: Position,
		direction: Direction,
		now: number,
	): BulbroMovedEvent {
		const roundedPosition = round(position);
		return {
			type: "bulbroMoved",
			bulbroId: this.id,
			from: this.position,
			to: roundedPosition,
			direction: isEqual(direction, zeroPoint()) ? zeroPoint() : direction,
		};
	}

	/** Returns an attack event for the Bulbro. */
	hit(weaponId: string, targetId?: string, shot?: any): BulbroAttackedEvent {
		return {
			type: "bulbroAttacked",
			bulbroId: this.id,
			weaponId,
			targetId,
			shot,
		};
	}

	/** Returns a received hit event for the Bulbro. */
	beHit(damage: number, now: number): BulbroReceivedHitEvent | BulbroDiedEvent {
		const newHealthPoints = Math.max(this.healthPoints - damage, 0);

		if (newHealthPoints <= 0 && this.healthPoints > 0) {
			// Bulbro dies
			return {
				type: "bulbroDied",
				bulbroId: this.id,
				position: { x: this.position.x, y: this.position.y },
			};
		}

		// Bulbro takes damage but survives
		return {
			type: "bulbroReceivedHit",
			bulbroId: this.id,
			damage,
		};
	}

	/** Returns a material collection event for the Bulbro. */
	takeMaterial(material: Material): BulbroCollectedMaterialEvent {
		return {
			type: "bulbroCollectedMaterial",
			bulbroId: this.id,
			materialId: material.id,
		};
	}

	healByHpRegeneration(now: number) {
		if (this.healthPoints >= this.stats.maxHp) {
			return this;
		}

		const timeSinceLastHeal = now - this.healedByHpRegenerationAt;
		if (timeSinceLastHeal < 1_000) {
			return this;
		}

		const timeSinceLastHit = now - this.lastHitAt;

		const hpPerSecond = getHpRegenerationPerSecond(this.stats.hpRegeneration);

		return {
			type: "bulbroHealed",
			bulbroId: this.id,
			hp: (hpPerSecond * Math.min(timeSinceLastHeal, timeSinceLastHit)) / 1000,
		} as BulbroHealedEvent;
	}
	/** Returns this player as a MovableObject for collision logic. */
	toMovableObject(): MovableObject {
		return {
			position: this.position,
			shape: {
				type: "rectangle",
				width: BULBRO_SIZE.width,
				height: BULBRO_SIZE.height,
			} as Shape,
		};
	}

	/** Apply a single event to this Bulbro state and return the new state. */
	applyEvent(event: GameEvent): BulbroState {
		switch (event.type) {
			case "bulbroMoved":
				if (event.bulbroId !== this.id) return this;
				return new BulbroState({
					...this.#props,
					position: round(event.to),
					lastMovedAt: Date.now(),
					lastDirection: event.direction,
				});

			case "bulbroAttacked":
				if (event.bulbroId !== this.id) return this;
				const weapons = this.weapons.map((ws) =>
					ws.id === event.weaponId
						? { ...ws, lastStrikedAt: event.occurredAt }
						: ws,
				);
				return new BulbroState({
					...this.#props,
					weapons,
				});

			case "bulbroReceivedHit":
				if (event.bulbroId !== this.id) return this;
				return new BulbroState({
					...this.#props,
					healthPoints: Math.max(this.healthPoints - event.damage, 0),
					lastHitAt: Date.now(),
				});

			case "bulbroDied":
				if (event.bulbroId !== this.id) return this;
				return new BulbroState({
					...this.#props,
					healthPoints: 0,
					killedAt: Date.now(),
				});

			case "bulbroCollectedMaterial":
				if (event.bulbroId !== this.id) return this;
				// Note: We'd need the material value to update experience/materials
				// For now, just return the same state as we don't have the full material object
				return this;

			case "materialCollected":
				// Update materials count when material is collected
				return new BulbroState({
					...this.#props,
					materialsAvailable: this.materialsAvailable + 1,
					totalExperience: this.totalExperience + 1,
				});

			case "bulbroHealed":
				if (event.bulbroId !== this.id) return this;
				const newHealth = Math.min(
					this.healthPoints + event.hp,
					this.stats.maxHp,
				);
				return new BulbroState({
					...this.#props,
					healthPoints: newHealth,
					healedByHpRegenerationAt: Date.now(),
				});

			default:
				return this;
		}
	}

	/** Apply multiple events to this Bulbro state and return the new state. */
	applyEvents(events: GameEvent[]): BulbroState {
		return events.reduce(
			(state: BulbroState, event) => state.applyEvent(event),
			this,
		);
	}
}

/**
 * Spawns a new BulbroState from a character definition.
 */
export function spawnBulbro(
	id: string,
	type: SpriteType,
	position: Position,
	level: number,
	experience: number,
	character: Bulbro,
): BulbroState {
	const now = Date.now();
	const weapons: WeaponState[] = character.weapons.map(toWeaponState);
	return new BulbroState({
		id,
		type,
		level,
		totalExperience: experience,
		position,
		speed: character.baseStats.speed,
		healthPoints: character.baseStats.maxHp,
		stats: { ...character.baseStats },
		weapons,
		lastMovedAt: now,
		lastHitAt: 0,
		healedByHpRegenerationAt: now,
		materialsAvailable: 0,
		lastDirection: zeroPoint(),
	});
}

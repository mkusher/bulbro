import { type Direction, type Position } from "../geometry";
import type { Material } from "../object";
import type { WeaponState } from "../currentState";
import type { Bulbro, Stats } from "./BulbroCharacter";
import type { MovableObject, Shape } from "../movement/Movement";
import { BULBRO_SIZE } from "./index";
import { toWeaponState } from "../weapon";
import type { SpriteType } from "./Sprite";
import { getHpRegenerationPerSecond } from "../game-formulas";

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
	readonly lastDirection?: Direction;
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

	/** Returns a new state with the Bulbro moved to a new position. */
	move(position: Position, now: number): BulbroState {
		return new BulbroState({
			...this.#props,
			position,
			lastMovedAt: now,
			lastDirection: {
				x: position.x - this.position.x || this.lastDirection?.x || 0,
				y: position.y - this.position.y || this.lastDirection?.y || 0,
			},
		});
	}

	/** Returns a new state with updated weapon strike timestamp for a hit action. */
	hit(weaponId: string, now: number): BulbroState {
		const weapons = this.weapons.map((ws) =>
			ws.id === weaponId ? { ...ws, lastStrikedAt: now } : ws,
		);
		return new BulbroState({
			...this.#props,
			weapons,
		});
	}

	/** Returns a new state after taking damage. */
	beHit(damage: number, now: number): BulbroState {
		return new BulbroState({
			...this.#props,
			healthPoints: this.healthPoints - damage,
			lastHitAt: now,
		});
	}

	takeMaterial(material: Material) {
		return new BulbroState({
			...this.#props,
			totalExperience: this.#props.totalExperience + material.value,
			materialsAvailable: this.#props.materialsAvailable + material.value,
		});
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

		return new BulbroState({
			...this.#props,
			healedByHpRegenerationAt: now,
			healthPoints:
				this.healthPoints +
				(hpPerSecond * Math.min(timeSinceLastHeal, timeSinceLastHit)) / 1000,
		});
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
	});
}

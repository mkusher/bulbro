import type { Position } from "../geometry";
import type { WeaponState } from "../currentState";
import type { Bulbro, Stats } from "./BulbroCharacter";
import type { MovableObject, Shape } from "../movement/Movement";
import { BULBRO_SIZE } from "./index";
import { toWeaponState } from "../weapon";
import type { SpriteType } from "./Sprite";

/**
 * Immutable runtime state of a single Bulbro (player).
 */
export class BulbroState {
	readonly id: string;
	readonly type: SpriteType;
	readonly position: Position;
	readonly speed: number;
	readonly healthPoints: number;
	readonly stats: Stats;
	readonly weapons: WeaponState[];
	readonly lastMovedAt: Date;
	readonly lastHitAt: Date;
	readonly killedAt?: Date;

	constructor(
		id: string,
		type: SpriteType,
		position: Position,
		speed: number,
		healthPoints: number,
		stats: Stats,
		weapons: WeaponState[],
		lastMovedAt: Date,
		lastHitAt: Date,
	) {
		this.id = id;
		this.type = type;
		this.position = position;
		this.speed = speed;
		this.healthPoints = healthPoints;
		this.stats = stats;
		this.weapons = weapons;
		this.lastMovedAt = lastMovedAt;
		this.lastHitAt = lastHitAt;
	}

	useWeapons(weapons: WeaponState[]) {
		return new BulbroState(
			this.id,
			this.type,
			this.position,
			this.speed,
			this.healthPoints,
			this.stats,
			weapons,
			this.lastMovedAt,
			this.lastHitAt,
		);
	}

	/** Returns a new state with the Bulbro moved to a new position. */
	move(position: Position, now: number): BulbroState {
		return new BulbroState(
			this.id,
			this.type,
			position,
			this.speed,
			this.healthPoints,
			this.stats,
			this.weapons,
			new Date(now),
			this.lastHitAt,
		);
	}

	/** Returns a new state with updated weapon strike timestamp for a hit action. */
	hit(weaponId: string, now: number): BulbroState {
		const weapons = this.weapons.map((ws) =>
			ws.id === weaponId ? { ...ws, lastStrikedAt: new Date(now) } : ws,
		);
		return new BulbroState(
			this.id,
			this.type,
			this.position,
			this.speed,
			this.healthPoints,
			this.stats,
			weapons,
			this.lastMovedAt,
			this.lastHitAt,
		);
	}

	/** Returns a new state after taking damage. */
	beHit(damage: number, now: number): BulbroState {
		return new BulbroState(
			this.id,
			this.type,
			this.position,
			this.speed,
			this.healthPoints - damage,
			this.stats,
			this.weapons,
			this.lastMovedAt,
			new Date(now),
		);
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
	character: Bulbro,
): BulbroState {
	const weapons: WeaponState[] = character.weapons.map(toWeaponState);
	return new BulbroState(
		id,
		type,
		position,
		character.baseStats.speed,
		character.baseStats.maxHp,
		character.baseStats,
		weapons,
		new Date(),
		new Date(0),
	);
}

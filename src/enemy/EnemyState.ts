import type { Position } from "../geometry";
import type { EnemyCharacter } from "./EnemyCharacter";
import type { WeaponState } from "../currentState";
import type { MovableObject, Shape } from "../movement/Movement";
import { ENEMY_SIZE } from "./index";

export type EnemyType = "orc" | "slime";

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
};

export class EnemyState {
	readonly id: string;
	readonly type: EnemyType;
	readonly position: Position;
	readonly healthPoints: number;
	readonly weapons: WeaponState[];
	readonly stats: EnemyStats;
	readonly lastMovedAt: Date;
	readonly lastHitAt: Date;
	readonly killedAt?: Date;

	constructor(
		id: string,
		type: EnemyType,
		position: Position,
		healthPoints: number,
		weapons: WeaponState[],
		stats: EnemyStats,
		lastMovedAt: Date,
		lastHitAt: Date,
		killedAt?: Date,
	) {
		this.id = id;
		this.type = type;
		this.position = position;
		this.healthPoints = healthPoints;
		this.weapons = weapons;
		this.stats = stats;
		this.lastMovedAt = lastMovedAt;
		this.lastHitAt = lastHitAt;
		this.killedAt = killedAt;
	}

	/** Returns this enemy as a MovableObject for collision logic. */
	toMovableObject(): MovableObject {
		return {
			position: this.position,
			shape: {
				type: "rectangle",
				width: ENEMY_SIZE.width,
				height: ENEMY_SIZE.height,
			} as Shape,
		};
	}

	/** Returns a new state with the enemy moved to a new position. */
	move(position: Position, now: number): EnemyState {
		return new EnemyState(
			this.id,
			this.type,
			position,
			this.healthPoints,
			this.weapons,
			this.stats,
			new Date(now),
			this.lastHitAt,
			this.killedAt,
		);
	}

	/** Returns a new state with updated weapon strike timestamp for a hit action. */
	hit(weaponId: string, now: number): EnemyState {
		const weapons = this.weapons.map((ws) =>
			ws.id === weaponId ? { ...ws, lastStrikedAt: new Date(now) } : ws,
		);
		return new EnemyState(
			this.id,
			this.type,
			this.position,
			this.healthPoints,
			weapons,
			this.stats,
			this.lastMovedAt,
			this.lastHitAt,
			this.killedAt,
		);
	}

	/** Returns a new state after taking damage; may mark as killed. */
	beHit(damage: number, now: number): EnemyState {
		const healthPoints = this.healthPoints - damage;
		const killedAt =
			healthPoints <= 0 && !this.killedAt ? new Date(now) : this.killedAt;
		return new EnemyState(
			this.id,
			this.type,
			this.position,
			healthPoints,
			this.weapons,
			this.stats,
			this.lastMovedAt,
			new Date(now),
			killedAt,
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
		lastStrikedAt: new Date(0),
		statsBonus: w.statsBonus,
		shotSpeed: w.shotSpeed,
	}));
	return new EnemyState(
		id,
		character.sprite,
		position,
		character.stats.maxHp,
		weapons,
		character.stats,
		new Date(),
		new Date(0),
	);
}

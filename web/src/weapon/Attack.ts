import { BULBRO_BODY_SIZE } from "@/bulbro";
import type { BulbroState } from "@/bulbro/BulbroState";
import { enemyBodySize } from "@/enemy/EnemyBody";
import type { EnemyState } from "@/enemy/EnemyState";
import type {
	AttackDescription,
	StrikeSweptEvent,
} from "@/game-events/GameEvents";
import {
	calculateAttackDamage,
	calculateAttackKnockback,
	calculateAttackRange,
	findClosestPlayerInRange,
	getAttackCooldown,
	isInRange,
	shoot,
} from "@/game-formulas";
import {
	type Direction,
	distance,
	ellipseRadiusToward,
	type Position,
	subtraction,
} from "@/geometry";
import type { ShotState } from "@/shot/ShotState";
import type { NowTime } from "@/time";
import { getWeaponByType } from "@/weapon";
import {
	createStrike,
	isStriking,
	type MeleeStrike,
} from "./MeleeStrike";
import type { WeaponState } from "./WeaponState";

export type AttackerType =
	| "player"
	| "enemy";

/** What a single use of a weapon produced: a flying shot or a melee strike. */
export type Attack =
	| {
			type: "shot";
			shot: ShotState;
	  }
	| {
			type: "strike";
			strike: MeleeStrike;
	  };

/** How far past body contact an enemy's touch attack still connects (about the sprite outlines). */
export const TOUCH_MARGIN = 4;

/**
 * Enemies' melee weapons hit on touch: the strike reaches from the enemy's
 * center to the edge of its drawn body (plus the weapon's own range bonus,
 * 0 by default), ignoring the enemy's range stat. Drawn bodies are used
 * instead of the larger collision hitboxes so that bodies visibly touch.
 */
function isTouchAttack(
	attackerType: AttackerType,
	weapon: WeaponState,
) {
	return (
		attackerType ===
			"enemy" &&
		getWeaponByType(
			weapon.type,
		)
			.attack
			.type !==
			"shot"
	);
}

/** Reach of an enemy's touch strike from its center towards `direction`. */
export function touchReach(
	enemy: Pick<
		EnemyState,
		"type"
	>,
	weapon: WeaponState,
	direction: Direction,
) {
	return (
		ellipseRadiusToward(
			enemyBodySize(
				enemy.type,
			),
			direction,
		) +
		TOUCH_MARGIN +
		(weapon
			.statsBonus
			.range ??
			0)
	);
}

/** Whether the enemy's weapon can reach the player from where they stand. */
export function isPlayerInEnemyAttackRange(
	enemy: EnemyState,
	weapon: WeaponState,
	player: BulbroState,
) {
	if (
		!isTouchAttack(
			"enemy",
			weapon,
		)
	)
		return isInRange(
			enemy,
			player,
			weapon,
		);
	const towardsPlayer =
		subtraction(
			player.position,
			enemy.position,
		);
	return (
		distance(
			enemy.position,
			player.position,
		) <=
		touchReach(
			enemy,
			weapon,
			towardsPlayer,
		) +
			ellipseRadiusToward(
				BULBRO_BODY_SIZE,
				towardsPlayer,
			)
	);
}

/** The closest alive player the enemy's weapon can reach. */
export function findClosestPlayerInEnemyAttackRange(
	enemy: EnemyState,
	weapon: WeaponState,
	players: BulbroState[],
):
	| BulbroState
	| undefined {
	if (
		!isTouchAttack(
			"enemy",
			weapon,
		)
	) {
		const target =
			findClosestPlayerInRange(
				enemy,
				weapon,
				players,
			);
		return target &&
			isInRange(
				enemy,
				target,
				weapon,
			)
			? target
			: undefined;
	}
	let closest:
		| BulbroState
		| undefined;
	let closestDistance =
		Infinity;
	for (const player of players) {
		if (
			!player.isAlive() ||
			!isPlayerInEnemyAttackRange(
				enemy,
				weapon,
				player,
			)
		)
			continue;
		const d =
			distance(
				enemy.position,
				player.position,
			);
		if (
			d <
			closestDistance
		) {
			closest =
				player;
			closestDistance =
				d;
		}
	}
	return closest;
}

/**
 * Attacks with the weapon at `aimAt` according to the weapon's attack config.
 * Returns undefined when the weapon can't attack yet (a strike still in progress).
 */
export function attack(
	attacker:
		| BulbroState
		| EnemyState,
	attackerType: AttackerType,
	weapon: WeaponState,
	target: {
		id: string;
		aimAt: Position;
	},
	now: NowTime,
):
	| Attack
	| undefined {
	const config =
		getWeaponByType(
			weapon.type,
		).attack;
	if (
		config.type ===
		"shot"
	) {
		return {
			type: "shot",
			shot: shoot(
				attacker,
				attackerType,
				weapon,
				target.aimAt,
			),
		};
	}
	if (
		isStriking(
			weapon.strike,
			now,
		)
	)
		return undefined;
	return {
		type: "strike",
		strike:
			createStrike(
				config,
				{
					now,
					pivot:
						attacker.position,
					target:
						target.aimAt,
					targetId:
						target.id,
					reach:
						isTouchAttack(
							attackerType,
							weapon,
						)
							? touchReach(
									// Only enemies make touch attacks
									attacker as EnemyState,
									weapon,
									subtraction(
										target.aimAt,
										attacker.position,
									),
								)
							: calculateAttackRange(
									attacker,
									weapon,
								),
					damage:
						calculateAttackDamage(
							attacker,
							weapon,
						),
					knockback:
						calculateAttackKnockback(
							attacker,
							weapon,
						),
					cooldown:
						getAttackCooldown(
							weapon
								.statsBonus
								.attackSpeed ??
								1,
							attacker
								.stats
								.attackSpeed ??
								0,
						),
					previous:
						weapon.strike,
				},
			),
	};
}

/** Fields describing the attack on `bulbroAttacked` / `enemyAttacked` events. */
export function attackDescription(
	weaponId: string,
	targetId: string,
	performed: Attack,
): AttackDescription {
	return performed.type ===
		"shot"
		? {
				weaponId,
				targetId,
				shot: performed.shot,
			}
		: {
				weaponId,
				targetId,
				strike:
					performed.strike,
			};
}

/** Extra events an attack produces besides the attacker's own attack event. */
export function attackSideEvents(
	weaponId: string,
	performed: Attack,
) {
	return performed.type ===
		"shot"
		? [
				{
					type: "shot" as const,
					shot: performed.shot,
					weaponId,
				},
			]
		: [];
}

/** Records how far a weapon's strike was swept and which targets it touched. */
export function strikeSwept(
	attackerType: AttackerType,
	attackerId: string,
	weaponId: string,
	sweptUntil: number,
	targetIds: string[],
): StrikeSweptEvent {
	return {
		type: "strikeSwept",
		attackerType,
		attackerId,
		weaponId,
		sweptUntil,
		targetIds,
	};
}

/** Applies an attack event to the attacker's weapons. */
export function applyAttackToWeapons(
	weapons: WeaponState[],
	event: AttackDescription & {
		occurredAt: number;
	},
): WeaponState[] {
	return weapons.map(
		(
			ws,
		) =>
			ws.id ===
			event.weaponId
				? {
						...ws,
						lastStrikedAt:
							event.occurredAt,
						...(event.strike
							? {
									strike:
										event.strike,
								}
							: {}),
					}
				: ws,
	);
}

/** Applies a strike progress event to the attacker's weapons. */
export function applyStrikeSweptToWeapons(
	weapons: WeaponState[],
	event: StrikeSweptEvent,
): WeaponState[] {
	return weapons.map(
		(
			ws,
		) =>
			ws.id ===
				event.weaponId &&
			ws.strike
				? {
						...ws,
						strike:
							{
								...ws.strike,
								sweptUntil:
									event.sweptUntil,
								hitTargetIds:
									[
										...ws
											.strike
											.hitTargetIds,
										...event.targetIds,
									],
							},
					}
				: ws,
	);
}

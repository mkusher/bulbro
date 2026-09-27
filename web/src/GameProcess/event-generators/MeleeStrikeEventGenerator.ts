import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	type AttackerType,
	strikeSwept,
} from "@/weapon/Attack";
import {
	findStrikeHits,
	type MeleeStrike,
	type StrikeTarget,
	strikeKnockbackDirection,
} from "@/weapon/MeleeStrike";
import type { WeaponState } from "@/weapon/WeaponState";
import { BULBRO_BODY_SIZE } from "../../bulbro";
import { ENEMY_SIZE } from "../../enemy";
import type { GameEventInternal } from "../../game-events/GameEvents";
import {
	ellipseRadiusToward,
	type Position,
	type Size,
	subtraction,
} from "../../geometry";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

type Striker =
	{
		id: string;
		position: Position;
		weapons: WeaponState[];
	};

/**
 * Sweeps the blades of in-progress melee strikes from where they were left on
 * the previous tick up to now and hits every target the blade touched.
 * Players' strikes hit enemies, enemies' strikes hit players.
 */
export class MeleeStrikeEventGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		_deltaTime: DeltaTime,
		now: NowTime,
	): GameEventInternal[] {
		const events: GameEventInternal[] =
			[];
		const strikingPlayers =
			state.players.filter(
				(
					p,
				) =>
					p.isAlive() &&
					hasActiveStrike(
						p,
						now,
					),
			);
		const strikingEnemies =
			state.enemies.filter(
				(
					e,
				) =>
					!e.killedAt &&
					hasActiveStrike(
						e,
						now,
					),
			);

		if (
			strikingPlayers.length >
			0
		) {
			const enemies =
				state.enemies.filter(
					(
						e,
					) =>
						!e.killedAt,
				);
			for (const player of strikingPlayers) {
				sweep(
					player,
					"player",
					enemies,
					ENEMY_SIZE,
					now,
					events,
					(
						enemy,
						strike,
					) =>
						enemy.beHit(
							strike,
							now,
							{
								strength:
									strike.knockback,
								direction:
									strikeKnockbackDirection(
										strike,
										player.position,
										enemy.position,
										now,
									),
							},
						),
				);
			}
		}

		if (
			strikingEnemies.length >
			0
		) {
			const players =
				state.players.filter(
					(
						p,
					) =>
						p.isAlive(),
				);
			for (const enemy of strikingEnemies) {
				sweep(
					enemy,
					"enemy",
					players,
					// Enemy strikes are touch attacks sized by drawn bodies
					BULBRO_BODY_SIZE,
					now,
					events,
					(
						player,
						strike,
					) =>
						player.beHit(
							strike.damage,
							now,
						),
				);
			}
		}

		return events;
	}
}

// Strikes are swept from where the previous tick stopped, so long frames
// (or capped delta times) never skip a part of the strike.
function isUnswept(
	strike: MeleeStrike,
	now: number,
) {
	return (
		now >
			strike.sweptUntil &&
		strike.sweptUntil <
			strike.startedAt +
				strike.duration
	);
}

/** Whether any weapon of the striker still has a part of its strike to sweep. */
function hasActiveStrike(
	striker: Striker,
	now: number,
) {
	return striker.weapons.some(
		(
			w,
		) =>
			w.strike &&
			isUnswept(
				w.strike,
				now,
			),
	);
}

function sweep<
	T extends
		StrikeTarget,
>(
	striker: Striker,
	attackerType: AttackerType,
	targets: T[],
	targetSize: Size,
	now: number,
	events: GameEventInternal[],
	hit: (
		target: T,
		strike: MeleeStrike,
	) => GameEventInternal,
) {
	for (const weapon of striker.weapons) {
		const strike =
			weapon.strike;
		if (
			!strike ||
			!isUnswept(
				strike,
				now,
			)
		)
			continue;
		const hits =
			findStrikeHits(
				strike,
				striker.position,
				targets,
				// Bodies are ellipses inscribed in their hitboxes; take the
				// radius facing the striker.
				(
					target,
				) =>
					ellipseRadiusToward(
						targetSize,
						subtraction(
							target.position,
							striker.position,
						),
					),
				strike.sweptUntil,
				now,
			);
		for (const target of hits) {
			events.push(
				hit(
					target,
					strike,
				),
			);
		}
		events.push(
			strikeSwept(
				attackerType,
				striker.id,
				weapon.id,
				now,
				hits.map(
					(
						t,
					) =>
						t.id,
				),
			),
		);
	}
}

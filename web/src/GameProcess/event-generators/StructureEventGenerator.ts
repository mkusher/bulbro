import type { BulbroState } from "@/bulbro/BulbroState";
import { ENEMY_SIZE } from "@/enemy";
import {
	engineeringAmount,
	gardenIntervals,
	MINE_EXPLOSION_RADIUS,
	MINE_TRIGGER_RADIUS,
	mineIntervals,
	STRUCTURE_SPAWN_DURATION,
	type Structure,
	type StructureKind,
	TURRET_EXPLOSION_RADIUS,
	turretParameters,
	wrenchTurrets,
} from "@/engineering/structures";
import {
	type GameEventInternal,
	withEventMeta,
} from "@/game-events/GameEvents";
import {
	circleIntersectsAabb,
	direction,
	distance,
	type Position,
	type Size,
	segmentAabbHitTime,
} from "@/geometry";
import { findItemById } from "@/items/Items";
import { CONSUMABLE_HEAL_AMOUNT } from "@/object/ConsumableState";
import { requireDefined } from "@/requireDefined";
import { ShotState } from "@/shot/ShotState";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { uuid } from "@/uuid";
import type { WaveState } from "@/waveState";
import type { EventGenerator } from "./EventGenerator";

function randomPosition(
	size: Size,
	random: () => number,
): Position {
	const margin =
		Math.min(
			40,
			size.width /
				2,
			size.height /
				2,
		);
	return {
		x:
			margin +
			random() *
				(size.width -
					margin *
						2),
		y:
			margin +
			random() *
				(size.height -
					margin *
						2),
	};
}

/** Host-generated events own all structure timers, positions, hits and pickups. */
export class StructureEventGenerator
	implements
		EventGenerator
{
	private random: () => number;
	constructor(
		random: () => number = Math.random,
	) {
		this.random =
			random;
	}
	generate(
		state: WaveState,
		delta: DeltaTime,
		now: NowTime,
	): GameEventInternal[] {
		if (
			!state
				.round
				.isRunning
		)
			return [];
		const events: GameEventInternal[] =
			[];
		const structures =
			new Map(
				state.objects
					.filter(
						(
							o,
						): o is Structure =>
							o.type ===
							"structure",
					)
					.map(
						(
							s,
						) => [
							s.id,
							s,
						],
					),
			);
		const enemies =
			new Map(
				state.enemies
					.filter(
						(
							e,
						) =>
							!e.killedAt &&
							e.healthPoints >
								0,
					)
					.map(
						(
							e,
						) => [
							e.id,
							e,
						],
					),
			);
		const change =
			(
				s: Structure,
			) => {
				structures.set(
					s.id,
					s,
				);
				events.push(
					{
						type: "structureChanged",
						structure:
							s,
					},
				);
			};
		const remove =
			(
				id: string,
			) => {
				structures.delete(
					id,
				);
				events.push(
					{
						type: "structureRemoved",
						structureId:
							id,
					},
				);
			};
		const hit =
			(
				id: string,
				damage: number,
				owner: BulbroState,
				from: Position,
			) => {
				const enemy =
					enemies.get(
						id,
					);
				if (
					!enemy
				)
					return;
				const event =
					enemy.beHit(
						{
							damage,
							luck: owner
								.stats
								.luck,
						},
						now,
						{
							strength:
								owner
									.stats
									.knockback,
							direction:
								direction(
									from,
									enemy.position,
								),
						},
						this
							.random,
					);
				events.push(
					event,
				);
				if (
					event.type ===
					"enemyDied"
				)
					enemies.delete(
						id,
					);
				else
					enemies.set(
						id,
						enemy.applyEvent(
							withEventMeta(
								event,
								delta,
								now,
							),
						),
					);
			};
		const blast =
			(
				id: string,
				position: Position,
				radius: number,
				damage: number,
				owner: BulbroState,
			) => {
				const hitIds: string[] =
					[];
				for (const enemy of enemies.values()) {
					if (
						!circleIntersectsAabb(
							{
								...position,
								radius,
							},
							enemy
								.position
								.x -
								ENEMY_SIZE.width /
									2,
							enemy
								.position
								.y -
								ENEMY_SIZE.height /
									2,
							enemy
								.position
								.x +
								ENEMY_SIZE.width /
									2,
							enemy
								.position
								.y +
								ENEMY_SIZE.height /
									2,
						)
					)
						continue;
					hitIds.push(
						enemy.id,
					);
					hit(
						enemy.id,
						damage,
						owner,
						position,
					);
				}
				events.push(
					{
						type: "shotExploded",
						shotId:
							id,
						shooterType:
							"player",
						weaponType:
							"wrench",
						position,
						radius,
						hitIds,
					},
				);
			};
		const fruit =
			(
				position: Position,
			) => {
				const angle =
					this.random() *
					Math.PI *
					2;
				const radius =
					55 +
					this.random() *
						20;
				// Reflect outward offsets back into the arena so edge gardens keep their clearance.
				const offset =
					(
						value: number,
						delta: number,
						max: number,
					) => {
						const candidate =
							value +
							delta;
						return Math.max(
							0,
							Math.min(
								max,
								candidate <
									0 ||
									candidate >
										max
									? value -
											delta
									: candidate,
							),
						);
					};
				events.push(
					{
						type: "consumableSpawned",
						consumable:
							{
								type: "consumable",
								id: uuid(),
								position:
									{
										x: offset(
											position.x,
											Math.cos(
												angle,
											) *
												radius,
											state
												.mapSize
												.width,
										),
										y: offset(
											position.y,
											Math.sin(
												angle,
											) *
												radius,
											state
												.mapSize
												.height,
										),
									},
								hp: CONSUMABLE_HEAL_AMOUNT,
							},
					},
				);
			};
		const mine =
			(
				ownerId: string,
			) =>
				change(
					{
						type: "structure",
						id: uuid(),
						kind: "landmine",
						spawnStartedAt:
							now,
						ownerId,
						position:
							randomPosition(
								state.mapSize,
								this
									.random,
							),
						interval: 0,
						nextActionAt:
							now,
					},
				);
		const spawnSource =
			(
				owner: BulbroState,
				id: string,
				kind: StructureKind,
				interval = 0,
			) => {
				if (
					structures.has(
						id,
					)
				)
					return;
				change(
					{
						type: "structure",
						id,
						kind,
						spawnStartedAt:
							kind in
							turretParameters
								? now
								: undefined,
						ownerId:
							owner.id,
						position:
							randomPosition(
								state.mapSize,
								this
									.random,
							),
						interval,
						nextActionAt:
							now +
							interval,
					},
				);
				if (
					kind ===
					"landmineSource"
				)
					mine(
						owner.id,
					);
				if (
					kind ===
					"garden"
				)
					fruit(
						requireDefined(
							structures.get(
								id,
							),
						)
							.position,
					);
			};
		for (const owner of state.players) {
			if (
				!owner.isAlive()
			)
				continue;
			owner.items.forEach(
				(
					id,
					i,
				) => {
					const kind =
						findItemById(
							id,
						)?.structure;
					if (
						kind
					)
						spawnSource(
							owner,
							`${owner.id}:item:${i}`,
							kind,
							kind ===
								"garden"
								? 15000
								: kind ===
										"landmineSource"
									? 12000
									: 0,
						);
				},
			);
			for (const weapon of owner.weapons) {
				const tier =
					weapon.tier ??
					1;
				const id = `${owner.id}:weapon:${weapon.id}`;
				if (
					weapon.type ===
					"wrench"
				)
					spawnSource(
						owner,
						id,
						requireDefined(
							wrenchTurrets[
								tier -
									1
							],
						),
					);
				if (
					weapon.type ===
					"pruner"
				)
					spawnSource(
						owner,
						id,
						"garden",
						requireDefined(
							gardenIntervals[
								tier -
									1
							],
						),
					);
				if (
					weapon.type ===
					"screwdriver"
				)
					spawnSource(
						owner,
						id,
						"landmineSource",
						requireDefined(
							mineIntervals[
								tier -
									1
							],
						),
					);
			}
		}
		for (const s of [
			...structures.values(),
		]) {
			const owner =
				state.players.find(
					(
						p,
					) =>
						p.id ===
						s.ownerId,
				);
			if (
				!owner?.isAlive()
			)
				continue;
			if (
				s.spawnStartedAt !==
					undefined &&
				now -
					s.spawnStartedAt <
					STRUCTURE_SPAWN_DURATION
			)
				continue;
			if (
				s.kind ===
				"landmine"
			) {
				const touching =
					[
						...enemies.values(),
					].some(
						(
							e,
						) =>
							distance(
								e.position,
								s.position,
							) <=
							MINE_TRIGGER_RADIUS,
					);
				const playerTouching =
					state.players.some(
						(
							player,
						) =>
							player.isAlive() &&
							distance(
								player.position,
								s.position,
							) <=
								MINE_TRIGGER_RADIUS,
					);
				if (
					touching &&
					!s.armed
				)
					change(
						{
							...s,
							armed: true,
						},
					);
				if (
					playerTouching ||
					(!touching &&
						s.armed)
				) {
					blast(
						s.id,
						s.position,
						MINE_EXPLOSION_RADIUS *
							Math.max(
								0,
								1 +
									owner
										.stats
										.explosionSize /
										100,
							),
						engineeringAmount(
							10,
							1,
							owner
								.stats
								.engineering,
						),
						owner,
					);
					remove(
						s.id,
					);
				}
				continue;
			}
			if (
				s.kind ===
				"burn"
			) {
				if (
					!enemies.has(
						requireDefined(
							s.targetId,
						),
					)
				) {
					remove(
						s.id,
					);
					continue;
				}
				if (
					now <
					s.nextActionAt
				)
					continue;
				hit(
					requireDefined(
						s.targetId,
					),
					requireDefined(
						s.damage,
					),
					owner,
					s.position,
				);
				if (
					requireDefined(
						s.ticksLeft,
					) <=
					1
				)
					remove(
						s.id,
					);
				else
					change(
						{
							...s,
							ticksLeft:
								requireDefined(
									s.ticksLeft,
								) -
								1,
							nextActionAt:
								s.nextActionAt +
								1000,
						},
					);
				continue;
			}
			if (
				now <
				s.nextActionAt
			)
				continue;
			if (
				s.kind ===
					"garden" ||
				s.kind ===
					"landmineSource"
			) {
				if (
					s.kind ===
					"garden"
				)
					fruit(
						s.position,
					);
				else
					mine(
						owner.id,
					);
				change(
					{
						...s,
						nextActionAt:
							now +
							s.interval,
					},
				);
				continue;
			}
			const params =
				turretParameters[
					s
						.kind
				];
			const target =
				s.kind ===
				"medicalTurret"
					? owner.healthPoints <
							owner
								.stats
								.maxHp &&
						distance(
							owner.position,
							s.position,
						) <=
							params.range
						? owner
						: undefined
					: [
							...enemies.values(),
						]
							.filter(
								(
									e,
								) =>
									distance(
										e.position,
										s.position,
									) <=
									params.range,
							)
							.sort(
								(
									a,
									b,
								) =>
									distance(
										a.position,
										s.position,
									) -
									distance(
										b.position,
										s.position,
									),
							)[0];
			if (
				!target
			)
				continue;
			const shot =
				new ShotState(
					{
						id: uuid(),
						shooterId:
							s.id,
						shooterType:
							"player",
						damage:
							engineeringAmount(
								params.damage,
								params.scaling,
								owner
									.stats
									.engineering,
							),
						speed:
							s.kind ===
							"incendiaryTurret"
								? 450
								: 700,
						range:
							params.range,
						position:
							s.position,
						startPosition:
							s.position,
						direction:
							direction(
								s.position,
								target.position,
							),
						knockback:
							owner
								.stats
								.knockback,
						weaponType:
							"wrench",
						explosionRadius:
							s.kind ===
							"explosiveTurret"
								? TURRET_EXPLOSION_RADIUS *
									Math.max(
										0,
										1 +
											owner
												.stats
												.explosionSize /
												100,
									)
								: 0,
						structure:
							{
								kind: s.kind,
								ownerId:
									owner.id,
								targetId:
									s.kind ===
									"medicalTurret"
										? owner.id
										: undefined,
								hitIds:
									[],
								burnDamage:
									s.kind ===
									"incendiaryTurret"
										? engineeringAmount(
												5,
												0.33,
												owner
													.stats
													.engineering,
											)
										: undefined,
							},
					},
				);
			events.push(
				{
					type: "shot",
					shot,
					weaponId:
						s.id,
				},
			);
			change(
				{
					...s,
					aim: shot.direction,
					nextActionAt:
						now +
						params.cooldown *
							(0.7 +
								this.random() *
									0.6),
				},
			);
		}
		for (const shot of state.shots) {
			const info =
				shot.structure;
			if (
				!info
			)
				continue;
			const owner =
				state.players.find(
					(
						p,
					) =>
						p.id ===
						info.ownerId,
				);
			if (
				!owner
			) {
				events.push(
					shot.expire(),
				);
				continue;
			}
			const remaining =
				Math.max(
					0,
					shot.range -
						distance(
							shot.startPosition,
							shot.position,
						),
				);
			const step =
				Math.min(
					remaining,
					(shot.speed *
						delta) /
						1000,
				);
			const to =
				{
					x: Math.max(
						0,
						Math.min(
							state
								.mapSize
								.width,
							shot
								.position
								.x +
								shot
									.direction
									.x *
									step,
						),
					),
					y: Math.max(
						0,
						Math.min(
							state
								.mapSize
								.height,
							shot
								.position
								.y +
								shot
									.direction
									.y *
									step,
						),
					),
				};
			const collisionTime =
				(
					position: Position,
					size: Size,
				) =>
					segmentAabbHitTime(
						shot
							.position
							.x,
						shot
							.position
							.y,
						to.x -
							shot
								.position
								.x,
						to.y -
							shot
								.position
								.y,
						position.x -
							size.width /
								2,
						position.y -
							size.height /
								2,
						position.x +
							size.width /
								2,
						position.y +
							size.height /
								2,
					);
			let expired = false;
			let end =
				to;
			const hitIds =
				[
					...info.hitIds,
				];
			if (
				info.kind ===
				"medicalTurret"
			) {
				const target =
					state.players.find(
						(
							p,
						) =>
							p.id ===
								info.targetId &&
							p.isAlive(),
					);
				if (
					target &&
					collisionTime(
						target.position,
						{
							width: 30,
							height: 30,
						},
					) !==
						Infinity
				) {
					events.push(
						{
							type: "bulbroHealed",
							bulbroId:
								target.id,
							hp: shot.damage,
							source:
								"medicalTurret",
						},
					);
					expired = true;
				}
			} else {
				const collisions =
					[
						...enemies.values(),
					]
						.filter(
							(
								e,
							) =>
								!hitIds.includes(
									e.id,
								),
						)
						.map(
							(
								e,
							) => ({
								enemy:
									e,
								t: collisionTime(
									e.position,
									ENEMY_SIZE,
								),
							}),
						)
						.filter(
							(
								c,
							) =>
								c.t !==
								Infinity,
						)
						.sort(
							(
								a,
								b,
							) =>
								a.t -
								b.t,
						);
				for (const {
					enemy,
					t,
				} of collisions) {
					end =
						{
							x:
								shot
									.position
									.x +
								(to.x -
									shot
										.position
										.x) *
									t,
							y:
								shot
									.position
									.y +
								(to.y -
									shot
										.position
										.y) *
									t,
						};
					if (
						shot.isExplosive
					) {
						blast(
							shot.id,
							end,
							shot.explosionRadius,
							shot.damage,
							owner,
						);
						expired = true;
						break;
					}
					hit(
						enemy.id,
						shot.damage,
						owner,
						shot.position,
					);
					hitIds.push(
						enemy.id,
					);
					if (
						info.kind ===
							"incendiaryTurret" &&
						enemies.has(
							enemy.id,
						)
					) {
						const id = `burn:${enemy.id}`;
						const previous =
							structures.get(
								id,
							);
						change(
							{
								type: "structure",
								id,
								kind: "burn",
								ownerId:
									owner.id,
								position:
									enemy.position,
								interval: 1000,
								nextActionAt:
									previous?.nextActionAt ??
									now +
										1000,
								targetId:
									enemy.id,
								damage:
									Math.max(
										requireDefined(
											info.burnDamage,
										),
										previous?.damage ??
											0,
									),
								ticksLeft: 8,
							},
						);
					}
					if (
						info.kind ===
							"turret" ||
						(info.kind ===
							"laserTurret" &&
							hitIds.length >=
								4)
					) {
						expired = true;
						break;
					}
				}
			}
			if (
				!expired &&
				(step >=
					remaining ||
					distance(
						to,
						shot.position,
					) <
						step *
							0.99)
			) {
				if (
					shot.isExplosive
				)
					blast(
						shot.id,
						to,
						shot.explosionRadius,
						shot.damage,
						owner,
					);
				expired = true;
				end =
					to;
			}
			if (
				expired
			)
				events.push(
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position:
							end,
					},
				);
			else
				events.push(
					{
						...shot.move(
							to,
						),
						structureHitIds:
							hitIds,
					},
				);
		}
		return events;
	}
}

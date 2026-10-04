import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { BULBRO_SIZE } from "../../bulbro";
import { ENEMY_SIZE } from "../../enemy";
import type { GameEventInternal } from "../../game-events/GameEvents";
import {
	circleIntersectsAabb,
	distance,
	type Position,
	type Rectangle,
	rectContainsPoint,
	type Size,
	segmentAabbHitTime,
} from "../../geometry";
import { movePosition } from "../../physics";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

const CELL_SIZE = 64;
// Provisional crossover: small populations avoid grid construction and lookups.
const GRID_MIN_ENEMIES = 100;

type Collider<
	T,
> =
	{
		entity: T;
		order: number;
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
	};
function collider<
	T extends
		{
			position: Position;
		},
>(
	entity: T,
	size: Size,
	order: number,
): Collider<T> {
	return {
		entity,
		order,
		minX:
			entity
				.position
				.x -
			size.width /
				2,
		maxX:
			entity
				.position
				.x +
			size.width /
				2,
		minY:
			entity
				.position
				.y -
			size.height /
				2,
		maxY:
			entity
				.position
				.y +
			size.height /
				2,
	};
}

function clampToRect(
	rect: Rectangle,
	point: Position,
): Position {
	return {
		x: Math.min(
			Math.max(
				point.x,
				rect.x,
			),
			rect.x +
				rect.width,
		),
		y: Math.min(
			Math.max(
				point.y,
				rect.y,
			),
			rect.y +
				rect.height,
		),
	};
}

/** Generates swept shot collisions, using a grid only for larger enemy populations. */
export class ShotMovementEventGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEventInternal[] {
		const events: GameEventInternal[] =
			[];
		const {
			mapSize,
			shots,
			enemies,
			players,
		} =
			state;
		if (
			shots.length ===
			0
		)
			return events;
		// Life steal heals a player at most once per tick
		const lifeStolenBy =
			new Set<string>();
		const bounds =
			{
				x: 0,
				y: 0,
				width:
					mapSize.width,
				height:
					mapSize.height,
			};
		const enemyBounds =
			shots.some(
				(
					s,
				) =>
					s.shooterType ===
					"player",
			)
				? enemies
						.filter(
							(
								e,
							) =>
								!e.killedAt,
						)
						.map(
							(
								e,
								i,
							) =>
								collider(
									e,
									ENEMY_SIZE,
									i,
								),
						)
				: [];
		const playerBounds =
			shots.some(
				(
					s,
				) =>
					s.shooterType ===
					"enemy",
			)
				? players
						.filter(
							(
								p,
							) =>
								p.isAlive(),
						)
						.map(
							(
								p,
								i,
							) =>
								collider(
									p,
									BULBRO_SIZE,
									i,
								),
						)
				: [];
		const grid =
			enemyBounds.length >=
			GRID_MIN_ENEMIES
				? new Map<
						string,
						typeof enemyBounds
					>()
				: undefined;
		if (
			grid
		) {
			for (const body of enemyBounds) {
				const key = `${Math.floor(body.entity.position.x / CELL_SIZE)},${Math.floor(body.entity.position.y / CELL_SIZE)}`;
				const cell =
					grid.get(
						key,
					);
				if (
					cell
				)
					cell.push(
						body,
					);
				else
					grid.set(
						key,
						[
							body,
						],
					);
			}
		}
		const shooterOf =
			(
				shot: (typeof shots)[number],
			) =>
				shot.shooterType ===
				"player"
					? players.find(
							(
								p,
							) =>
								p.id ===
								shot.shooterId,
						)
					: undefined;
		const stealLife =
			(
				shooter: ReturnType<
					typeof shooterOf
				>,
			) => {
				if (
					!shooter ||
					lifeStolenBy.has(
						shooter.id,
					)
				)
					return;
				const heal =
					shooter.stealLife(
						now,
					);
				if (
					heal
				) {
					events.push(
						heal,
					);
					lifeStolenBy.add(
						shooter.id,
					);
				}
			};
		/** Enemy hitboxes that may overlap the given box. */
		const enemiesNear =
			(
				minX: number,
				minY: number,
				maxX: number,
				maxY: number,
			): typeof enemyBounds => {
				if (
					!grid
				)
					return enemyBounds;
				// Centers outside the box cells can still have overlapping hitboxes.
				const minCx =
					Math.floor(
						(minX -
							ENEMY_SIZE.width /
								2) /
							CELL_SIZE,
					);
				const maxCx =
					Math.floor(
						(maxX +
							ENEMY_SIZE.width /
								2) /
							CELL_SIZE,
					);
				const minCy =
					Math.floor(
						(minY -
							ENEMY_SIZE.height /
								2) /
							CELL_SIZE,
					);
				const maxCy =
					Math.floor(
						(maxY +
							ENEMY_SIZE.height /
								2) /
							CELL_SIZE,
					);
				const near: typeof enemyBounds =
					[];
				for (
					let cx =
						minCx;
					cx <=
					maxCx;
					cx++
				) {
					for (
						let cy =
							minCy;
						cy <=
						maxCy;
						cy++
					) {
						const cell =
							grid.get(
								`${cx},${cy}`,
							);
						if (
							cell
						)
							near.push(
								...cell,
							);
					}
				}
				return near;
			};
		/** First body the shot touches flying from `from` to `to`. */
		const findHit =
			(
				shot: (typeof shots)[number],
				from: Position,
				to: Position,
			) => {
				const dx =
					to.x -
					from.x;
				const dy =
					to.y -
					from.y;
				let hitTime =
					Infinity;
				let hitOrder =
					Infinity;
				let hitEnemy:
					| (typeof enemies)[number]
					| undefined;
				let hitPlayer:
					| (typeof players)[number]
					| undefined;
				if (
					shot.shooterType ===
					"player"
				) {
					for (const body of enemiesNear(
						Math.min(
							from.x,
							to.x,
						),
						Math.min(
							from.y,
							to.y,
						),
						Math.max(
							from.x,
							to.x,
						),
						Math.max(
							from.y,
							to.y,
						),
					)) {
						const t =
							segmentAabbHitTime(
								from.x,
								from.y,
								dx,
								dy,
								body.minX,
								body.minY,
								body.maxX,
								body.maxY,
							);
						if (
							t <
								hitTime ||
							(t !==
								Infinity &&
								t ===
									hitTime &&
								body.order <
									hitOrder)
						) {
							hitTime =
								t;
							hitOrder =
								body.order;
							hitEnemy =
								body.entity;
						}
					}
				} else if (
					shot.shooterType ===
					"enemy"
				) {
					for (const body of playerBounds) {
						const t =
							segmentAabbHitTime(
								from.x,
								from.y,
								dx,
								dy,
								body.minX,
								body.minY,
								body.maxX,
								body.maxY,
							);
						if (
							t <
							hitTime
						) {
							hitTime =
								t;
							hitPlayer =
								body.entity;
						}
					}
				}
				return {
					hitTime,
					hitEnemy,
					hitPlayer,
					position:
						hitTime ===
						Infinity
							? to
							: {
									x:
										from.x +
										dx *
											hitTime,
									y:
										from.y +
										dy *
											hitTime,
								},
				};
			};
		/** Hits everything within the shot's explosion radius around `center`. */
		const explode =
			(
				shot: (typeof shots)[number],
				center: Position,
			) => {
				const radius =
					shot.explosionRadius;
				const blast =
					{
						x: center.x,
						y: center.y,
						radius,
					};
				const knockbackDirection =
					(
						target: Position,
					) => {
						const d =
							distance(
								center,
								target,
							);
						return d >
							0
							? {
									x:
										(target.x -
											center.x) /
										d,
									y:
										(target.y -
											center.y) /
										d,
								}
							: shot.direction;
					};
				const hitIds: string[] =
					[];
				if (
					shot.shooterType ===
					"player"
				) {
					const shooter =
						shooterOf(
							shot,
						);
					for (const body of enemiesNear(
						center.x -
							radius,
						center.y -
							radius,
						center.x +
							radius,
						center.y +
							radius,
					)) {
						if (
							!circleIntersectsAabb(
								blast,
								body.minX,
								body.minY,
								body.maxX,
								body.maxY,
							)
						)
							continue;
						hitIds.push(
							body
								.entity
								.id,
						);
						events.push(
							body.entity.beHit(
								{
									damage:
										shot.damage,
									luck: shooter
										?.stats
										.luck,
								},
								now,
								{
									strength:
										shot.knockback,
									direction:
										knockbackDirection(
											body
												.entity
												.position,
										),
								},
							),
						);
					}
					if (
						hitIds.length >
						0
					)
						stealLife(
							shooter,
						);
				} else {
					for (const body of playerBounds) {
						if (
							!circleIntersectsAabb(
								blast,
								body.minX,
								body.minY,
								body.maxX,
								body.maxY,
							)
						)
							continue;
						hitIds.push(
							body
								.entity
								.id,
						);
						const hit =
							body.entity.beHit(
								shot.damage,
								now,
							);
						if (
							hit
						)
							events.push(
								hit,
							);
					}
				}
				events.push(
					{
						type: "shotExploded",
						shotId:
							shot.id,
						shooterType:
							shot.shooterType,
						weaponType:
							shot.weaponType,
						position:
							center,
						radius,
						hitIds,
					},
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position:
							center,
					},
				);
			};
		for (const shot of shots) {
			const prevPos =
				shot.position;
			const nextPos =
				movePosition(
					prevPos,
					shot.speed,
					shot.direction,
					deltaTime,
				);
			const isOutOfBounds =
				!rectContainsPoint(
					bounds,
					nextPos,
				);
			const isOutOfRange =
				distance(
					shot.startPosition,
					nextPos,
				) >
				shot.range;
			if (
				shot.isExplosive
			) {
				// The shot flies up to the end of its range (staying on the map)
				// and explodes on the first body on its way or at that point.
				const endPos =
					clampToRect(
						bounds,
						isOutOfRange
							? {
									x:
										shot
											.startPosition
											.x +
										shot
											.direction
											.x *
											shot.range,
									y:
										shot
											.startPosition
											.y +
										shot
											.direction
											.y *
											shot.range,
								}
							: nextPos,
					);
				const hit =
					findHit(
						shot,
						prevPos,
						endPos,
					);
				if (
					hit.hitTime !==
						Infinity ||
					isOutOfBounds ||
					isOutOfRange
				)
					explode(
						shot,
						hit.position,
					);
				else
					events.push(
						shot.move(
							nextPos,
						),
					);
				continue;
			}
			// Preserve existing range/map expiration precedence.
			if (
				isOutOfBounds ||
				isOutOfRange
			) {
				events.push(
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position:
							nextPos,
					},
				);
				continue;
			}
			const {
				hitTime,
				hitEnemy,
				hitPlayer,
				position,
			} =
				findHit(
					shot,
					prevPos,
					nextPos,
				);
			if (
				hitEnemy
			) {
				const shooter =
					shooterOf(
						shot,
					);
				events.push(
					hitEnemy.beHit(
						{
							damage:
								shot.damage,
							luck: shooter
								?.stats
								.luck,
						},
						now,
						{
							strength:
								shot.knockback,
							direction:
								shot.direction,
						},
					),
				);
				stealLife(
					shooter,
				);
			}
			if (
				hitPlayer
			) {
				const hit =
					hitPlayer.beHit(
						shot.damage,
						now,
					);
				if (
					hit
				)
					events.push(
						hit,
					);
			}
			if (
				hitTime !==
				Infinity
			) {
				events.push(
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position,
					},
				);
			} else
				events.push(
					shot.move(
						nextPos,
					),
				);
		}
		return events;
	}
}

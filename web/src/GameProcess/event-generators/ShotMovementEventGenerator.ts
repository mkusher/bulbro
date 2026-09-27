import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { BULBRO_SIZE } from "../../bulbro";
import { ENEMY_SIZE } from "../../enemy";
import type { GameEventInternal } from "../../game-events/GameEvents";
import {
	distance,
	rectContainsPoint,
	segmentAabbHitTime,
	type Position,
	type Size,
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
			// Preserve existing range/map expiration precedence.
			if (
				!rectContainsPoint(
					bounds,
					nextPos,
				) ||
				distance(
					shot.startPosition,
					nextPos,
				) >
					shot.range
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
			const dx =
				nextPos.x -
				prevPos.x;
			const dy =
				nextPos.y -
				prevPos.y;
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
			const testEnemy =
				(
					body: (typeof enemyBounds)[number],
				) => {
					const t =
						segmentAabbHitTime(
							prevPos.x,
							prevPos.y,
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
				};
			if (
				shot.shooterType ===
				"player"
			) {
				if (
					grid
				) {
					// Centers outside the segment cells can still have overlapping hitboxes.
					const minCx =
						Math.floor(
							(Math.min(
								prevPos.x,
								nextPos.x,
							) -
								ENEMY_SIZE.width /
									2) /
								CELL_SIZE,
						);
					const maxCx =
						Math.floor(
							(Math.max(
								prevPos.x,
								nextPos.x,
							) +
								ENEMY_SIZE.width /
									2) /
								CELL_SIZE,
						);
					const minCy =
						Math.floor(
							(Math.min(
								prevPos.y,
								nextPos.y,
							) -
								ENEMY_SIZE.height /
									2) /
								CELL_SIZE,
						);
					const maxCy =
						Math.floor(
							(Math.max(
								prevPos.y,
								nextPos.y,
							) +
								ENEMY_SIZE.height /
									2) /
								CELL_SIZE,
						);
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
								for (const body of cell)
									testEnemy(
										body,
									);
						}
					}
				} else {
					for (const body of enemyBounds)
						testEnemy(
							body,
						);
				}
			} else if (
				shot.shooterType ===
				"enemy"
			) {
				for (const body of playerBounds) {
					const t =
						segmentAabbHitTime(
							prevPos.x,
							prevPos.y,
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
			if (
				hitEnemy
			)
				events.push(
					hitEnemy.beHit(
						shot,
						now,
					),
				);
			if (
				hitPlayer
			)
				events.push(
					hitPlayer.beHit(
						shot.damage,
						now,
					),
				);
			if (
				hitTime !==
				Infinity
			) {
				events.push(
					{
						type: "shotExpired",
						shotId:
							shot.id,
						position:
							{
								x:
									prevPos.x +
									dx *
										hitTime,
								y:
									prevPos.y +
									dy *
										hitTime,
							},
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

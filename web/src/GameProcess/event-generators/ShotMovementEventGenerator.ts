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
	rectFromCenter,
	rectIntersectsLine,
} from "../../geometry";
import { movePosition } from "../../physics";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

const CELL_SIZE = 64;

/**
 * Generates shot movement, collision, and expiration events.
 * Uses a spatial grid for efficient enemy collision detection.
 */
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
		const bounds =
			{
				x: 0,
				y: 0,
				width:
					mapSize.width,
				height:
					mapSize.height,
			};

		// Pre-filter dead enemies once
		const liveEnemies =
			enemies.filter(
				(
					e,
				) =>
					!e.killedAt,
			);

		// Build spatial grid for live enemies
		const enemyGrid =
			new Map<
				string,
				typeof liveEnemies
			>();
		for (const enemy of liveEnemies) {
			const cx =
				Math.floor(
					enemy
						.position
						.x /
						CELL_SIZE,
				);
			const cy =
				Math.floor(
					enemy
						.position
						.y /
						CELL_SIZE,
				);
			const key = `${cx},${cy}`;
			let cell =
				enemyGrid.get(
					key,
				);
			if (
				!cell
			) {
				cell =
					[];
				enemyGrid.set(
					key,
					cell,
				);
			}
			cell.push(
				enemy,
			);
		}

		// Pre-filter live players once
		const livePlayers =
			players.filter(
				(
					p,
				) =>
					p.isAlive(),
			);

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

			// Check bounds and range
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

			const segment =
				{
					start:
						prevPos,
					end: nextPos,
				};
			let isHit = false;

			// Player shots hitting enemies — use spatial grid
			if (
				shot.shooterType ===
				"player"
			) {
				const minCx =
					Math.floor(
						Math.min(
							segment
								.start
								.x,
							segment
								.end
								.x,
						) /
							CELL_SIZE,
					);
				const maxCx =
					Math.floor(
						Math.max(
							segment
								.start
								.x,
							segment
								.end
								.x,
						) /
							CELL_SIZE,
					);
				const minCy =
					Math.floor(
						Math.min(
							segment
								.start
								.y,
							segment
								.end
								.y,
						) /
							CELL_SIZE,
					);
				const maxCy =
					Math.floor(
						Math.max(
							segment
								.start
								.y,
							segment
								.end
								.y,
						) /
							CELL_SIZE,
					);

				outer: for (
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
							enemyGrid.get(
								`${cx},${cy}`,
							);
						if (
							!cell
						)
							continue;
						for (const enemy of cell) {
							const enemyRect =
								rectFromCenter(
									enemy.position,
									ENEMY_SIZE,
								);
							if (
								rectIntersectsLine(
									enemyRect,
									segment,
								)
							) {
								isHit = true;
								const hitEvent =
									enemy.beHit(
										shot,
										now,
									);
								events.push(
									hitEvent,
								);
								break outer;
							}
						}
					}
				}
			}

			// Enemy shots hitting players
			if (
				shot.shooterType ===
				"enemy"
			) {
				for (const player of livePlayers) {
					const playerRect =
						rectFromCenter(
							player.position,
							BULBRO_SIZE,
						);
					if (
						rectIntersectsLine(
							playerRect,
							segment,
						)
					) {
						isHit = true;
						const hitEvent =
							player.beHit(
								shot.damage,
								now,
							);
						events.push(
							hitEvent,
						);
						break;
					}
				}
			}

			if (
				isHit
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
			} else {
				events.push(
					shot.move(
						nextPos,
					),
				);
			}
		}

		return events;
	}
}

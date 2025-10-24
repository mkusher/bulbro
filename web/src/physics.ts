import type { Position, Direction } from "./geometry";
import type { DeltaTime } from "@/time";

/**
 * Compute new position based on speed, direction vector, and elapsed time.
 * @param current Current position
 * @param speed Movement speed (units per second)
 * @param dir Direction vector (values in [0,1])
 * @param deltaTime Time elapsed since last update (seconds)
 */
export function movePosition(
	current: Position,
	speed: number,
	dir: Direction,
	deltaTime: DeltaTime,
): Position {
	const dx = (dir.x * speed * deltaTime) / 1000;
	const dy = (dir.y * speed * deltaTime) / 1000;
	return { x: current.x + dx, y: current.y + dy };
}

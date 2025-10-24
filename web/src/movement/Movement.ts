import {
	type Position,
	type Size,
	rectFromCenter,
	rectsIntersect,
} from "../geometry";
import { movePosition } from "../physics";
import type { Direction } from "../geometry";
import type { DeltaTime } from "@/time";

/**
 * Supported shapes for collision detection.
 */
export type Shape =
	// Axis-aligned rectangle
	| { type: "rectangle"; width: number; height: number }
	// Circle (placeholder)
	| { type: "circle"; radius: number }
	// Ellipse (placeholder)
	| { type: "ellipse"; radiusX: number; radiusY: number };

/**
 * Movable object with a position and collision shape.
 */
export interface MovableObject {
	position: Position;
	shape: Shape;
}

/**
 * Handles movement and collision for a movable object on a map.
 */
export class Movement {
	private obj: MovableObject;
	private mapSize: Size;
	private obstacles: MovableObject[];

	constructor(
		obj: MovableObject,
		mapSize: Size,
		obstacles: MovableObject[] = [],
	) {
		this.obj = obj;
		this.mapSize = mapSize;
		this.obstacles = obstacles;
	}

	/**
	 * Returns the new position after moving with collision and clamping.
	 */
	getPositionAfterMove(
		direction: Direction,
		speed: number,
		deltaTime: DeltaTime,
	): Position {
		// Predict new position
		let newPos = movePosition(this.obj.position, speed, direction, deltaTime);

		// Clamp to map borders based on shape bounds
		switch (this.obj.shape.type) {
			case "rectangle": {
				const halfW = this.obj.shape.width / 2;
				const halfH = this.obj.shape.height / 2;
				newPos.x = Math.max(
					halfW,
					Math.min(this.mapSize.width - halfW, newPos.x),
				);
				newPos.y = Math.max(
					halfH,
					Math.min(this.mapSize.height - halfH, newPos.y),
				);
				break;
			}
			// TODO: clamp circle and ellipse if needed
		}

		// Build new rectangle for collision if rectangle
		let newRect;
		if (this.obj.shape.type === "rectangle") {
			newRect = rectFromCenter(newPos, {
				width: this.obj.shape.width,
				height: this.obj.shape.height,
			});
		}

		// Check collisions against obstacles
		for (const obs of this.obstacles) {
			if (obs.shape.type === "rectangle" && newRect) {
				const obsRect = rectFromCenter(obs.position, {
					width: obs.shape.width,
					height: obs.shape.height,
				});
				if (rectsIntersect(newRect, obsRect)) {
					// Collision: cancel movement
					return this.obj.position;
				}
			}
			// TODO: handle circle and ellipse collisions
		}

		return newPos;
	}
}

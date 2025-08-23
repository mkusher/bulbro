import type { Direction, Position } from "../geometry";
import type {
	ShotMovedEvent,
	ShotExpiredEvent,
	GameEvent,
} from "../game-events/GameEvents";

type ShotStateProperties = {
	/** Unique shot identifier */
	readonly id: string;
	/** ID of the entity that fired this shot */
	readonly shooterId: string;
	/** Whether the shooter was a player or enemy */
	readonly shooterType: "player" | "enemy";
	/** Damage inflicted on hit */
	readonly damage: number;
	/** Movement speed of the shot */
	readonly speed: number;
	/** Maximum travel range */
	readonly range: number;
	/** Current position */
	readonly position: Position;
	readonly startPosition: Position;
	/** Direction vector */
	readonly direction: Direction;
	readonly knockback: number;
};

/**
 * Runtime state of an individual projectile (shot) in play.
 */
export class ShotState implements ShotStateProperties {
	#props: ShotStateProperties;

	get id() {
		return this.#props.id;
	}
	get shooterId() {
		return this.#props.shooterId;
	}
	get shooterType() {
		return this.#props.shooterType;
	}
	get damage() {
		return this.#props.damage;
	}
	get speed() {
		return this.#props.speed;
	}
	get range() {
		return this.#props.range;
	}
	get position() {
		return this.#props.position;
	}
	get startPosition() {
		return this.#props.startPosition;
	}
	get direction() {
		return this.#props.direction;
	}
	get knockback() {
		return this.#props.knockback;
	}

	constructor(props: ShotStateProperties) {
		this.#props = props;
	}

	toJSON() {
		return { ...this.#props };
	}

	/** Returns a move event for the Shot. */
	move(newPosition: Position): ShotMovedEvent {
		return {
			type: "shotMoved",
			shotId: this.id,
			from: this.position,
			to: newPosition,
			direction: this.direction,
		};
	}

	/** Returns an expiration event for the Shot. */
	expire(): ShotExpiredEvent {
		return {
			type: "shotExpired",
			shotId: this.id,
			position: { x: this.position.x, y: this.position.y },
		};
	}

	/** Apply a single event to this Shot state and return the new state. */
	applyEvent(event: GameEvent): ShotState {
		switch (event.type) {
			case "shotMoved":
				if (event.shotId !== this.id) return this;
				return new ShotState({
					...this.#props,
					position: event.to,
				});

			default:
				return this;
		}
	}

	/** Apply multiple events to this Shot state and return the new state. */
	applyEvents(events: GameEvent[]): ShotState {
		return events.reduce(
			(state: ShotState, event) => state.applyEvent(event),
			this,
		);
	}
}

// Maintain the interface for backward compatibility
export interface ShotStateInterface {
	/** Unique shot identifier */
	id: string;
	/** ID of the entity that fired this shot */
	shooterId: string;
	/** Whether the shooter was a player or enemy */
	shooterType: "player" | "enemy";
	/** Damage inflicted on hit */
	damage: number;
	/** Movement speed of the shot */
	speed: number;
	/** Maximum travel range */
	range: number;
	/** Current position */
	position: Position;
	startPosition: Position;
	/** Direction vector */
	direction: Direction;
	knockback: number;
}

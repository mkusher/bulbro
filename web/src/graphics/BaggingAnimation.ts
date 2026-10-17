import * as PIXI from "pixi.js";
import {
	distance,
	rectFromCenter,
	rectsIntersect,
	type Position,
} from "@/geometry";

/** Pause after the wave ends before materials start flying */
const startDelayMs = 200;
/** Fast default speed for end-of-wave flights, in screen pixels per second. */
const flightSpeed = 1800;
/** Delay between two materials taking off */
const maxStaggerMs = 40;
/** All materials take off within this time, however many there are */
const maxTakeOffWindowMs = 700;
/** How long the bag stays bumped after a material drops in */
const bumpMs = 160;

type Flight =
	{
		sprite: PIXI.Sprite;
		value: number;
		from: Position;
		/** Control point of the quadratic curve to the bag */
		via: Position;
		startsAt: number;
		duration: number;
		arrived: boolean;
	};

/** Point on a quadratic Bézier curve */
export function quadraticPoint(
	from: Position,
	via: Position,
	to: Position,
	t: number,
): Position {
	const u =
		1 -
		t;
	return {
		x:
			u *
				u *
				from.x +
			2 *
				u *
				t *
				via.x +
			t *
				t *
				to.x,
		y:
			u *
				u *
				from.y +
			2 *
				u *
				t *
				via.y +
			t *
				t *
				to.y,
	};
}

/** When the material with the given index takes off, in ms from the start */
export function takeOffTime(
	index: number,
	count: number,
): number {
	const stagger =
		Math.min(
			maxStaggerMs,
			maxTakeOffWindowMs /
				Math.max(
					1,
					count,
				),
		);
	return (
		startDelayMs +
		index *
			stagger
	);
}

/**
 * Materials left on the field when a wave ends fly from where they lie into
 * the bag in the corner of the screen.
 */
export class BaggingAnimation {
	#container: PIXI.Container;
	#flights: Flight[];
	#target: () => Position;
	#fromSize: number;
	#toSize: number;
	#elapsed = 0;
	#arrived = 0;
	#arrivedValue = 0;
	#totalValue: number;
	#lastArrivalAt =
		-Infinity;

	/**
	 * @param from screen positions and values of the materials, in `parent` coordinates
	 * @param target current screen position of the bag, in `parent` coordinates
	 * @param fromSize on-screen height of a material on the field
	 * @param toSize on-screen height of the bag icon
	 */
	constructor(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
		texture: PIXI.Texture,
		from: (Position & {
			value: number;
		})[],
		target: () => Position,
		fromSize: number,
		toSize: number,
	) {
		this.#totalValue =
			from.reduce(
				(
					sum,
					material,
				) =>
					sum +
					material.value,
				0,
			);
		this.#target =
			target;
		this.#fromSize =
			fromSize;
		this.#toSize =
			toSize;
		this.#container =
			new PIXI.Container();
		parent.addChild(
			this
				.#container,
		);
		layer.attach(
			this
				.#container,
		);
		const to =
			target();
		this.#flights =
			from.map(
				(
					position,
					i,
				) => {
					const sprite =
						new PIXI.Sprite(
							texture,
						);
					sprite.anchor.set(
						0.5,
					);
					this.#setHeight(
						sprite,
						fromSize,
					);
					sprite.position.set(
						position.x,
						position.y,
					);
					this.#container.addChild(
						sprite,
					);
					// Curve sideways and up first, so materials swoop into the bag
					const midX =
						(position.x +
							to.x) /
						2;
					const midY =
						(position.y +
							to.y) /
						2;
					const side =
						i %
							2 ===
						0
							? 1
							: -1;
					const via =
						{
							x:
								midX +
								side *
									Math.abs(
										position.y -
											to.y,
									) *
									0.25,
							y:
								Math.min(
									position.y,
									midY,
								) -
								60,
						};
					return {
						duration:
							Math.max(
								1,
								((distance(
									position,
									via,
								) +
									distance(
										via,
										to,
									)) /
									flightSpeed) *
									1000,
							),
						sprite,
						value:
							position.value,
						from: position,
						via,
						startsAt:
							takeOffTime(
								i,
								from.length,
							),
						arrived: false,
					};
				},
			);
	}

	/** Material value that reached the bag so far */
	get arrived() {
		return this
			.#arrivedValue;
	}

	get total() {
		return this
			.#totalValue;
	}

	get isDone() {
		return (
			this
				.#arrived ===
				this
					.#flights
					.length &&
			this
				.#elapsed -
				this
					.#lastArrivalAt >=
				bumpMs
		);
	}

	/** Scale of the bag icon: bumped right after a material drops in */
	get bagScale() {
		const sinceArrival =
			this
				.#elapsed -
			this
				.#lastArrivalAt;
		if (
			sinceArrival >=
			bumpMs
		)
			return 1;
		return (
			1 +
			0.35 *
				Math.sin(
					(Math.PI *
						sinceArrival) /
						bumpMs,
				)
		);
	}

	/**
	 * Advances the animation.
	 * @returns material value that reached the bag during this update
	 */
	update(
		deltaMs: number,
	): number {
		this.#elapsed +=
			deltaMs;
		const to =
			this.#target();
		let arrivedNow = 0;
		let arrivedValueNow = 0;
		for (const flight of this
			.#flights) {
			if (
				flight.arrived
			)
				continue;
			const t =
				Math.min(
					1,
					Math.max(
						0,
						(this
							.#elapsed -
							flight.startsAt) /
							flight.duration,
					),
				);
			const eased =
				t;
			const position =
				quadraticPoint(
					flight.from,
					flight.via,
					to,
					eased,
				);
			flight.sprite.position.set(
				position.x,
				position.y,
			);
			// Pop up a little on take-off, then shrink into the bag
			const pop =
				Math.sin(
					Math.PI *
						Math.min(
							1,
							t *
								2,
						),
				) *
				0.4;
			this.#setHeight(
				flight.sprite,
				(this
					.#fromSize +
					(this
						.#toSize -
						this
							.#fromSize) *
						eased) *
					(1 +
						pop),
			);
			if (
				this
					.#elapsed >=
					flight.startsAt &&
				(t >=
					1 ||
					rectsIntersect(
						rectFromCenter(
							position,
							{
								width:
									flight
										.sprite
										.width,
								height:
									flight
										.sprite
										.height,
							},
						),
						rectFromCenter(
							to,
							{
								width:
									this
										.#toSize,
								height:
									this
										.#toSize,
							},
						),
					))
			) {
				flight.arrived = true;
				flight.sprite.destroy();
				arrivedNow++;
				arrivedValueNow +=
					flight.value;
				continue;
			}
			flight.sprite.rotation =
				eased *
				Math.PI *
				2;
		}
		if (
			arrivedNow >
			0
		) {
			this.#arrivedValue +=
				arrivedValueNow;
			this.#arrived +=
				arrivedNow;
			this.#lastArrivalAt =
				this.#elapsed;
		}
		return arrivedValueNow;
	}

	destroy() {
		this.#container.destroy(
			{
				children: true,
			},
		);
	}

	#setHeight(
		sprite: PIXI.Sprite,
		height: number,
	) {
		sprite.scale.set(
			height /
				sprite
					.texture
					.height,
		);
	}
}

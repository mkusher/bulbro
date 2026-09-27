import * as PIXI from "pixi.js";
import type { BulbroState } from "@/bulbro/BulbroState";
import {
	calculateWeaponPosition,
	weaponContainerOffset,
} from "@/game-formulas";
import {
	type Direction,
	normalize,
	type Position,
} from "@/geometry";
import type { NowTime } from "@/time";
import {
	type MeleeStrike,
	STRIKE_RECOVERY_MS,
	type SwingStrike,
	swingAngleAt,
	type ThrustStrike,
	thrustExtensionAt,
} from "../MeleeStrike";
import type { WeaponState } from "../WeaponState";
import {
	type StrikeTrail,
	StrikeTrailSprite,
} from "./StrikeTrailSprite";
import {
	getWeaponSize,
	WeaponSprite,
} from "./WeaponSprite";

/** How long (ms) the swing trail lingers behind the blade. */
const SWING_TRAIL_MS = 110;

export type StrikePose =
	{
		position: Position;
		direction: Direction;
		trail?: StrikeTrail;
	};

type RestPose =
	{
		position: Position;
		direction: Direction;
	};

function easeOutQuad(
	t: number,
) {
	return (
		1 -
		(1 -
			t) **
			2
	);
}

function lerp(
	a: number,
	b: number,
	t: number,
) {
	return (
		a +
		(b -
			a) *
			t
	);
}

function lerpPoint(
	a: Position,
	b: Position,
	t: number,
): Position {
	return {
		x: lerp(
			a.x,
			b.x,
			t,
		),
		y: lerp(
			a.y,
			b.y,
			t,
		),
	};
}

function restDirectionOf(
	rest: RestPose,
): Direction {
	return rest
		.direction
		.x ===
		0 &&
		rest
			.direction
			.y ===
			0
		? {
				x: 1,
				y: 0,
			}
		: rest.direction;
}

/**
 * Where a striking weapon is drawn inside the (possibly flipped) weapons
 * container. Returns undefined when the weapon is not striking.
 */
export function computeStrikePose(
	strike: MeleeStrike,
	rest: RestPose,
	bladeLength: number,
	facingLeft: boolean,
	now: number,
):
	| StrikePose
	| undefined {
	// Container is mirrored when facing left, so mirror world angles too.
	const toLocal =
		(
			angle: number,
		) =>
			facingLeft
				? Math.PI -
					angle
				: angle;
	switch (
		strike.type
	) {
		case "swing":
			return computeSwingPose(
				strike,
				rest,
				bladeLength,
				toLocal,
				now,
			);
		case "thrust":
			return computeThrustPose(
				strike,
				rest,
				bladeLength,
				toLocal,
				now,
			);
	}
}

/**
 * The blade orbits the body center so that its tip follows the strike reach,
 * then eases back to its resting spot after the swing.
 */
function computeSwingPose(
	strike: SwingStrike,
	rest: RestPose,
	bladeLength: number,
	toLocal: (
		angle: number,
	) => number,
	now: number,
):
	| StrikePose
	| undefined {
	const end =
		strike.startedAt +
		strike.duration;
	if (
		now <
			strike.startedAt ||
		now >=
			end +
				STRIKE_RECOVERY_MS
	)
		return undefined;
	const pivot =
		weaponContainerOffset;
	const outerRadius =
		Math.max(
			strike.reach,
			bladeLength,
		);
	const innerRadius =
		outerRadius -
		bladeLength;
	const centerRadius =
		outerRadius -
		bladeLength /
			2;
	const angle =
		toLocal(
			swingAngleAt(
				strike,
				Math.min(
					now,
					end,
				),
			),
		);
	const bladeDirection =
		{
			x: Math.cos(
				angle,
			),
			y: Math.sin(
				angle,
			),
		};
	const swingPosition =
		{
			x:
				pivot.x +
				bladeDirection.x *
					centerRadius,
			y:
				pivot.y +
				bladeDirection.y *
					centerRadius,
		};
	const trailFrom =
		toLocal(
			swingAngleAt(
				strike,
				Math.max(
					strike.startedAt,
					Math.min(
						now,
						end,
					) -
						SWING_TRAIL_MS,
				),
			),
		);
	const trail: StrikeTrail =
		{
			type: "arc",
			pivot,
			innerRadius,
			outerRadius,
			fromAngle:
				trailFrom,
			toAngle:
				angle,
			alpha: 1,
		};
	if (
		now <
		end
	) {
		return {
			position:
				swingPosition,
			direction:
				bladeDirection,
			trail,
		};
	}
	const k =
		easeOutQuad(
			(now -
				end) /
				STRIKE_RECOVERY_MS,
		);
	const restDirection =
		restDirectionOf(
			rest,
		);
	return {
		position:
			lerpPoint(
				swingPosition,
				rest.position,
				k,
			),
		direction:
			normalize(
				{
					x: lerp(
						bladeDirection.x,
						restDirection.x,
						k,
					),
					y: lerp(
						bladeDirection.y,
						restDirection.y,
						k,
					),
				},
			),
		trail:
			{
				...trail,
				alpha:
					1 -
					k,
			},
	};
}

/**
 * The blade lunges from its resting spot along the strike direction until
 * its tip reaches the strike reach, then pulls back.
 */
function computeThrustPose(
	strike: ThrustStrike,
	rest: RestPose,
	bladeLength: number,
	toLocal: (
		angle: number,
	) => number,
	now: number,
):
	| StrikePose
	| undefined {
	const end =
		strike.startedAt +
		strike.duration;
	if (
		now <
			strike.startedAt ||
		now >=
			end
	)
		return undefined;
	const pivot =
		weaponContainerOffset;
	const angle =
		toLocal(
			strike.centerAngle,
		);
	const bladeDirection =
		{
			x: Math.cos(
				angle,
			),
			y: Math.sin(
				angle,
			),
		};
	const extension =
		strike.reach >
		strike.innerRadius
			? (thrustExtensionAt(
					strike,
					now,
				) -
					strike.innerRadius) /
				(strike.reach -
					strike.innerRadius)
			: 0;
	const outerRadius =
		Math.max(
			strike.reach,
			bladeLength,
		);
	const extended =
		{
			x:
				pivot.x +
				bladeDirection.x *
					(outerRadius -
						bladeLength /
							2),
			y:
				pivot.y +
				bladeDirection.y *
					(outerRadius -
						bladeLength /
							2),
		};
	const position =
		lerpPoint(
			rest.position,
			extended,
			extension,
		);
	const restDirection =
		restDirectionOf(
			rest,
		);
	// Point the blade at the target while lunging, back to aiming at rest.
	const direction =
		normalize(
			{
				x: lerp(
					restDirection.x,
					bladeDirection.x,
					Math.min(
						1,
						extension *
							3,
					),
				),
				y: lerp(
					restDirection.y,
					bladeDirection.y,
					Math.min(
						1,
						extension *
							3,
					),
				),
			},
		);
	const tip =
		{
			x:
				position.x +
				bladeDirection.x *
					(bladeLength /
						2),
			y:
				position.y +
				bladeDirection.y *
					(bladeLength /
						2),
		};
	const extending =
		now <
		strike.startedAt +
			strike.duration *
				0.5;
	return {
		position,
		direction,
		trail:
			{
				type: "streak",
				from: rest.position,
				to: tip,
				width:
					bladeLength /
					3,
				alpha:
					extending
						? extension
						: extension *
							0.3,
			},
	};
}

const scaling = 0.125;
export class WeaponsSprite {
	#container =
		new PIXI.Container();
	#trailsContainer =
		new PIXI.Container();
	#trails =
		new Map<
			string,
			StrikeTrailSprite
		>();
	#weaponSprites =
		new Map<
			string,
			WeaponSprite
		>();
	#debug: boolean;

	constructor(
		debug: boolean = false,
	) {
		this.#debug =
			debug;
		this.#container.addChild(
			this
				.#trailsContainer,
		);
	}

	appendTo(
		parent: PIXI.Container,
	) {
		parent.addChild(
			this
				.#container,
		);
	}

	async update(
		bulbroState: BulbroState,
		now: NowTime,
	) {
		const weapons =
			bulbroState.weapons;
		const numberOfWeapons =
			weapons.length;

		// Remove weapons that are no longer present
		const currentWeaponIds =
			new Set(
				weapons.map(
					(
						w,
					) =>
						w.id,
				),
			);
		for (const [
			weaponId,
			weaponSprite,
		] of this
			.#weaponSprites) {
			if (
				!currentWeaponIds.has(
					weaponId,
				)
			) {
				weaponSprite.remove();
				this.#weaponSprites.delete(
					weaponId,
				);
				this.#trails
					.get(
						weaponId,
					)
					?.remove();
				this.#trails.delete(
					weaponId,
				);
			}
		}

		// Add or update weapons
		weapons.forEach(
			(
				weapon,
				i,
			) => {
				let weaponSprite =
					this.#weaponSprites.get(
						weapon.id,
					);

				if (
					!weaponSprite
				) {
					weaponSprite =
						new WeaponSprite(
							weapon.type,
							scaling,
							this
								.#debug,
						);
					weaponSprite.init();
					weaponSprite.appendTo(
						this
							.#container,
					);
					this.#weaponSprites.set(
						weapon.id,
						weaponSprite,
					);
				}

				// Position weapons around the bulbro character
				this.#positionWeapon(
					weaponSprite,
					weapon,
					i,
					numberOfWeapons,
					bulbroState.lastHorizontalDirection <
						0,
					now,
				);
			},
		);
	}

	#positionWeapon(
		weaponSprite: WeaponSprite,
		weapon: WeaponState,
		index: number,
		totalWeapons: number,
		facingLeft: boolean,
		now: NowTime,
	) {
		const position =
			calculateWeaponPosition(
				weapon,
				index,
				totalWeapons,
			);
		const pose =
			weapon.strike
				? computeStrikePose(
						weapon.strike,
						{
							position,
							direction:
								weapon.aimingDirection,
						},
						getWeaponSize(
							weapon.type,
						)
							.width *
							scaling,
						facingLeft,
						now,
					)
				: undefined;

		if (
			pose?.trail
		) {
			this.#trailFor(
				weapon.id,
			).draw(
				pose.trail,
			);
		} else {
			this.#trails
				.get(
					weapon.id,
				)
				?.hide();
		}

		// Set final position and rotation
		const finalPosition =
			pose?.position ??
			position;
		weaponSprite.updatePosition(
			finalPosition.x,
			finalPosition.y,
		);

		// Rotate weapon based on aiming (or swinging) direction
		weaponSprite.aim(
			pose?.direction ??
				weapon.aimingDirection,
		);
	}

	#trailFor(
		weaponId: string,
	) {
		let trail =
			this.#trails.get(
				weaponId,
			);
		if (
			!trail
		) {
			trail =
				new StrikeTrailSprite();
			trail.appendTo(
				this
					.#trailsContainer,
			);
			this.#trails.set(
				weaponId,
				trail,
			);
		}
		return trail;
	}

	remove() {
		// Remove all weapon sprites
		for (const weaponSprite of this.#weaponSprites.values()) {
			weaponSprite.remove();
		}
		this.#weaponSprites.clear();
		for (const trail of this.#trails.values()) {
			trail.remove();
		}
		this.#trails.clear();

		// Remove container from parent
		this.#container.removeFromParent();
	}
}

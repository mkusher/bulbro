import {
	circleIntersectsLine,
	type Direction,
	type Position,
} from "@/geometry";
import type {
	StrikeConfig,
	SwingStrikeConfig,
	ThrustStrikeConfig,
} from "@/weapon";

/** Time after a strike ends during which the weapon returns to its resting spot. */
export const STRIKE_RECOVERY_MS = 120;
/** A strike never takes longer than this share of the weapon cooldown. */
const MAX_STRIKE_COOLDOWN_SHARE = 0.8;
/** Share of the reach occupied by the arm/handle (the blade covers the rest). */
const HANDLE_SHARE = 0.2;
/** How much of a swing's knockback goes along the blade instead of straight away from the pivot. */
const TANGENTIAL_KNOCKBACK_SHARE = 0.4;
/** Share of a thrust spent lunging out; the rest is pulling back. */
const THRUST_EXTEND_SHARE = 0.4;

type BaseStrike =
	{
		startedAt: number;
		/** Duration of the active part of the strike, in ms */
		duration: number;
		/** World angle (`Math.atan2(y, x)`) pointing at the target */
		centerAngle: number;
		/** Distance from the pivot to the blade tip at full extent */
		reach: number;
		/** Distance from the pivot where the blade starts (the tip at rest for thrusts) */
		innerRadius: number;
		damage: number;
		knockback: number;
		targetId: string;
		/** Targets already hit by this strike; every target is hit at most once */
		hitTargetIds: string[];
		/** Time up to which the strike has already been checked for hits */
		sweptUntil: number;
		/** Position of this strike in its weapon's combo, if the weapon has one */
		comboStep?: number;
	};

/**
 * The weapon rotates around the striker sweeping an annular sector
 * from `centerAngle - arc/2` to `centerAngle + arc/2` (or back for `sweep = -1`).
 */
export type SwingStrike =
	BaseStrike & {
		type: "swing";
		/** Total swept angle in radians */
		arc: number;
		/** 1 = angle grows (clockwise on screen), -1 = angle shrinks */
		sweep:
			| 1
			| -1;
	};

/**
 * The weapon lunges from `innerRadius` to `reach` along `centerAngle`
 * and pulls back.
 */
export type ThrustStrike =
	BaseStrike & {
		type: "thrust";
	};

export type MeleeStrike =
	| SwingStrike
	| ThrustStrike;

export type StrikeParams =
	{
		now: number;
		pivot: Position;
		target: Position;
		targetId: string;
		reach: number;
		damage: number;
		knockback: number;
		/** Cooldown between attacks of the weapon, in ms */
		cooldown: number;
		/** Previous strike of the same weapon, used to alternate swing direction */
		previous?: MeleeStrike;
	};

function createBaseStrike(
	{
		now,
		pivot,
		target,
		targetId,
		reach,
		damage,
		knockback,
		cooldown,
	}: StrikeParams,
	duration: number,
): BaseStrike {
	return {
		startedAt:
			now,
		duration:
			Math.min(
				duration,
				cooldown *
					MAX_STRIKE_COOLDOWN_SHARE,
			),
		centerAngle:
			Math.atan2(
				target.y -
					pivot.y,
				target.x -
					pivot.x,
			),
		reach,
		innerRadius:
			reach *
			HANDLE_SHARE,
		damage,
		knockback,
		targetId,
		hitTargetIds:
			[],
		sweptUntil:
			now,
	};
}

export function createSwingStrike(
	config: SwingStrikeConfig,
	params: StrikeParams,
): SwingStrike {
	return {
		...createBaseStrike(
			params,
			config.duration,
		),
		type: "swing",
		arc:
			(config.arc *
				Math.PI) /
			180,
		sweep:
			params
				.previous
				?.type ===
				"swing" &&
			params
				.previous
				.sweep ===
				1
				? -1
				: 1,
	};
}

export function createThrustStrike(
	config: ThrustStrikeConfig,
	params: StrikeParams,
): ThrustStrike {
	return {
		...createBaseStrike(
			params,
			config.duration,
		),
		type: "thrust",
	};
}

export function createStrike(
	config: StrikeConfig,
	params: StrikeParams,
): MeleeStrike {
	switch (
		config.type
	) {
		case "combo": {
			// Continue the combo after the previous strike, starting over at the end.
			const previousStep =
				params
					.previous
					?.comboStep;
			const comboStep =
				previousStep ===
				undefined
					? 0
					: (previousStep +
							1) %
						config
							.strikes
							.length;
			const strikeConfig =
				config
					.strikes[
					comboStep
				];
			if (
				!strikeConfig
			)
				throw new Error(
					"Combo strike config has no strikes",
				);
			return {
				...createStrike(
					strikeConfig,
					params,
				),
				comboStep,
			};
		}
		case "swing":
			return createSwingStrike(
				config,
				params,
			);
		case "thrust":
			return createThrustStrike(
				config,
				params,
			);
	}
}

/** Ease-in-out: the blade accelerates out of the wind-up and decelerates at follow-through. */
function easeInOutSine(
	t: number,
) {
	return (
		-(
			Math.cos(
				Math.PI *
					t,
			) -
			1
		) /
		2
	);
}

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

/** Linear (not eased) progress of the strike in [0, 1]. */
export function strikeProgress(
	strike: MeleeStrike,
	now: number,
) {
	if (
		strike.duration <=
		0
	)
		return 1;
	return Math.min(
		1,
		Math.max(
			0,
			(now -
				strike.startedAt) /
				strike.duration,
		),
	);
}

/** World angle of the blade at the given time. */
export function swingAngleAt(
	strike: SwingStrike,
	now: number,
) {
	const startAngle =
		strike.centerAngle -
		(strike.sweep *
			strike.arc) /
			2;
	return (
		startAngle +
		strike.sweep *
			strike.arc *
			easeInOutSine(
				strikeProgress(
					strike,
					now,
				),
			)
	);
}

/** Time of the thrust's full extent. */
function thrustPeakAt(
	strike: ThrustStrike,
) {
	return (
		strike.startedAt +
		strike.duration *
			THRUST_EXTEND_SHARE
	);
}

/**
 * Distance from the pivot to the blade tip of a thrust at the given time:
 * a fast lunge out to the full reach followed by a slower pull back.
 */
export function thrustExtensionAt(
	strike: ThrustStrike,
	now: number,
) {
	const progress =
		strikeProgress(
			strike,
			now,
		);
	const extension =
		progress <
		THRUST_EXTEND_SHARE
			? easeOutQuad(
					progress /
						THRUST_EXTEND_SHARE,
				)
			: 1 -
				easeInOutSine(
					(progress -
						THRUST_EXTEND_SHARE) /
						(1 -
							THRUST_EXTEND_SHARE),
				);
	return (
		strike.innerRadius +
		(strike.reach -
			strike.innerRadius) *
			extension
	);
}

/** Whether the strike is still active (and can hit) at the given time. */
export function isStriking(
	strike:
		| MeleeStrike
		| undefined,
	now: number,
): strike is MeleeStrike {
	return (
		strike !==
			undefined &&
		now >=
			strike.startedAt &&
		now <
			strike.startedAt +
				strike.duration
	);
}

/** Normalizes an angle into (-PI, PI]. */
export function normalizeAngle(
	angle: number,
) {
	const tau =
		Math.PI *
		2;
	let a =
		angle %
		tau;
	if (
		a <=
		-Math.PI
	)
		a +=
			tau;
	if (
		a >
		Math.PI
	)
		a -=
			tau;
	return a;
}

/**
 * Whether a circle intersects an annular sector centered at `pivot`
 * between radii [innerRadius, outerRadius] and angles [fromAngle, toAngle]
 * (in either order, spanning less than a full turn).
 */
export function circleIntersectsSector(
	center: Position,
	radius: number,
	pivot: Position,
	innerRadius: number,
	outerRadius: number,
	fromAngle: number,
	toAngle: number,
) {
	const dx =
		center.x -
		pivot.x;
	const dy =
		center.y -
		pivot.y;
	const d =
		Math.hypot(
			dx,
			dy,
		);
	if (
		d -
			radius >
			outerRadius ||
		d +
			radius <
			innerRadius
	)
		return false;
	if (
		d <=
		radius
	)
		return true;
	// Widen the wedge by the angle the circle occupies as seen from the pivot.
	const angularPadding =
		Math.asin(
			radius /
				d,
		);
	const halfSpan =
		Math.abs(
			toAngle -
				fromAngle,
		) /
		2;
	const middle =
		(fromAngle +
			toAngle) /
		2;
	const offset =
		normalizeAngle(
			Math.atan2(
				dy,
				dx,
			) -
				middle,
		);
	return (
		Math.abs(
			offset,
		) <=
		halfSpan +
			angularPadding
	);
}

export type StrikeTarget =
	{
		id: string;
		position: Position;
	};

/** Whether the blade touched a circle between `start` and `end`. */
function strikeTouches(
	strike: MeleeStrike,
	pivot: Position,
	center: Position,
	radius: number,
	start: number,
	end: number,
) {
	switch (
		strike.type
	) {
		case "swing":
			return circleIntersectsSector(
				center,
				radius,
				pivot,
				strike.innerRadius,
				strike.reach,
				swingAngleAt(
					strike,
					start,
				),
				swingAngleAt(
					strike,
					end,
				),
			);
		case "thrust": {
			// The blade covers the line from the handle to the tip, so the
			// swept area is that line up to the farthest tip position.
			const peak =
				thrustPeakAt(
					strike,
				);
			const tip =
				start <=
					peak &&
				end >=
					peak
					? strike.reach
					: Math.max(
							thrustExtensionAt(
								strike,
								start,
							),
							thrustExtensionAt(
								strike,
								end,
							),
						);
			const cos =
				Math.cos(
					strike.centerAngle,
				);
			const sin =
				Math.sin(
					strike.centerAngle,
				);
			return circleIntersectsLine(
				{
					x: center.x,
					y: center.y,
					radius,
				},
				{
					start:
						{
							x:
								pivot.x +
								cos *
									strike.innerRadius,
							y:
								pivot.y +
								sin *
									strike.innerRadius,
						},
					end: {
						x:
							pivot.x +
							cos *
								tip,
						y:
							pivot.y +
							sin *
								tip,
					},
				},
			);
		}
	}
}

/**
 * Finds targets touched by the blade between `from` and `to` (clamped to the
 * strike's active window). Targets already hit by this strike are skipped.
 */
export function findStrikeHits<
	T extends
		StrikeTarget,
>(
	strike: MeleeStrike,
	pivot: Position,
	targets: readonly T[],
	/** Radius of a target's body, or a function of the target */
	targetRadius:
		| number
		| ((
				target: T,
		  ) => number),
	from: number,
	to: number,
): T[] {
	const start =
		Math.max(
			from,
			strike.startedAt,
		);
	const end =
		Math.min(
			to,
			strike.startedAt +
				strike.duration,
		);
	if (
		end <
		start
	)
		return [];
	return targets.filter(
		(
			target,
		) =>
			!strike.hitTargetIds.includes(
				target.id,
			) &&
			strikeTouches(
				strike,
				pivot,
				target.position,
				typeof targetRadius ===
					"number"
					? targetRadius
					: targetRadius(
							target,
						),
				start,
				end,
			),
	);
}

function unit(
	x: number,
	y: number,
	fallback: Direction,
): Direction {
	const length =
		Math.hypot(
			x,
			y,
		);
	return length >
		0
		? {
				x:
					x /
					length,
				y:
					y /
					length,
			}
		: fallback;
}

/**
 * Direction a strike pushes a target. Thrusts push along the lunge; swings
 * push mostly away from the pivot, partially along the blade movement.
 */
export function strikeKnockbackDirection(
	strike: MeleeStrike,
	pivot: Position,
	target: Position,
	now: number,
): Direction {
	if (
		strike.type ===
		"thrust"
	)
		return {
			x: Math.cos(
				strike.centerAngle,
			),
			y: Math.sin(
				strike.centerAngle,
			),
		};
	const angle =
		swingAngleAt(
			strike,
			now,
		);
	const radial =
		unit(
			target.x -
				pivot.x,
			target.y -
				pivot.y,
			{
				x: Math.cos(
					angle,
				),
				y: Math.sin(
					angle,
				),
			},
		);
	const tangent =
		{
			x:
				-Math.sin(
					angle,
				) *
				strike.sweep,
			y:
				Math.cos(
					angle,
				) *
				strike.sweep,
		};
	return unit(
		radial.x *
			(1 -
				TANGENTIAL_KNOCKBACK_SHARE) +
			tangent.x *
				TANGENTIAL_KNOCKBACK_SHARE,
		radial.y *
			(1 -
				TANGENTIAL_KNOCKBACK_SHARE) +
			tangent.y *
				TANGENTIAL_KNOCKBACK_SHARE,
		radial,
	);
}

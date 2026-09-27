import * as PIXI from "pixi.js";
import type { Position } from "@/geometry";

const slices = 8;
const segmentsPerSlice = 3;
const trailColor = 0xffffff;
const edgeColor = 0xfff6c8;

/** Annular sector left behind by a swinging blade. */
export type ArcTrail =
	{
		type: "arc";
		pivot: Position;
		innerRadius: number;
		outerRadius: number;
		/** Angle of the oldest visible point of the trail */
		fromAngle: number;
		/** Current blade angle */
		toAngle: number;
		/** Overall opacity multiplier in [0, 1] */
		alpha: number;
	};

/** Straight motion streak left behind by a thrusting blade. */
export type StreakTrail =
	{
		type: "streak";
		from: Position;
		/** Current blade tip */
		to: Position;
		width: number;
		/** Overall opacity multiplier in [0, 1] */
		alpha: number;
	};

export type StrikeTrail =
	| ArcTrail
	| StreakTrail;

/**
 * Motion trail left by a striking blade, fading out towards its oldest part.
 */
export class StrikeTrailSprite {
	#gfx =
		new PIXI.Graphics();

	appendTo(
		parent: PIXI.Container,
	) {
		parent.addChild(
			this
				.#gfx,
		);
	}

	hide() {
		this.#gfx.clear();
		this.#gfx.visible = false;
	}

	draw(
		trail: StrikeTrail,
	) {
		this.#gfx.clear();
		this.#gfx.visible = true;
		if (
			trail.alpha <=
			0
		)
			return;
		switch (
			trail.type
		) {
			case "arc":
				this.#drawArc(
					trail,
				);
				break;
			case "streak":
				this.#drawStreak(
					trail,
				);
				break;
		}
	}

	#drawArc({
		pivot,
		innerRadius,
		outerRadius,
		fromAngle,
		toAngle,
		alpha,
	}: ArcTrail) {
		if (
			fromAngle ===
			toAngle
		)
			return;
		const gfx =
			this
				.#gfx;
		const at =
			(
				angle: number,
				radius: number,
			) => [
				pivot.x +
					Math.cos(
						angle,
					) *
						radius,
				pivot.y +
					Math.sin(
						angle,
					) *
						radius,
			];
		const step =
			(toAngle -
				fromAngle) /
			slices;
		for (
			let i = 0;
			i <
			slices;
			i++
		) {
			const a0 =
				fromAngle +
				step *
					i;
			const a1 =
				a0 +
				step;
			// Older slices are more transparent.
			const sliceAlpha =
				((i +
					1) /
					slices) **
					2 *
				0.45 *
				alpha;
			const points: number[] =
				[];
			for (
				let j = 0;
				j <=
				segmentsPerSlice;
				j++
			) {
				points.push(
					...at(
						a0 +
							((a1 -
								a0) *
								j) /
								segmentsPerSlice,
						outerRadius,
					),
				);
			}
			for (
				let j =
					segmentsPerSlice;
				j >=
				0;
				j--
			) {
				points.push(
					...at(
						a0 +
							((a1 -
								a0) *
								j) /
								segmentsPerSlice,
						innerRadius,
					),
				);
			}
			gfx
				.poly(
					points,
				)
				.fill(
					{
						color:
							trailColor,
						alpha:
							sliceAlpha,
					},
				);
		}
		const [
			innerX,
			innerY,
		] =
			at(
				toAngle,
				innerRadius,
			);
		const [
			outerX,
			outerY,
		] =
			at(
				toAngle,
				outerRadius,
			);
		gfx
			.moveTo(
				innerX!,
				innerY!,
			)
			.lineTo(
				outerX!,
				outerY!,
			)
			.stroke(
				{
					color:
						edgeColor,
					width: 2,
					alpha:
						0.8 *
						alpha,
				},
			);
	}

	#drawStreak({
		from,
		to,
		width,
		alpha,
	}: StreakTrail) {
		const dx =
			to.x -
			from.x;
		const dy =
			to.y -
			from.y;
		const length =
			Math.hypot(
				dx,
				dy,
			);
		if (
			length ===
			0
		)
			return;
		const gfx =
			this
				.#gfx;
		// Normal to the streak, scaled to half of its width
		const nx =
			(-dy /
				length) *
			(width /
				2);
		const ny =
			(dx /
				length) *
			(width /
				2);
		for (
			let i = 0;
			i <
			slices;
			i++
		) {
			const t0 =
				i /
				slices;
			const t1 =
				(i +
					1) /
				slices;
			// Slices closer to the tip are wider and more opaque.
			const w0 =
				t0;
			const w1 =
				t1;
			const sliceAlpha =
				t1 **
					2 *
				0.5 *
				alpha;
			const x0 =
				from.x +
				dx *
					t0;
			const y0 =
				from.y +
				dy *
					t0;
			const x1 =
				from.x +
				dx *
					t1;
			const y1 =
				from.y +
				dy *
					t1;
			gfx
				.poly(
					[
						x0 +
							nx *
								w0,
						y0 +
							ny *
								w0,
						x1 +
							nx *
								w1,
						y1 +
							ny *
								w1,
						x1 -
							nx *
								w1,
						y1 -
							ny *
								w1,
						x0 -
							nx *
								w0,
						y0 -
							ny *
								w0,
					],
				)
				.fill(
					{
						color:
							trailColor,
						alpha:
							sliceAlpha,
					},
				);
		}
		gfx
			.moveTo(
				from.x +
					dx *
						0.5,
				from.y +
					dy *
						0.5,
			)
			.lineTo(
				to.x,
				to.y,
			)
			.stroke(
				{
					color:
						edgeColor,
					width: 1.5,
					alpha:
						0.7 *
						alpha,
				},
			);
	}

	remove() {
		this.#gfx.removeFromParent();
		this.#gfx.destroy();
	}
}

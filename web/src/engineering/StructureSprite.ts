import * as PIXI from "pixi.js";
import {
	STRUCTURE_SPAWN_DURATION,
	type Structure,
} from "./structures";

/** Small vector sprites share the same visual language as projectiles. */
export class StructureSprite extends PIXI.Container {
	private body: PIXI.Graphics;
	private spawnCross =
		new PIXI.Graphics()
			.moveTo(
				-10,
				-10,
			)
			.lineTo(
				10,
				10,
			)
			.moveTo(
				-10,
				10,
			)
			.lineTo(
				10,
				-10,
			)
			.stroke(
				{
					width: 7,
					color: 0x55baff,
					cap: "round",
				},
			);
	private barrel =
		new PIXI.Graphics();
	constructor(
		structure: Structure,
	) {
		super();
		const outline =
			{
				width: 2,
				color: 0x202a28,
			};
		const body =
			new PIXI.Graphics()
				.ellipse(
					0,
					13,
					24,
					9,
				)
				.fill(
					{
						color: 0x161d18,
						alpha: 0.25,
					},
				);
		if (
			structure.kind ===
			"garden"
		) {
			body
				.roundRect(
					-25,
					-14,
					50,
					36,
					6,
				)
				.fill(
					0x8c603d,
				)
				.stroke(
					outline,
				);
			for (const x of [
				-15,
				0,
				15,
			])
				body
					.moveTo(
						x,
						12,
					)
					.lineTo(
						x,
						-9,
					)
					.stroke(
						{
							width: 3,
							color: 0x719f47,
						},
					)
					.ellipse(
						x -
							5,
						-4,
						6,
						3,
					)
					.fill(
						0x93bd58,
					)
					.ellipse(
						x +
							5,
						-10,
						6,
						3,
					)
					.fill(
						0x93bd58,
					);
		} else if (
			structure.kind ===
			"landmine"
		) {
			body
				.ellipse(
					0,
					4,
					17,
					10,
				)
				.fill(
					0x75805c,
				)
				.stroke(
					outline,
				)
				.ellipse(
					0,
					-1,
					12,
					7,
				)
				.fill(
					0x48553c,
				)
				.stroke(
					outline,
				)
				.circle(
					0,
					-3,
					3,
				)
				.fill(
					structure.armed
						? 0xff493f
						: 0xeec45d,
				);
		} else {
			const color =
				structure.kind ===
				"medicalTurret"
					? 0xe4ede0
					: structure.kind ===
							"laserTurret"
						? 0xb28ae8
						: structure.kind ===
								"explosiveTurret"
							? 0xc97853
							: structure.kind ===
									"incendiaryTurret"
								? 0xe3ae45
								: 0x8a9b6c;
			body
				.moveTo(
					-15,
					9,
				)
				.lineTo(
					-23,
					23,
				)
				.moveTo(
					15,
					9,
				)
				.lineTo(
					23,
					23,
				)
				.stroke(
					{
						width: 7,
						color: 0x414f42,
					},
				)
				.roundRect(
					-18,
					-12,
					36,
					29,
					7,
				)
				.fill(
					color,
				)
				.stroke(
					outline,
				);
			this.barrel
				.roundRect(
					0,
					-5,
					31,
					10,
					3,
				)
				.fill(
					0x4d5d56,
				)
				.stroke(
					outline,
				)
				.roundRect(
					25,
					-6,
					8,
					12,
					2,
				)
				.fill(
					color,
				)
				.stroke(
					outline,
				);
			if (
				structure.kind ===
				"medicalTurret"
			)
				body
					.rect(
						-3,
						-8,
						6,
						20,
					)
					.rect(
						-10,
						-1,
						20,
						6,
					)
					.fill(
						0xd34d4a,
					);
		}
		this.body =
			body;
		this.addChild(
			this
				.spawnCross,
		);
		this.addChild(
			body,
			this
				.barrel,
		);
		this.update(
			structure,
		);
	}
	update(
		s: Structure,
		now = Date.now(),
	) {
		const elapsed =
			now -
			(s.spawnStartedAt ??
				-Infinity);
		const spawning =
			elapsed <
			STRUCTURE_SPAWN_DURATION;
		this.spawnCross.visible =
			spawning;
		this.spawnCross.alpha =
			spawning
				? 0.35 +
					Math.abs(
						Math.sin(
							(elapsed *
								Math.PI) /
								400,
						),
					) *
						0.65
				: 1;
		this.body.visible =
			!spawning;
		this.barrel.visible =
			!spawning;
		this.position.set(
			s
				.position
				.x,
			s
				.position
				.y,
		);
		this.barrel.rotation =
			Math.atan2(
				s
					.aim
					?.y ??
					0,
				s
					.aim
					?.x ??
					1,
			);
	}
}

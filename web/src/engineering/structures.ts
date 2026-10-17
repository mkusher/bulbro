import type { Position } from "@/geometry";

export type StructureKind =
	| "turret"
	| "medicalTurret"
	| "laserTurret"
	| "explosiveTurret"
	| "incendiaryTurret"
	| "garden"
	| "landmineSource"
	| "landmine"
	| "burn";

/** Plain data so structures and their timers survive network snapshots. */
export interface Structure {
	type: "structure";
	id: string;
	ownerId: string;
	kind: StructureKind;
	position: Position;
	/** Host clock timestamp; absent for structures from older snapshots. */
	spawnStartedAt?: number;
	nextActionAt: number;
	interval: number;
	aim?: Position;
	armed?: boolean;
	targetId?: string;
	damage?: number;
	ticksLeft?: number;
}

/** Wiki item/tooltip values; primary damage, range and attack speed never apply. */
export const turretParameters =
	{
		turret:
			{
				damage: 10,
				scaling: 0.8,
				range: 300,
				cooldown: 730,
			},
		medicalTurret:
			{
				damage: 3,
				scaling: 0.05,
				range: 400,
				cooldown: 2200,
			},
		laserTurret:
			{
				damage: 20,
				scaling: 1.25,
				range: 400,
				cooldown: 870,
			},
		explosiveTurret:
			{
				damage: 25,
				scaling: 1.5,
				range: 500,
				cooldown: 870,
			},
		incendiaryTurret:
			{
				damage: 1,
				scaling: 0,
				range: 300,
				cooldown: 280,
			},
	} as const;

export const wrenchTurrets =
	[
		"turret",
		"incendiaryTurret",
		"laserTurret",
		"explosiveTurret",
	] as const;
export const gardenIntervals =
	[
		15000,
		14000,
		12000,
		10000,
	] as const;
export const mineIntervals =
	[
		12000,
		9000,
		6000,
		3000,
	] as const;
export const STRUCTURE_SPAWN_DURATION = 1000;
export const MINE_TRIGGER_RADIUS = 20;
// World units, matching the game's grenade blast radius.
export const MINE_EXPLOSION_RADIUS = 100;
export const TURRET_EXPLOSION_RADIUS = 100;

export function engineeringAmount(
	base: number,
	scaling: number,
	engineering: number,
) {
	return Math.max(
		1,
		Math.floor(
			base +
				scaling *
					engineering,
		),
	);
}

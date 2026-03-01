import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import type { WaveSpawner } from "./WaveSpawner";
import {
	BabySpawner,
	ColoradoBeetleSpawner,
	BeetleWarriorSpawner,
	AphidSpawner,
	RoachSpawner,
	HedgehogSpawner,
	WildBoarSpawner,
	BadgerSpawner,
	BeetleArcherSpawner,
} from "./enemy-spawners";

export class DefaultWaveSpawner
	implements
		WaveSpawner
{
	private spawners: WaveSpawner[] =
		[
			new BabySpawner(),
			new ColoradoBeetleSpawner(),
			new BeetleWarriorSpawner(),
			new BeetleArcherSpawner(),
			new AphidSpawner(),
			new RoachSpawner(),
			new HedgehogSpawner(),
			new WildBoarSpawner(),
			new BadgerSpawner(),
		];

	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[] {
		return this.spawners.flatMap(
			(
				s,
			) =>
				s.tick(
					waveState,
					deltaTime,
					now,
				),
		);
	}
}

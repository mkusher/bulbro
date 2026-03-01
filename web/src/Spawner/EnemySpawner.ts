import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import {
	AphidSpawner,
	BabySpawner,
	BadgerSpawner,
	BeetleArcherSpawner,
	BeetleWarriorSpawner,
	ColoradoBeetleSpawner,
	HedgehogSpawner,
	RoachSpawner,
	WildBoarSpawner,
} from "./enemy-spawners";

type SpawnerLogic =
	{
		tick(
			waveState: WaveState,
			deltaTime: DeltaTime,
			now: NowTime,
		): EnemyEvent[];
	};

const spawners: SpawnerLogic[] =
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

export class EnemySpawner {
	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[] {
		return spawners.flatMap(
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

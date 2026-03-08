import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
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
} from "../../Spawner/enemy-spawners";
import type { EventGenerator } from "./EventGenerator";

type SpawnerLogic =
	{
		tick(
			waveState: WaveState,
			deltaTime: DeltaTime,
			now: NowTime,
		): GameEventInternal[];
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

export class EnemySpawnEventsGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEventInternal[] {
		return spawners.flatMap(
			(
				s,
			) =>
				s.tick(
					state,
					deltaTime,
					now,
				),
		);
	}
}

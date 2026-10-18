import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import {
	TreeSpawner,
	WaveGroupsSpawner,
} from "../../Spawner/enemy-spawners";
import { applyEnemyCap } from "../../Spawner/enemyCap";
import type { WaveState } from "../../waveState";
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
		new WaveGroupsSpawner(),
		new TreeSpawner(),
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
		return applyEnemyCap(
			state,
			spawners.flatMap(
				(
					s,
				) =>
					s.tick(
						state,
						deltaTime,
						now,
					),
			),
		);
	}
}

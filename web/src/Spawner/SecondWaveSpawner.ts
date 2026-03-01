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
} from "./enemy-spawners";

export class SecondWaveSpawner
	implements
		WaveSpawner
{
	private spawners: WaveSpawner[] =
		[
			new BabySpawner(),
			new ColoradoBeetleSpawner(),
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

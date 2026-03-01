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
} from "./enemy-spawners";

export class FourthWaveSpawner
	implements
		WaveSpawner
{
	private spawners: WaveSpawner[] =
		[
			new BabySpawner(),
			new ColoradoBeetleSpawner(),
			new BeetleWarriorSpawner(),
			new AphidSpawner(),
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

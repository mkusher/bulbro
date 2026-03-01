import type { EnemyEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import type { WaveSpawner } from "./WaveSpawner";
import { DefaultWaveSpawner } from "./DefaultWaveSpawner";
import { FirstWaveSpawner } from "./FirstWaveSpawner";
import { FourthWaveSpawner } from "./FourthWaveSpawner";
import { SecondWaveSpawner } from "./SecondWaveSpawner";
import { ThirdWaveSpawner } from "./ThirdWaveSpawner";

const spawners =
	new Map<
		number,
		WaveSpawner
	>(
		[
			[
				1,
				new FirstWaveSpawner(),
			],
			[
				2,
				new SecondWaveSpawner(),
			],
			[
				3,
				new ThirdWaveSpawner(),
			],
			[
				4,
				new FourthWaveSpawner(),
			],
		],
	);

const defaultSpawner: WaveSpawner =
	new DefaultWaveSpawner();

export class EnemySpawner {
	tick(
		waveState: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): EnemyEvent[] {
		const wave =
			waveState
				.round
				.wave;
		const spawner =
			spawners.get(
				wave,
			) ??
			defaultSpawner;
		return spawner.tick(
			waveState,
			deltaTime,
			now,
		);
	}
}

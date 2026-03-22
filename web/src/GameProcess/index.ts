import type { PlayerControl } from "../controls";
import type { Difficulty } from "../game-formulas";
import type {
	GameEvent,
	GameEventQueue,
} from "../game-events/GameEvents";
import type { Player } from "../player";
import type {
	DeltaTime,
	NowTime,
} from "../time";
import type { WaveState } from "../waveState";
import type { Logger } from "pino";

export interface TickProcess {
	tick(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEvent[];
}

export interface WaveProcess {
	readonly gameCanvas:
		| HTMLCanvasElement
		| undefined;
	init(): Promise<this>;
	start(): Promise<
		| "win"
		| "fail"
	>;
	now(): NowTime;
	stop(
		type:
			| "win"
			| "fail",
	): Promise<
		| "win"
		| "fail"
	>;
	tick: () => void;
	readonly eventQueue: GameEventQueue;
}

export type WavePromises =
	{
		waveInitPromise: Promise<WaveProcess>;
		wavePromise: Promise<
			| "win"
			| "fail"
			| undefined
		>;
	};

export interface GameProcess {
	start(
		players: Player[],
		playerControls: PlayerControl[],
		difficulty: Difficulty,
	): WavePromises;
	startWave(
		playerControls: PlayerControl[],
	): WavePromises;
	startNextWave(
		state: WaveState,
	): Promise<WavePromises>;
	readonly gameCanvas:
		| HTMLCanvasElement
		| undefined;
	readonly waveProcess:
		| WaveProcess
		| undefined;
}

export interface GameEventsProcessor {
	handleEvents(
		events: GameEvent[],
	): void;
}

export type TickProcessFactory =
	(
		logger: Logger,
		controls: PlayerControl[],
	) => TickProcess;

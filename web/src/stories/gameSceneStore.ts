import { signal } from "@preact/signals";
import * as PIXI from "pixi.js";
import type { WaveState } from "@/waveState";
import { TickProcess } from "@/TickProcess";
import { createMainControls } from "@/controls";
import { StorybookSceneWithUi } from "@/graphics/StorybookSceneWithUi";
import { logger as defaultLogger } from "@/logger";
import { InMemoryGameEventQueue } from "@/game-events/GameEventQueue";
import { AutoCenterOnPlayerCamera } from "@/graphics/AutoCenterOnPlayerCamera";
import { canvasSize, classicMapSize } from "@/game-canvas";
import { deltaTime, nowTime } from "@/time";

export type GameSceneState = "stopped" | "playing" | "paused";

export interface GameSceneConfig {
	initialState: WaveState;
	backgroundType?: number;
	debug?: boolean;
	width?: number;
	height?: number;
	onStateUpdate?: (state: WaveState) => WaveState;
}

// Exported signals for reactive state
export const sceneState = signal<GameSceneState>("stopped");
export const gameState = signal<WaveState | null>(null);
export const tickCount = signal(0);
export const elapsedTime = signal(0);
export const isInitialized = signal(false);

// Internal state
let camera: AutoCenterOnPlayerCamera | null = null;
let scene: StorybookSceneWithUi | null = null;
let eventQueue = new InMemoryGameEventQueue();
let controls = createMainControls();
let playTimer: Timer | null = null;
let config: GameSceneConfig | null = null;

const sceneWrapper = {
	totalTime: 0,
	update: (dt: number, now: number, state: WaveState) => {
		sceneWrapper.totalTime += dt;
		scene?.update(deltaTime(dt), nowTime(now), state);
	},
} as any;

// Ticker callback
const tickerCallback = (ticker: PIXI.Ticker) => {
	if (sceneState.value !== "playing" || !gameState.value) {
		return;
	}

	const dt = ticker.deltaMS;
	const now = performance.now();

	const tickProcess = new TickProcess(
		defaultLogger,
		sceneWrapper,
		[controls],
		eventQueue,
		config?.debug || false,
	);
	const newState = tickProcess.tick(
		gameState.value,
		deltaTime(dt),
		nowTime(now),
	);

	gameState.value = newState;
	config?.onStateUpdate?.(newState);
	tickCount.value += 1;
	elapsedTime.value += dt / 1000;
};

// Exported functions to control the game scene
export async function initialize(
	container: HTMLDivElement,
	newConfig: GameSceneConfig,
): Promise<void> {
	if (isInitialized.value || camera || scene) {
		destroy();
	}

	config = newConfig;
	gameState.value = config.initialState;

	try {
		const width = config.width || 800;
		const height = config.height || 600;

		canvasSize.value = { width, height };

		camera = new AutoCenterOnPlayerCamera();
		await camera.init({ width, height });

		const minimalCameraSize = {
			width: 1500,
			height: 1125,
		};

		const fitWidth =
			width / classicMapSize.width < height / classicMapSize.height;
		const scale = fitWidth
			? Math.max(width, minimalCameraSize.width) / classicMapSize.width
			: Math.max(height, minimalCameraSize.height) / classicMapSize.height;

		camera.zoom(scale);

		container.appendChild(camera.canvas as HTMLCanvasElement);

		scene = new StorybookSceneWithUi(
			defaultLogger,
			config.debug || false,
			camera,
			scale,
		);

		await scene.init(gameState.value);

		// Set up ticker callback
		if (camera.ticker) {
			camera.ticker.add(tickerCallback);
		}

		isInitialized.value = true;
		console.log("GameScene: Initialized successfully");
	} catch (error) {
		console.error("GameScene: Initialization failed:", error);
		throw error;
	}
}

export async function play(): Promise<void> {
	if (sceneState.value === "playing") return;

	// Start controls before setting state to playing
	await controls.start();

	sceneState.value = "playing";
	if (playTimer) {
		clearTimeout(playTimer);
		playTimer = null;
	}
}

export async function pause(): Promise<void> {
	if (sceneState.value !== "playing") return;

	sceneState.value = "paused";
	// Stop controls when pausing
	await controls.stop();

	if (playTimer) {
		clearTimeout(playTimer);
		playTimer = null;
	}
}

export async function playPause(): Promise<void> {
	if (sceneState.value === "playing") {
		await pause();
	} else {
		await play();
	}
}

export async function stop(): Promise<void> {
	sceneState.value = "stopped";
	gameState.value = config?.initialState || null;
	tickCount.value = 0;
	elapsedTime.value = 0;

	// Stop controls when stopping
	await controls.stop();

	if (playTimer) {
		clearTimeout(playTimer);
		playTimer = null;
	}

	// Update scene with initial state
	if (scene && gameState.value) {
		scene.update(deltaTime(0), nowTime(0), gameState.value);
	}
}

export function step(stepSize: number = 1): void {
	sceneState.value = "paused";

	if (!gameState.value) return;

	for (let i = 0; i < stepSize; i++) {
		const dt = 1 / 60; // 60 FPS
		const now = Date.now();
		const tickProcess = new TickProcess(
			defaultLogger,
			sceneWrapper,
			[controls],
			eventQueue,
			config?.debug || false,
		);

		if (config?.onStateUpdate) {
			gameState.value = config.onStateUpdate(gameState.value);
		} else {
			const newState = tickProcess.tick(
				gameState.value,
				deltaTime(dt),
				nowTime(now),
			);
			gameState.value = newState;
		}
		tickCount.value += 1;
		elapsedTime.value += dt;
	}
}

export async function playTimed(duration: number): Promise<void> {
	await play();

	if (playTimer) {
		clearTimeout(playTimer);
	}

	playTimer = setTimeout(async () => {
		await pause();
		playTimer = null;
	}, duration * 1000);
}

export function updateConfig(newConfig: Partial<GameSceneConfig>): void {
	if (!config) return;

	config = { ...config, ...newConfig };

	// If initial state changed, update game state when stopped
	if (newConfig.initialState && sceneState.value === "stopped") {
		gameState.value = newConfig.initialState;
		if (scene) {
			scene.update(deltaTime(0), nowTime(0), newConfig.initialState);
		}
	}
}

export async function destroy(): Promise<void> {
	if (camera?.ticker) {
		camera.ticker.remove(tickerCallback);
	}

	// Stop controls when destroying
	await controls.stop();

	if (playTimer) {
		clearTimeout(playTimer);
		playTimer = null;
	}

	scene = null;
	camera = null;
	config = null;
	isInitialized.value = false;
}

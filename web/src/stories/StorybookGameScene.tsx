import {
	useEffect,
	useRef,
} from "preact/hooks";
import { TouchscreenJoystick } from "../controls/TouchscreenJoystick";
import type { WaveState } from "../waveState";
import { GameSceneControls } from "./GameSceneControls";
import { GameStatsOverlay } from "./GameStatsOverlay";
import * as gameScene from "./gameSceneStore";

export type StorybookGameSceneProps =
	{
		initialState: WaveState;
		backgroundColor?: number;
		debug?: boolean;
		onStateUpdate?: (
			state: WaveState,
		) => void;
		width?: number;
		height?: number;
		enableKeyboard?: boolean;
		showPlayerStats?: boolean;
		showGameStats?: boolean;
		showTouchControls?: boolean;
	};

export function StorybookGameScene({
	initialState,
	backgroundColor = 0x222222,
	debug = false,
	onStateUpdate,
	width = 800,
	height = 600,
	enableKeyboard = true,
	showPlayerStats = false,
	showGameStats = true,
	showTouchControls = true,
}: StorybookGameSceneProps) {
	const canvasRef =
		useRef<HTMLDivElement>(
			null,
		);

	useEffect(() => {
		if (
			!canvasRef.current
		)
			return;

		const initGameScene =
			async () => {
				try {
					await gameScene.initialize(
						canvasRef.current!,
						{
							initialState,
							backgroundType:
								backgroundColor,
							debug,
							width,
							height,
							onStateUpdate,
						},
					);
				} catch (error) {
					console.error(
						"Failed to initialize game scene:",
						error,
					);
				}
			};

		initGameScene();

		return () => {
			gameScene
				.destroy()
				.catch(
					console.error,
				);
		};
	}, [
		width,
		height,
		backgroundColor,
		debug,
		initialState,
		onStateUpdate,
	]);

	const currentState =
		gameScene
			.gameState
			.value;

	return (
		<div className="relative w-full h-full overflow-hidden">
			<div
				ref={
					canvasRef
				}
				className="flex justify-center items-center w-full h-full"
				style={{
					minHeight: `${height}px`,
				}}
			/>

			<GameSceneControls
				enableKeyboardShortcuts={
					enableKeyboard
				}
			/>

			{showGameStats && (
				<GameStatsOverlay
					state={
						currentState
					}
					showPlayerStats={
						showPlayerStats
					}
				/>
			)}

			{showTouchControls && (
				<TouchscreenJoystick />
			)}
		</div>
	);
}

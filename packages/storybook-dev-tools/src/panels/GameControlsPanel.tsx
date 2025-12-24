/**
 * Game Controls Panel - Controls for game scene playback
 */

import {
	useEffect,
	useState,
} from "preact/hooks";
import type { GameControlsPanelProps } from "../types";
import {
	sceneState,
	tickCount,
	elapsedTime,
	isInitialized,
	play,
	pause,
	playPause,
	stop,
	step,
	playTimed,
} from "bulbro-game-web/src/stories/gameSceneStore";

export function GameControlsPanel({}: GameControlsPanelProps) {
	const [
		stepSize,
		setStepSize,
	] =
		useState(
			1,
		);
	const [
		playDuration,
		setPlayDuration,
	] =
		useState(
			1,
		);
	const [
		error,
		setError,
	] =
		useState<
			| string
			| null
		>(
			null,
		);

	// Watch for reactive updates from signals
	useEffect(() => {
		// Subscribe to signals for reactive updates
		const unsubscribeStepping =
			sceneState.subscribe(
				() => {
					setError(
						null,
					); // Clear errors on state change
				},
			);

		return () => {
			unsubscribeStepping();
		};
	}, []);

	const handlePlay =
		async () => {
			try {
				setError(
					null,
				);
				await play();
			} catch (err) {
				setError(
					`Failed to play: ${err instanceof Error ? err.message : "Unknown error"}`,
				);
			}
		};

	const handlePause =
		async () => {
			try {
				setError(
					null,
				);
				await pause();
			} catch (err) {
				setError(
					`Failed to pause: ${err instanceof Error ? err.message : "Unknown error"}`,
				);
			}
		};

	const handlePlayPause =
		async () => {
			try {
				setError(
					null,
				);
				await playPause();
			} catch (err) {
				setError(
					`Failed to toggle play: ${err instanceof Error ? err.message : "Unknown error"}`,
				);
			}
		};

	const handleStop =
		async () => {
			try {
				setError(
					null,
				);
				await stop();
			} catch (err) {
				setError(
					`Failed to stop: ${err instanceof Error ? err.message : "Unknown error"}`,
				);
			}
		};

	const handleStep =
		() => {
			try {
				setError(
					null,
				);
				step(
					stepSize,
				);
			} catch (err) {
				setError(
					`Failed to step: ${err instanceof Error ? err.message : "Unknown error"}`,
				);
			}
		};

	const handlePlayTimed =
		async () => {
			try {
				setError(
					null,
				);
				await playTimed(
					playDuration,
				);
			} catch (err) {
				setError(
					`Failed to play timed: ${err instanceof Error ? err.message : "Unknown error"}`,
				);
			}
		};

	if (
		!isInitialized.value
	) {
		return (
			<div className="bg-slate-900 text-slate-400 p-4 text-sm font-mono">
				<div className="text-xs mb-2">
					Game
					scene
					not
					initialized
				</div>
				<div>
					Initialize
					a
					game
					scene
					in
					a
					story
					to
					use
					these
					controls.
				</div>
			</div>
		);
	}

	return (
		<div className="bg-slate-900 text-white p-4 rounded-lg text-sm font-mono flex flex-col gap-3 min-w-[300px]">
			{/* Header */}
			<div className="text-base font-bold mb-1.5 text-amber-400">
				Game
				Scene
				Controls
			</div>

			{/* Error Display */}
			{error && (
				<div className="px-2 py-1.5 bg-red-900 border border-red-600 text-red-100 text-xs rounded">
					{
						error
					}
				</div>
			)}

			{/* Status */}
			<div className="bg-slate-800 p-2 rounded text-xs space-y-1">
				<div>
					State:{" "}
					<strong>
						{
							sceneState.value
						}
					</strong>
				</div>
				<div>
					Ticks:{" "}
					{
						tickCount.value
					}
				</div>
				<div>
					Time:{" "}
					{elapsedTime.value.toFixed(
						2,
					)}
					s
				</div>
			</div>

			{/* Main Controls */}
			<div className="flex gap-2">
				<button
					className={`flex-1 px-2.5 py-1.5 border border-slate-600 rounded cursor-pointer text-xs font-semibold transition-colors ${
						sceneState.value ===
						"playing"
							? "bg-red-700 hover:bg-red-600 text-white"
							: "bg-green-700 hover:bg-green-600 text-white"
					}`}
					onClick={
						handlePlayPause
					}
					title="Space"
				>
					{sceneState.value ===
					"playing"
						? "⏸ Pause"
						: "▶ Play"}
				</button>
				<button
					className="flex-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded cursor-pointer text-xs font-semibold transition-colors"
					onClick={
						handleStop
					}
					title="S"
				>
					⏹
					Stop
				</button>
			</div>

			{/* Step Controls */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<label className="text-xs text-slate-400 flex-shrink-0">
						Step
						by:
					</label>
					<input
						type="number"
						min="1"
						max="100"
						value={
							stepSize
						}
						onChange={(
							e,
						) =>
							setStepSize(
								Number(
									(
										e.target as HTMLInputElement
									)
										.value,
								),
							)
						}
						className="flex-1 px-2 py-1 bg-slate-800 text-white border border-slate-600 rounded text-xs"
					/>
					<span className="text-xs text-slate-400 flex-shrink-0">
						ticks
					</span>
				</div>
				<button
					className="w-full px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded cursor-pointer text-xs font-semibold transition-colors"
					onClick={
						handleStep
					}
					title="N"
				>
					Step
					→
				</button>
			</div>

			{/* Timed Play Controls */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<label className="text-xs text-slate-400 flex-shrink-0">
						Play
						for:
					</label>
					<input
						type="number"
						min="0.1"
						max="60"
						step="0.5"
						value={
							playDuration
						}
						onChange={(
							e,
						) =>
							setPlayDuration(
								Number(
									(
										e.target as HTMLInputElement
									)
										.value,
								),
							)
						}
						className="flex-1 px-2 py-1 bg-slate-800 text-white border border-slate-600 rounded text-xs"
					/>
					<span className="text-xs text-slate-400 flex-shrink-0">
						sec
					</span>
				</div>
				<button
					className="w-full px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded cursor-pointer text-xs font-semibold transition-colors"
					onClick={
						handlePlayTimed
					}
				>
					Play
					⏲
				</button>
			</div>

			{/* Keyboard Shortcuts */}
			<div className="border-t border-slate-600 pt-2 text-xs text-slate-400 space-y-1">
				<div className="font-semibold text-slate-300 mb-1">
					Keyboard
					Shortcuts:
				</div>
				<div>
					<strong>
						Space
					</strong>{" "}
					-
					Play/Pause
				</div>
				<div>
					<strong>
						S
					</strong>{" "}
					-
					Stop
				</div>
				<div>
					<strong>
						N
					</strong>{" "}
					-
					Step
				</div>
			</div>
		</div>
	);
}

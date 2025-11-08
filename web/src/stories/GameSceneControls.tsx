import {
	useEffect,
	useState,
} from "preact/hooks";
import * as gameScene from "./gameSceneStore";

export type GameSceneControlsProps =
	{
		enableKeyboardShortcuts?: boolean;
	};

export function GameSceneControls({
	enableKeyboardShortcuts = true,
}: GameSceneControlsProps) {
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
	// Keyboard controls for scene control
	useEffect(() => {
		if (
			!enableKeyboardShortcuts
		)
			return;

		const handleKeyDown =
			(
				e: KeyboardEvent,
			) => {
				// Quick controls
				switch (
					e.key.toLowerCase()
				) {
					case " ": // Spacebar - play/pause
						e.preventDefault();
						gameScene
							.playPause()
							.catch(
								console.error,
							);
						break;
					case "s": // S - stop
						if (
							e.ctrlKey ||
							e.metaKey
						)
							return; // Don't interfere with save
						e.preventDefault();
						gameScene
							.stop()
							.catch(
								console.error,
							);
						break;
					case "n": // N - step
						e.preventDefault();
						gameScene.step(
							stepSize,
						);
						break;
				}
			};

		window.addEventListener(
			"keydown",
			handleKeyDown,
		);

		return () => {
			window.removeEventListener(
				"keydown",
				handleKeyDown,
			);
		};
	}, [
		enableKeyboardShortcuts,
		stepSize,
	]);

	return (
		<div className="fixed top-2.5 left-2.5 z-50 bg-black/80 text-white p-4 rounded-lg text-sm font-mono flex flex-col gap-2.5 min-w-[250px]">
			<div className="text-base font-bold mb-1.5">
				Game
				Scene
				Controls
			</div>

			{/* Status */}
			<div>
				<div>
					State:{" "}
					<strong>
						{
							gameScene
								.sceneState
								.value
						}
					</strong>
				</div>
				<div>
					Ticks:{" "}
					{
						gameScene
							.tickCount
							.value
					}
				</div>
				<div>
					Time:{" "}
					{gameScene.elapsedTime.value.toFixed(
						1,
					)}
					s
				</div>
			</div>

			{/* Main Controls */}
			<div>
				<button
					className={`px-2.5 py-1 mx-0.5 text-white border border-gray-500 rounded cursor-pointer text-xs ${
						gameScene
							.sceneState
							.value ===
						"playing"
							? "bg-red-700"
							: "bg-green-700"
					}`}
					onClick={() =>
						gameScene
							.playPause()
							.catch(
								console.error,
							)
					}
				>
					{gameScene
						.sceneState
						.value ===
					"playing"
						? "⏸ Pause"
						: "▶ Play"}
				</button>
				<button
					className="px-2.5 py-1 mx-0.5 bg-gray-700 text-white border border-gray-500 rounded cursor-pointer text-xs"
					onClick={() =>
						gameScene
							.stop()
							.catch(
								console.error,
							)
					}
				>
					⏹
					Stop
				</button>
			</div>

			{/* Step Controls */}
			<div className="flex items-center flex-wrap gap-1.5">
				<span>
					Step:
				</span>
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
								e
									.currentTarget
									.value,
							),
						)
					}
					className="px-1.5 py-0.5 mx-1.5 bg-gray-800 text-white border border-gray-500 rounded w-12 text-xs"
				/>
				<span>
					ticks
				</span>
				<button
					className="px-2.5 py-1 mx-0.5 bg-gray-700 text-white border border-gray-500 rounded cursor-pointer text-xs"
					onClick={() =>
						gameScene.step(
							stepSize,
						)
					}
				>
					Step
					→
				</button>
			</div>

			{/* Timed Play Controls */}
			<div className="flex items-center flex-wrap gap-1.5">
				<span>
					Play
					for:
				</span>
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
								e
									.currentTarget
									.value,
							),
						)
					}
					className="px-1.5 py-0.5 mx-1.5 bg-gray-800 text-white border border-gray-500 rounded w-12 text-xs"
				/>
				<span>
					sec
				</span>
				<button
					className="px-2.5 py-1 mx-0.5 bg-gray-700 text-white border border-gray-500 rounded cursor-pointer text-xs"
					onClick={() =>
						gameScene
							.playTimed(
								playDuration,
							)
							.catch(
								console.error,
							)
					}
				>
					Play
					⏲
				</button>
			</div>
		</div>
	);
}

import { useEffect, useRef } from "preact/hooks";
import { Scene } from "@/graphics/Scene";
import { Camera } from "@/graphics/Camera";
import { classicMapSize } from "@/game-canvas";
import { logger } from "@/logger";
import type { CurrentState } from "@/currentState";

export interface StorybookGameSceneProps {
	state: CurrentState;
	canvasScale?: number;
	backgroundColor?: number;
	debug?: boolean;
	tick?: (deltaTime: number) => CurrentState | void;
}

export function StorybookGameScene({
	state,
	canvasScale = 0.6,
	backgroundColor = 0x222222,
	debug = false,
	tick,
}: StorybookGameSceneProps) {
	const canvasRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		let camera: Camera;
		let scene: Scene;
		let currentGameState = state;

		const initScene = async () => {
			// Calculate canvas size based on scale
			const canvasWidth = classicMapSize.width * canvasScale;
			const canvasHeight = classicMapSize.height * canvasScale;

			// Create camera and scene
			camera = new Camera();
			await camera.init({ width: canvasWidth, height: canvasHeight });

			scene = new Scene(logger, debug, camera, canvasScale);
			await scene.init(currentGameState);

			// Append canvas to container
			const canvas = camera.canvas;
			if (canvas) {
				canvasRef.current?.appendChild(canvas as HTMLCanvasElement);
			}

			// Start ticker for animation
			if (tick || true) {
				// Always enable ticker for basic animations
				camera.ticker.add((ticker) => {
					const deltaTime = ticker.deltaMS / 1000;

					// Allow tick function to update state
					if (tick) {
						const newState = tick(deltaTime);
						if (newState) {
							currentGameState = newState;
						}
					}

					// Update scene with current state
					scene.update(deltaTime, currentGameState);
				});
			}
		};

		initScene();

		return () => {
			if (camera) {
				camera.ticker.destroy();
			}
		};
	}, [state, canvasScale, backgroundColor, debug, tick]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "20px",
			}}
		>
			<div
				ref={canvasRef}
				style={{
					border: "2px solid #333",
					borderRadius: "8px",
					boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
				}}
			/>
		</div>
	);
}

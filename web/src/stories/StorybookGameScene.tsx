import { useEffect, useRef } from "preact/hooks";
import { StorybookScene } from "@/graphics/StorybookScene";
import { Camera } from "@/graphics/Camera";
import { classicMapSize, scale } from "@/game-canvas";
import { logger } from "@/logger";
import type { CurrentState } from "@/currentState";

// Helper functions to calculate center position based on entities
function getCenterX(state: CurrentState): number {
	const allEntities = [
		...state.players.map((p) => p.position.x),
		...state.enemies.map((e) => e.position.x),
		...state.shots.map((s) => s.position.x),
	];

	if (allEntities.length === 0) {
		return classicMapSize.width / 2; // Default to map center
	}

	const minX = Math.min(...allEntities);
	const maxX = Math.max(...allEntities);
	return (minX + maxX) / 2;
}

function getCenterY(state: CurrentState): number {
	const allEntities = [
		...state.players.map((p) => p.position.y),
		...state.enemies.map((e) => e.position.y),
		...state.shots.map((s) => s.position.y),
	];

	if (allEntities.length === 0) {
		return classicMapSize.height / 2; // Default to map center
	}

	const minY = Math.min(...allEntities);
	const maxY = Math.max(...allEntities);
	return (minY + maxY) / 2;
}

export interface StorybookGameSceneProps {
	state: CurrentState;
	backgroundColor?: number;
	debug?: boolean;
	tick?: (deltaTime: number) => CurrentState | void;
	cameraX?: number;
	cameraY?: number;
}

export function StorybookGameScene({
	state,
	backgroundColor = 0x222222,
	debug = false,
	tick,
	cameraX,
	cameraY,
}: StorybookGameSceneProps) {
	const canvasRef = useRef<HTMLDivElement>(null);
	const canvasScale = scale.value;

	useEffect(() => {
		if (!canvasRef.current) return;

		let camera: Camera;
		let scene: StorybookScene;
		let currentGameState = state;

		const initScene = async () => {
			// Use actual viewport size for canvas to fit storybook viewport
			const containerRect =
				canvasRef.current!.parentElement!.getBoundingClientRect();
			const canvasWidth = containerRect.width * 0.9; // 90% of container width
			const canvasHeight = containerRect.height * 0.9; // 90% of container height

			// Calculate scale to fit map to viewport
			const mapFitScale = canvasScale;
			// Create camera and scene
			camera = new Camera();
			await camera.init({ width: canvasWidth, height: canvasHeight });

			scene = new StorybookScene(logger, debug, camera, mapFitScale);
			await scene.init(currentGameState);

			// Set camera position - center on entities if not specified
			const centerX =
				cameraX !== undefined ? cameraX : getCenterX(currentGameState);
			const centerY =
				cameraY !== undefined ? cameraY : getCenterY(currentGameState);
			camera.setCenter({ x: centerX, y: centerY });

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

					// Update camera position if needed
					if (cameraX === undefined || cameraY === undefined) {
						const centerX =
							cameraX !== undefined ? cameraX : getCenterX(currentGameState);
						const centerY =
							cameraY !== undefined ? cameraY : getCenterY(currentGameState);
						camera.setCenter({ x: centerX, y: centerY });
					}
				});
			}
		};

		initScene();

		return () => {
			if (camera) {
				camera.ticker.destroy();
			}
		};
	}, [state, backgroundColor, debug, tick, cameraX, cameraY]);

	return (
		<div
			style={{
				width: "100%",
				height: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#1a1a1a",
				overflow: "hidden",
			}}
		>
			<div
				ref={canvasRef}
				style={{
					border: "2px solid #333",
					borderRadius: "8px",
					boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
					maxWidth: "100%",
					maxHeight: "100%",
				}}
			/>
		</div>
	);
}

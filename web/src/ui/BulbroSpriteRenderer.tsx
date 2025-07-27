import { useEffect, useRef } from "preact/hooks";
import * as PIXI from "pixi.js";
import { createBulbroSprite } from "@/bulbro/Sprite";
import { PlayingFieldTile } from "@/graphics/PlayingFieldTile";
import { classicMapSize, type FitMode } from "@/game-canvas";
import type { SpriteType } from "@/bulbro/Sprite";
import type { Size } from "@/geometry";
import { spawnBulbro, type Bulbro, type BulbroState } from "@/bulbro";
import { logger } from "@/logger";

export interface BulbroSpriteRendererProps {
	spriteType: SpriteType;
	bulbro: Bulbro;
	width: number;
	height: number;
	backgroundColor?: number;
	debug?: boolean;
	centerSprite?: boolean;
	tick?: (deltaTime: number) => void;
}

// Replicate the game's zoom calculation logic
function calculateGameScale(canvasSize: Size): number {
	const minimalMapSize = {
		width: 1000,
		height: 750,
	};

	// Determine fit mode using the same logic as game-canvas.ts
	let fitMode: FitMode;
	if (canvasSize.width > 1400 && canvasSize.height > 1000) {
		fitMode =
			(canvasSize.height / classicMapSize.height) * canvasSize.width <
			classicMapSize.width
				? "fit-height"
				: "fit-width";
	} else {
		fitMode =
			canvasSize.width / classicMapSize.width <
			canvasSize.height / classicMapSize.height
				? "fit-height"
				: "fit-width";
	}

	// Calculate scale using the same logic as autoScale
	const fitWidth = fitMode === "fit-width";
	return fitWidth
		? Math.max(canvasSize.width, minimalMapSize.width) / classicMapSize.width
		: Math.max(canvasSize.height, minimalMapSize.height) /
				classicMapSize.height;
}

export function BulbroSpriteRenderer({
	spriteType,
	bulbro,
	width,
	height,
	backgroundColor = 0x222222,
	debug = false,
	centerSprite = true,
	tick,
}: BulbroSpriteRendererProps) {
	const canvasRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let app: PIXI.Application | null = null;
		let playingField: PlayingFieldTile;
		let sprite: ReturnType<typeof createBulbroSprite>;

		const initPixi = async () => {
			// Create PIXI application
			app = new PIXI.Application();
			await app.init({
				width,
				height,
				backgroundColor,
			});

			// Add canvas to container
			canvas.appendChild(app.canvas as HTMLCanvasElement);

			// Calculate real game scale using the same logic as the game
			const canvasSize = { width, height };
			const gameScale = calculateGameScale(canvasSize);

			// Apply scale to the stage (like the real game does via camera.zoom())
			app.stage.scale.set(gameScale);

			// Create playing field
			playingField = new PlayingFieldTile(classicMapSize);
			await playingField.init(app.stage);

			// Center the scaled stage in the viewport
			const scaledMapWidth = classicMapSize.width * gameScale;
			const scaledMapHeight = classicMapSize.height * gameScale;
			app.stage.x = (width - scaledMapWidth) / 2;
			app.stage.y = (height - scaledMapHeight) / 2;

			// Create sprite
			sprite = createBulbroSprite(spriteType, debug);

			// Create layer for sprite
			const layer = new PIXI.RenderLayer();
			app.stage.addChild(layer);

			// Add sprite to playing field
			sprite.appendTo(playingField.container, layer);

			// Position sprite
			if (centerSprite) {
				// Center sprite on the playing field
				const x = classicMapSize.width / 2;
				const y = classicMapSize.height / 2;

				// Initialize sprite
				sprite.update(
					spawnBulbro("demo", spriteType, { x, y }, 0, 0, bulbro),
					0,
				);
			}

			// Start animation loop if tick function provided
			if (tick) {
				app.ticker.add((ticker) => {
					const deltaTime = ticker.deltaMS / 1000;
					tick(deltaTime);
				});
			}
		};

		let initPromise = initPixi();

		// Cleanup function
		return async () => {
			if (sprite) {
				sprite.remove();
			}
			if (app) {
				try {
					await initPromise;
					canvas.removeChild(app.canvas);
					app.ticker?.stop();
					app.destroy();
					app = null;
				} catch (e) {
					logger.error("Destroy failed", e);
				}
			}
		};
	}, [
		spriteType,
		bulbro,
		width,
		height,
		backgroundColor,
		debug,
		centerSprite,
		tick,
	]);

	return (
		<div
			ref={canvasRef}
			style={{
				display: "inline-block",
				border: "2px solid #333",
				borderRadius: "8px",
				boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
			}}
		/>
	);
}

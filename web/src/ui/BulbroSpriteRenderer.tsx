import { useEffect, useRef } from "preact/hooks";
import * as PIXI from "pixi.js";
import { createBulbroSprite } from "@/bulbro/Sprite";
import { PlayingFieldTile } from "@/graphics/PlayingFieldTile";
import { classicMapSize, scale } from "@/game-canvas";
import type { SpriteType } from "@/bulbro/Sprite";
import { spawnBulbro, type Bulbro } from "@/bulbro";
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

			const gameScale = scale.value;

			// Apply scale to the stage (like the real game does via camera.zoom())
			app.stage.scale.set(gameScale);

			// Create playing field
			playingField = new PlayingFieldTile(classicMapSize);
			await playingField.init(app.stage);

			// Center the scaled stage in the viewport
			const scaledMapWidth = classicMapSize.width * gameScale;
			const scaledMapHeight = classicMapSize.height * gameScale;
			app.stage.x = (width - scaledMapWidth) / 2;
			app.stage.y = (height - scaledMapHeight + 40) / 2;

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

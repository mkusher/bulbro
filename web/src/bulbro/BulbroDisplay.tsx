import * as PIXI from "pixi.js";
import { PlayingFieldTile } from "../graphics/PlayingFieldTile";
import {
	deltaTime,
	nowTime,
} from "../time";
import { PixiApp } from "../ui/PixiApp";
import type { Bulbro } from "./BulbroCharacter";
import type { BulbroState } from "./BulbroState";
import { spawnBulbro } from "./BulbroState";
import { createBulbroSprite } from "./Sprite";

// Re-export the BulbroCard component for convenience
export { BulbroCard } from "./BulbroCard";

export type BulbroDisplayProps =
	{
		bulbro: Bulbro;
		className?: string;
		minWidth?: number;
		minHeight?: number;
	};

export function BulbroDisplay({
	bulbro,
	className,
	minWidth = 80,
	minHeight = 80,
}: BulbroDisplayProps) {
	const onInit =
		async (
			app: PIXI.Application,
			container: HTMLDivElement,
		) => {
			let sprite: ReturnType<
				typeof createBulbroSprite
			>;
			let playingField: PlayingFieldTile | null =
				null;

			const updateLayout =
				() => {
					if (
						!app ||
						!app.stage
					)
						return;

					const rect =
						container.getBoundingClientRect();
					const currentWidth =
						Math.max(
							rect.width ||
								minWidth *
									1.5,
							minWidth,
						);
					const currentHeight =
						Math.max(
							rect.height ||
								Math.floor(
									minHeight *
										1.2,
								),
							minHeight,
						);

					// Create playing field that covers the entire canvas
					const fieldSize =
						{
							width:
								currentWidth,
							height:
								currentHeight,
						};

					// Remove old playing field if it exists
					if (
						playingField
					) {
						playingField.container.removeFromParent();
					}

					// Create new playing field that covers the canvas
					playingField =
						new PlayingFieldTile(
							fieldSize,
						);
					playingField.init(
						app.stage,
					);

					// Create sprite if it doesn't exist
					if (
						!sprite
					) {
						sprite =
							createBulbroSprite(
								bulbro
									.style
									.faceType,
								false,
							);
						const bulbroState =
							spawnBulbro(
								"demo",
								bulbro
									.style
									.faceType,
								{
									x:
										fieldSize.width /
										2,
									y:
										fieldSize.height /
										2,
								}, // Centered
								1,
								0,
								bulbro,
							);

						sprite.init(
							bulbroState,
						); // Create layer for sprite
						const layer =
							new PIXI.RenderLayer();
						playingField!.container.addChild(
							layer,
						);

						// Add sprite to playing field
						sprite.appendTo(
							playingField!
								.container,
							layer,
						);
					} else {
						// Move existing sprite to new playing field
						const layer =
							new PIXI.RenderLayer();
						playingField.container.addChild(
							layer,
						);
						sprite.appendTo(
							playingField.container,
							layer,
						);

						// Update sprite position to new center
						const demoState =
							spawnBulbro(
								"demo",
								bulbro
									.style
									.faceType,
								{
									x:
										fieldSize.width /
										2,
									y:
										fieldSize.height /
										2,
								}, // Centered
								1,
								0,
								bulbro,
							);
						sprite.update(
							demoState,
							deltaTime(
								0,
							),
							nowTime(
								0,
							),
						);
					}
				};

			// Initial layout
			updateLayout();
		};

	return (
		<PixiApp
			minWidth={
				minWidth
			}
			minHeight={
				minHeight
			}
			backgroundColor={
				0x000000
			}
			className={`rounded-lg overflow-hidden ${className || ""}`}
			style={{
				display:
					"grid",
				width:
					"100%",
				height:
					"100%",
				border:
					"2px solid #333",
				boxShadow:
					"0 2px 4px rgba(0,0,0,0.2)",
			}}
			onInit={
				onInit
			}
			dependencies={[
				bulbro,
			]}
		/>
	);
}

export type BulbroStateDisplayProps =
	{
		bulbroState: BulbroState;
		bulbro: Bulbro;
		className?: string;
		animate?: boolean;
		minWidth?: number;
		minHeight?: number;
	};

export function BulbroStateDisplay({
	bulbroState,
	bulbro,
	className,
	animate = false,
	minWidth = 150,
	minHeight = 150,
}: BulbroStateDisplayProps) {
	const onInit =
		async (
			app: PIXI.Application,
			canvas: HTMLDivElement,
		) => {
			let sprite: ReturnType<
				typeof createBulbroSprite
			>;
			let playingField: PlayingFieldTile | null =
				null;

			const updateLayout =
				() => {
					if (
						!app
					)
						return;

					const rect =
						canvas.getBoundingClientRect();
					const currentWidth =
						Math.max(
							rect.width ||
								minWidth *
									1.5,
							minWidth,
						);
					const currentHeight =
						Math.max(
							rect.height ||
								Math.floor(
									minHeight *
										1.2,
								),
							minHeight,
						);

					// Create playing field that covers the entire canvas
					const fieldSize =
						{
							width:
								currentWidth,
							height:
								currentHeight,
						};

					// Remove old playing field if it exists
					if (
						playingField
					) {
						playingField.container.removeFromParent();
					}

					// Create new playing field that covers the canvas
					playingField =
						new PlayingFieldTile(
							fieldSize,
						);
					playingField.init(
						app.stage,
					);

					// Create sprite if it doesn't exist
					if (
						!sprite
					) {
						sprite =
							createBulbroSprite(
								bulbro
									.style
									.faceType,
								false,
							);

						// Position sprite at field center with the actual state
						const centeredState =
							new (
								bulbroState.constructor as any
							)(
								{
									...bulbroState.toJSON(),
									position:
										{
											x:
												fieldSize.width /
												2,
											y:
												fieldSize.height /
												2,
										}, // Centered
								},
							);
						sprite.init(
							centeredState,
						);
						// Create layer for sprite
						const layer =
							new PIXI.RenderLayer();
						playingField!.container.addChild(
							layer,
						);

						// Add sprite to playing field
						sprite.appendTo(
							playingField!
								.container,
							layer,
						);
					} else {
						// Move existing sprite to new playing field
						const layer =
							new PIXI.RenderLayer();
						playingField.container.addChild(
							layer,
						);
						sprite.appendTo(
							playingField.container,
							layer,
						);

						// Update sprite position to new center
						const centeredState =
							new (
								bulbroState.constructor as any
							)(
								{
									...bulbroState.toJSON(),
									position:
										{
											x:
												fieldSize.width /
												2,
											y:
												fieldSize.height /
												2,
										}, // Centered
								},
							);
						sprite.update(
							centeredState,
							deltaTime(
								0,
							),
							nowTime(
								0,
							),
						);
					}
				};

			// Initial layout
			updateLayout();
		};

	return (
		<PixiApp
			minWidth={
				minWidth
			}
			minHeight={
				minHeight
			}
			backgroundColor={
				0x000000
			}
			className={`rounded-lg overflow-hidden ${className || ""}`}
			style={{
				display:
					"grid",
				width:
					"100%",
				height:
					"100%",
				border:
					"2px solid #333",
				boxShadow:
					"0 2px 4px rgba(0,0,0,0.2)",
			}}
			onInit={
				onInit
			}
			dependencies={[
				bulbroState,
				bulbro,
				animate,
			]}
		/>
	);
}

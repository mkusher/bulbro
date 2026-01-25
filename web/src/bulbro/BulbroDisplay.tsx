import * as PIXI from "pixi.js";
import { FIELD_BACKGROUND_COLOR } from "../graphics/PlayingFieldTile";
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

			const sprite =
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
							currentWidth /
							2,
						y:
							currentHeight /
							2,
					},
					1,
					0,
					bulbro,
				);

			sprite.init(
				bulbroState,
			);

			const layer =
				new PIXI.RenderLayer();
			app.stage.addChild(
				layer,
			);

			sprite.appendTo(
				app.stage,
				layer,
			);
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
				FIELD_BACKGROUND_COLOR
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

			const sprite =
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
									currentWidth /
									2,
								y:
									currentHeight /
									2,
							},
					},
				);

			sprite.init(
				centeredState,
			);

			const layer =
				new PIXI.RenderLayer();
			app.stage.addChild(
				layer,
			);

			sprite.appendTo(
				app.stage,
				layer,
			);
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
				FIELD_BACKGROUND_COLOR
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

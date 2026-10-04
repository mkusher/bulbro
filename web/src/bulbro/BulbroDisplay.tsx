import type * as PIXI from "pixi.js";
import { FIELD_BACKGROUND_COLOR } from "../graphics/PlayingFieldTile";
import { PixiApp } from "../ui/PixiApp";
import type { Bulbro } from "./BulbroCharacter";
import { initBulbroPreview } from "./BulbroPreview";
import type { BulbroState } from "./BulbroState";
import { spawnBulbro } from "./BulbroState";

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
		) => {
			await initBulbroPreview(
				app,
				spawnBulbro(
					"demo",
					bulbro
						.style
						.faceType,
					{
						x: 0,
						y: 0,
					},
					1,
					0,
					bulbro,
				),
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
		) => {
			await initBulbroPreview(
				app,
				bulbroState,
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

import type * as PIXI from "pixi.js";
import type { Bulbro } from "../bulbro/BulbroCharacter";
import { initBulbroPreview } from "../bulbro/BulbroPreview";
import { spawnBulbro } from "../bulbro/BulbroState";
import { PixiApp } from "./PixiApp";

export type BulbroThumbnailProps =
	{
		bulbro: Bulbro;
		width: number;
		height: number;
		className?: string;
	};

export function BulbroThumbnail({
	bulbro,
	width,
	height,
	className,
}: BulbroThumbnailProps) {
	const onInit =
		async (
			app: PIXI.Application,
		) => {
			await initBulbroPreview(
				app,
				spawnBulbro(
					"preview",
					bulbro
						.style
						.faceType,
					{
						x: 0,
						y: 0,
					},
					0,
					0,
					bulbro,
				),
			);
		};

	return (
		<PixiApp
			width={
				width
			}
			height={
				height
			}
			backgroundColor={
				0x2a4d3a
			}
			className={
				className
			}
			style={{
				borderRadius:
					"inherit",
			}}
			onInit={
				onInit
			}
			dependencies={[
				bulbro.id,
				bulbro
					.style
					.faceType,
				width,
				height,
			]}
		/>
	);
}

import * as PIXI from "pixi.js";
import { PlayingFieldTile } from "../graphics/PlayingFieldTile";
import { PixiApp } from "../ui/PixiApp";
import type { EnemyCharacter } from "./EnemyCharacter";
import { BulbaEnemySprite } from "./sprites/BulbaEnemySprite";

export type EnemyDisplayProps =
	{
		enemy: EnemyCharacter;
		width?: number;
		height?: number;
	};

export function EnemyDisplay({
	enemy,
	width = 200,
	height = 150,
}: EnemyDisplayProps) {
	const onInit =
		async (
			app: PIXI.Application,
			canvas: HTMLDivElement,
		) => {
			const rect =
				canvas.getBoundingClientRect();
			const actualWidth =
				rect.width ||
				width;
			const actualHeight =
				rect.height ||
				height;

			const fieldTile =
				new PlayingFieldTile(
					{
						width:
							actualWidth,
						height:
							actualHeight,
					},
				);
			await fieldTile.init(
				app.stage,
			);

			const wrapper =
				new PIXI.Container();
			wrapper.x =
				actualWidth /
				2;
			wrapper.y =
				actualHeight *
				0.8;
			app.stage.addChild(
				wrapper,
			);

			const enemySprite =
				new BulbaEnemySprite(
					enemy.sprite,
				);
			const layer =
				new PIXI.RenderLayer();
			app.stage.addChild(
				layer,
			);
			enemySprite.appendTo(
				wrapper,
				layer,
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
			onInit={
				onInit
			}
			dependencies={[
				enemy.id,
				width,
				height,
			]}
		/>
	);
}

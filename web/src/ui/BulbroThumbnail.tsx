import * as PIXI from "pixi.js";
import type { Bulbro } from "../bulbro/BulbroCharacter";
import { createBulbroSprite } from "../bulbro/Sprite";
import { spawnBulbro } from "../bulbro/BulbroState";
import { PixiApp } from "./PixiApp";

export type BulbroThumbnailProps = {
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
	const onInit = async (app: PIXI.Application) => {
		// Create bulbro state and sprite
		const bulbroState = spawnBulbro(
			"preview",
			bulbro.style.faceType,
			{ x: width / 2, y: height / 2 },
			0,
			0,
			bulbro,
		);

		const sprite = createBulbroSprite(bulbroState.type, false);
		await sprite.init(bulbroState);

		// Create container for sprite
		const spriteContainer = new PIXI.Container();
		app.stage.addChild(spriteContainer);

		// Create layer for sprite
		const layer = new PIXI.RenderLayer();
		app.stage.addChild(layer);
		sprite.appendTo(spriteContainer, layer);

		// Center and scale the sprite to fit nicely in thumbnail
		const scale = Math.min((width * 0.8) / 64, (height * 0.8) / 64); // Assuming 64x64 sprite
		spriteContainer.scale.set(scale);

		// Position sprite slightly lower than center
		spriteContainer.y = height / 6;
	};

	return (
		<PixiApp
			width={width}
			height={height}
			backgroundColor={0x2a4d3a}
			className={className}
			style={{ borderRadius: "inherit" }}
			onInit={onInit}
			dependencies={[bulbro.id, bulbro.style.faceType, width, height]}
		/>
	);
}

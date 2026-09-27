import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import type {
	Position,
	Size,
} from "@/geometry";

export const ENEMY_BODY_SCALE = 0.3;
const OUTLINE_RADIUS =
	3 /
	ENEMY_BODY_SCALE;
const PADDING =
	Math.ceil(
		OUTLINE_RADIUS,
	) +
	1;

type BodyFrame =
	{
		position: Position;
		size: Size;
	};
export type EnemyBodyTextures =
	{
		normal: PIXI.Texture;
		dead: PIXI.Texture;
		padding: number;
	};
// Cache pending work too, so simultaneous spawns bake each enemy type only once.
const textures =
	new Map<
		string,
		Promise<EnemyBodyTextures>
	>();

export function getEnemyBodyTextures(
	frame: BodyFrame,
): Promise<EnemyBodyTextures> {
	const key = `${frame.position.x},${frame.position.y},${frame.size.width},${frame.size.height}`;
	let result =
		textures.get(
			key,
		);
	if (
		!result
	) {
		result =
			bakeBodyTextures(
				frame,
			).catch(
				(
					error,
				) => {
					textures.delete(
						key,
					);
					throw error;
				},
			);
		textures.set(
			key,
			result,
		);
	}
	return result;
}

async function bakeBodyTextures({
	position,
	size,
}: BodyFrame): Promise<EnemyBodyTextures> {
	const asset =
		await Assets.get(
			"allEnemies",
		);
	const dead =
		new PIXI.Texture(
			{
				source:
					asset,
				frame:
					new PIXI.Rectangle(
						position.x,
						position.y,
						size.width,
						size.height,
					),
			},
		);
	const silhouette =
		document.createElement(
			"canvas",
		);
	silhouette.width =
		size.width;
	silhouette.height =
		size.height;
	const mask =
		silhouette.getContext(
			"2d",
		);
	if (
		!mask
	)
		throw new Error(
			"Cannot create enemy outline canvas",
		);
	mask.drawImage(
		dead
			.source
			.resource as CanvasImageSource,
		position.x,
		position.y,
		size.width,
		size.height,
		0,
		0,
		size.width,
		size.height,
	);
	mask.globalCompositeOperation =
		"source-in";
	mask.fillStyle =
		"black";
	mask.fillRect(
		0,
		0,
		size.width,
		size.height,
	);

	const canvas =
		document.createElement(
			"canvas",
		);
	canvas.width =
		size.width +
		PADDING *
			2;
	canvas.height =
		size.height +
		PADDING *
			2;
	const context =
		canvas.getContext(
			"2d",
		);
	if (
		!context
	)
		throw new Error(
			"Cannot create enemy outline canvas",
		);
	context.drawImage(
		silhouette,
		PADDING,
		PADDING,
	);
	// Expand the alpha silhouette into a black outline once, before rendering.
	for (
		let step = 0;
		step <
		32;
		step++
	) {
		const angle =
			(step *
				Math.PI *
				2) /
			32;
		context.drawImage(
			silhouette,
			PADDING +
				Math.cos(
					angle,
				) *
					OUTLINE_RADIUS,
			PADDING +
				Math.sin(
					angle,
				) *
					OUTLINE_RADIUS,
		);
	}
	context.drawImage(
		dead
			.source
			.resource as CanvasImageSource,
		position.x,
		position.y,
		size.width,
		size.height,
		PADDING,
		PADDING,
		size.width,
		size.height,
	);
	const normal =
		new PIXI.Texture(
			{
				source:
					new PIXI.CanvasSource(
						{
							resource:
								canvas,
							scaleMode:
								"linear",
						},
					),
			},
		);
	return {
		normal,
		dead,
		padding:
			PADDING,
	};
}

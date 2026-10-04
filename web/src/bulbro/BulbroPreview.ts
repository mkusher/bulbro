import {
	type Application,
	Container,
	RenderLayer,
} from "pixi.js";
import { BulbroState } from "./BulbroState";
import { createBulbroSprite } from "./Sprite";

/** Wait for the character before fitting its feet-anchored artwork into a snapshot. */
export async function initBulbroPreview(
	app: Application,
	state: BulbroState,
) {
	const previewState =
		new BulbroState(
			{
				...state.toJSON(),
				position:
					{
						x: 0,
						y: 0,
					},
			},
		);
	const sprite =
		createBulbroSprite(
			previewState.type,
			false,
		);
	await sprite.init(
		previewState,
	);

	const container =
		new Container();
	const layer =
		new RenderLayer();
	app.stage.addChild(
		container,
		layer,
	);
	sprite.appendTo(
		container,
		layer,
	);

	const bounds =
		container.getLocalBounds();
	const scale =
		Math.min(
			(app
				.screen
				.width *
				0.8) /
				bounds.width,
			(app
				.screen
				.height *
				0.8) /
				bounds.height,
		);
	container.pivot.set(
		bounds.x +
			bounds.width /
				2,
		bounds.y +
			bounds.height /
				2,
	);
	container.scale.set(
		scale,
	);
	container.position.set(
		app
			.screen
			.width /
			2,
		app
			.screen
			.height /
			2,
	);
}

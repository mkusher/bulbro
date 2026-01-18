import * as PIXI from "pixi.js";
import type {
	Position,
	Size,
} from "../geometry";
import {
	BackgroundObjectSprite,
	type BackgroundObjectType,
} from "./BackgroundObjectSprite";

const ISLAND_SPACING = 400;
const ISLAND_SIZE = 120;
const OBJECTS_PER_ISLAND = 16;
const MIN_OBJECT_DISTANCE = 25;
const MAX_PLACEMENT_ATTEMPTS = 50;
// Margin to ensure sprites are fully within map bounds (not partially outside)
// Based on max sprite visual extent (size 50 * scale 0.1 * safety factor)
export const MAP_EDGE_MARGIN = 25;

type SpriteWithType =
	{
		sprite: BackgroundObjectSprite;
		type: BackgroundObjectType;
	};

export class BackgroundPatternSprite {
	#container: PIXI.Container;
	#sprites: SpriteWithType[] =
		[];

	constructor(
		mapSize: Size,
	) {
		this.#container =
			new PIXI.Container();
		this.#generatePattern(
			mapSize,
		);
	}

	#isPositionValid(
		position: Position,
		existingPositions: Position[],
	): boolean {
		for (const existing of existingPositions) {
			const dx =
				position.x -
				existing.x;
			const dy =
				position.y -
				existing.y;
			const distance =
				Math.sqrt(
					dx *
						dx +
						dy *
							dy,
				);
			if (
				distance <
				MIN_OBJECT_DISTANCE
			) {
				return false;
			}
		}
		return true;
	}

	#generatePattern(
		mapSize: Size,
	) {
		const objectTypes: BackgroundObjectType[] =
			[
				"stones",
				"sticks",
			];

		for (
			let islandX =
				ISLAND_SPACING /
				2;
			islandX <
			mapSize.width;
			islandX +=
				ISLAND_SPACING
		) {
			for (
				let islandY =
					ISLAND_SPACING /
					2;
				islandY <
				mapSize.height;
				islandY +=
					ISLAND_SPACING
			) {
				const islandPositions: Position[] =
					[];
				let objectsPlaced = 0;
				let attempts = 0;
				const islandPaddingY =
					((Math.random() -
						0.5) *
						ISLAND_SPACING) /
					2;
				const islandPaddingX =
					((Math.random() -
						0.5) *
						ISLAND_SPACING) /
					2;

				while (
					objectsPlaced <
						OBJECTS_PER_ISLAND &&
					attempts <
						MAX_PLACEMENT_ATTEMPTS
				) {
					attempts++;
					const angle =
						Math.random() *
						Math.PI *
						2;
					const radius =
						Math.random() *
						ISLAND_SIZE;
					const position =
						{
							x:
								islandX +
								islandPaddingX +
								Math.cos(
									angle,
								) *
									radius,
							y:
								islandY +
								islandPaddingY +
								Math.sin(
									angle,
								) *
									radius,
						};

					if (
						position.x <
							MAP_EDGE_MARGIN ||
						position.x >
							mapSize.width -
								MAP_EDGE_MARGIN ||
						position.y <
							MAP_EDGE_MARGIN ||
						position.y >
							mapSize.height -
								MAP_EDGE_MARGIN
					) {
						continue;
					}

					if (
						this.#isPositionValid(
							position,
							islandPositions,
						)
					) {
						islandPositions.push(
							position,
						);
						const sprite =
							new BackgroundObjectSprite(
								position,
							);
						const type =
							objectTypes[
								Math.floor(
									Math.random() *
										objectTypes.length,
								)
							]!;
						this.#sprites.push(
							{
								sprite,
								type,
							},
						);
						objectsPlaced++;
					}
				}
			}
		}
	}

	get spritePositions(): Position[] {
		return this.#sprites.map(
			({
				sprite,
			}) => ({
				x: sprite
					.container
					.x,
				y: sprite
					.container
					.y,
			}),
		);
	}

	async init(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
	) {
		for (const {
			sprite,
			type,
		} of this
			.#sprites) {
			await sprite.init(
				type,
			);
			this.#container.addChild(
				sprite.container,
			);
		}

		parent.addChild(
			this
				.#container,
		);
		layer?.attach(
			this
				.#container,
		);
	}
}

import * as PIXI from "pixi.js";
import type { Bulbro } from "../bulbro/BulbroCharacter";
import { spawnBulbro } from "../bulbro/BulbroState";
import { createBulbroSprite } from "../bulbro/Sprite";
import { bulbros } from "../characters-definitions";
import { FIELD_BACKGROUND_COLOR } from "../graphics/PlayingFieldTile";
import { itemAppearances } from "../items/ItemAppearance";
import { PixiApp } from "../ui/PixiApp";

export default {
	title:
		"Bulbros/Wearables",
};

const wearableItems =
	Object.keys(
		itemAppearances,
	);
const columns =
	[
		"none",
		...wearableItems,
	];

// Grid cell in game units, roomy enough for the tallest hat
const cellWidth = 70;
const cellHeight = 90;
const labelWidth = 80;
const headerHeight = 24;

type WearablesGridProps =
	{
		characters: Bulbro[];
		scale: number;
	};

/** Snapshot of every character wearing every wearable item, drawn in one Pixi canvas. */
function WearablesGrid({
	characters,
	scale,
}: WearablesGridProps) {
	const width =
		(labelWidth +
			columns.length *
				cellWidth) *
		scale;
	const height =
		(headerHeight +
			characters.length *
				cellHeight) *
		scale;

	const onInit =
		async (
			app: PIXI.Application,
		) => {
			const grid =
				new PIXI.Container();
			grid.scale.set(
				scale,
			);
			const layer =
				new PIXI.RenderLayer();
			app.stage.addChild(
				grid,
				layer,
			);
			const labelStyle =
				{
					fill: 0xffffff,
					fontSize: 9,
					fontFamily:
						"monospace",
				};
			columns.forEach(
				(
					item,
					column,
				) => {
					const label =
						new PIXI.Text(
							{
								text: item,
								style:
									labelStyle,
								resolution:
									scale *
									2,
							},
						);
					label.anchor.set(
						0.5,
						0,
					);
					label.position.set(
						labelWidth +
							(column +
								0.5) *
								cellWidth,
						6,
					);
					grid.addChild(
						label,
					);
				},
			);

			const cells =
				characters.flatMap(
					(
						character,
						row,
					) => {
						const label =
							new PIXI.Text(
								{
									text: character.id,
									style:
										labelStyle,
									resolution:
										scale *
										2,
								},
							);
						label.anchor.set(
							0,
							0.5,
						);
						label.position.set(
							6,
							headerHeight +
								(row +
									0.5) *
									cellHeight,
						);
						grid.addChild(
							label,
						);
						return columns.map(
							(
								item,
								column,
							) => {
								// Feet-anchored, so place at the bottom of the cell
								const base =
									spawnBulbro(
										`${character.id}-${item}`,
										character
											.style
											.faceType,
										{
											x:
												labelWidth +
												(column +
													0.5) *
													cellWidth,
											y:
												headerHeight +
												(row +
													1) *
													cellHeight -
												10,
										},
										0,
										0,
										{
											...character,
											weapons:
												[],
										},
									);
								const state =
									item ===
									"none"
										? base
										: base.withItem(
												item,
											);
								const sprite =
									createBulbroSprite(
										character
											.style
											.faceType,
									);
								sprite.appendTo(
									grid,
									layer,
								);
								return {
									sprite,
									state,
								};
							},
						);
					},
				);
			await Promise.all(
				cells.map(
					({
						sprite,
						state,
					}) =>
						sprite.init(
							state,
						),
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
				FIELD_BACKGROUND_COLOR
			}
			onInit={
				onInit
			}
			dependencies={[
				characters,
				scale,
			]}
		/>
	);
}

export const AllBulbros =
	{
		render:
			(
				args: any,
			) => (
				<WearablesGrid
					characters={
						bulbros
					}
					scale={
						args.scale
					}
				/>
			),
		args: {
			scale: 1.5,
		},
		argTypes:
			{
				scale:
					{
						control:
							{
								type: "range",
								min: 1,
								max: 4,
								step: 0.5,
							},
					},
			},
	};

export const OneBulbro =
	{
		render:
			(
				args: any,
			) => (
				<WearablesGrid
					characters={bulbros.filter(
						(
							bulbro,
						) =>
							bulbro.id ===
							args.bulbroType,
					)}
					scale={
						args.scale
					}
				/>
			),
		args: {
			bulbroType:
				"well-rounded",
			scale: 3,
		},
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				scale:
					{
						control:
							{
								type: "range",
								min: 1,
								max: 6,
								step: 0.5,
							},
					},
			},
	};

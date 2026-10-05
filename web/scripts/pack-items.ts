import sharp from "sharp";
import { itemDefinitions } from "../src/items/Items";

// Run from web/: bun scripts/pack-items.ts
const assets =
	new URL(
		"../src/assets/",
		import.meta
			.url,
	);
const cell = 128;
const padding = 8;
const columns = 10;
const ids =
	itemDefinitions
		.map(
			(
				item,
			) =>
				item.id,
		)
		.sort();
const width =
	columns *
	cell;
const height =
	Math.ceil(
		ids.length /
			columns,
	) *
	cell;
const frames: Record<
	string,
	{
		x: number;
		y: number;
		w: number;
		h: number;
	}
> =
	{};
const sprites =
	await Promise.all(
		ids.map(
			async (
				id,
				index,
			) => {
				const input =
					new URL(
						`items/${id}.png`,
						assets,
					);
				const metadata =
					await sharp(
						input.pathname,
					).metadata();
				if (
					!metadata.hasAlpha
				)
					throw new Error(
						`${id} must have a transparent background`,
					);
				const x =
					(index %
						columns) *
					cell;
				const y =
					Math.floor(
						index /
							columns,
					) *
					cell;
				frames[
					id
				] =
					{
						x,
						y,
						w: cell,
						h: cell,
					};
				const buffer =
					await sharp(
						input.pathname,
					)
						.trim(
							{
								background:
									"#00000000",
								threshold: 1,
							},
						)
						.resize(
							cell -
								2 *
									padding,
							cell -
								2 *
									padding,
							{
								fit: "contain",
								background:
									"#00000000",
							},
						)
						.extend(
							{
								top: padding,
								bottom:
									padding,
								left: padding,
								right:
									padding,
								background:
									"#00000000",
							},
						)
						.png()
						.toBuffer();
				return {
					input:
						buffer,
					left: x,
					top: y,
				};
			},
		),
	);
await sharp(
	{
		create:
			{
				width,
				height,
				channels: 4,
				background:
					"#00000000",
			},
	},
)
	.composite(
		sprites,
	)
	.png()
	.toFile(
		new URL(
			"items.png",
			assets,
		)
			.pathname,
	);
await Bun.write(
	new URL(
		"items.json",
		assets,
	),
	JSON.stringify(
		{
			meta: {
				image:
					"items.png",
				size: {
					w: width,
					h: height,
				},
				cell,
				padding,
			},
			frames:
				Object.fromEntries(
					ids.map(
						(
							id,
						) => [
							id,
							frames[
								id
							],
						],
					),
				),
		},
		null,
		2,
	) +
		"\n",
);
console.log(
	`Packed ${ids.length} items into ${width} × ${height} pixels.`,
);

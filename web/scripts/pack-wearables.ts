import sharp from "sharp";

// Run from web/: bun scripts/pack-wearables.ts
// Derives on-character artwork from the shop item icons by removing
// the parts a worn item would hide, like the inside of a hat.
const assets =
	new URL(
		"../src/assets/",
		import.meta
			.url,
	);
const sourceSize = 256;
const cell = 128;
const columns = 4;

type Point =
	[
		number,
		number,
	];

type WearableEdit =
	{
		/** Item icon in assets/items to start from. */
		source: string;
		/** Polygons erased from the icon, in source pixels. */
		cut?: Point[][];
		/** Seeds of dark regions to erase, flood filled up to the luminance. */
		clear?: {
			seed: Point;
			maxLuminance: number;
			/** Keeps the fill from leaking along the dark outlines. */
			within: Point[];
		}[];
		/** Makes translucent pixels opaque, blending them over the color. */
		backfill?: {
			area: Point[];
			color: [
				number,
				number,
				number,
			];
		}[];
	};

const wearables: Record<
	string,
	WearableEdit
> =
	{
		// Without the inside of the opening, the cuff sits on the head.
		// The cut follows the cuff bottom edge, keeping the front of the cuff.
		beanie:
			{
				source:
					"beanie",
				cut: [
					[
						[
							0,
							180,
						],
						[
							10,
							180,
						],
						[
							37,
							168,
						],
						[
							75,
							163,
						],
						[
							112,
							169,
						],
						[
							145,
							177,
						],
						[
							175,
							189,
						],
						[
							197,
							200,
						],
						[
							209,
							211,
						],
						[
							214,
							226,
						],
						[
							215,
							256,
						],
						[
							0,
							256,
						],
					],
				],
			},
		// Strap and brim underside would be hidden by the head
		helmet:
			{
				source:
					"helmet",
				cut: [
					[
						[
							0,
							136,
						],
						[
							30,
							137,
						],
						[
							45,
							134,
						],
						[
							65,
							136,
						],
						[
							90,
							146,
						],
						[
							120,
							151,
						],
						[
							170,
							154,
						],
						[
							188,
							152,
						],
						[
							212,
							152,
						],
						[
							230,
							160,
						],
						[
							256,
							166,
						],
						[
							256,
							256,
						],
						[
							0,
							256,
						],
					],
				],
				// The icon has a translucent smudge on the dome
				backfill:
					[
						{
							area: [
								[
									96,
									34,
								],
								[
									186,
									34,
								],
								[
									186,
									119,
								],
								[
									96,
									119,
								],
							],
							color:
								[
									89,
									94,
									52,
								],
						},
					],
			},
		warriorHelmet: { source: "warriorHelmet" },
		// The face shows through the open mouth, like a hood
		wolfHelmet:
			{
				source:
					"wolfHelmet",
				clear:
					[
						{
							seed: [
								150,
								160,
							],
							maxLuminance: 130,
							within:
								[
									[
										95,
										125,
									],
									[
										115,
										117,
									],
									[
										135,
										120,
									],
									[
										150,
										122,
									],
									[
										165,
										120,
									],
									[
										183,
										125,
									],
									[
										190,
										145,
									],
									[
										188,
										170,
									],
									[
										182,
										195,
									],
									[
										180,
										224,
									],
									[
										160,
										228,
									],
									[
										130,
										208,
									],
									[
										104,
										186,
									],
									[
										98,
										155,
									],
								],
						},
					],
			},
	};

function luminance(
	pixels: Buffer,
	offset: number,
) {
	return (
		0.299 *
			pixels[
				offset
			]! +
		0.587 *
			pixels[
				offset +
					1
			]! +
		0.114 *
			pixels[
				offset +
					2
			]!
	);
}

function isInside(
	[
		x,
		y,
	]: Point,
	polygon: Point[],
) {
	let inside = false;
	for (
		let i = 0,
			j =
				polygon.length -
				1;
		i <
		polygon.length;
		j =
			i++
	) {
		const [
			xi,
			yi,
		] =
			polygon[
				i
			]!;
		const [
			xj,
			yj,
		] =
			polygon[
				j
			]!;
		if (
			yi >
				y !==
				yj >
					y &&
			x <
				((xj -
					xi) *
					(y -
						yi)) /
					(yj -
						yi) +
					xi
		)
			inside =
				!inside;
	}
	return inside;
}

function backfill(
	pixels: Buffer,
	area: Point[],
	color: [
		number,
		number,
		number,
	],
) {
	for (
		let index = 0;
		index <
		sourceSize *
			sourceSize;
		index++
	) {
		const offset =
			index *
			4;
		const alpha =
			pixels[
				offset +
					3
			]! /
			255;
		if (
			alpha ===
				0 ||
			!isInside(
				[
					index %
						sourceSize,
					Math.floor(
						index /
							sourceSize,
					),
				],
				area,
			)
		)
			continue;
		for (
			let channel = 0;
			channel <
			3;
			channel++
		) {
			pixels[
				offset +
					channel
			] =
				Math.round(
					alpha *
						pixels[
							offset +
								channel
						]! +
						(1 -
							alpha) *
							color[
								channel
							]!,
				);
		}
		pixels[
			offset +
				3
		] =
			255;
	}
}

/** Makes the connected region around the seed transparent. */
function floodClear(
	pixels: Buffer,
	seed: Point,
	maxLuminance: number,
	within: Point[],
) {
	const visited =
		new Uint8Array(
			sourceSize *
				sourceSize,
		);
	const stack =
		[
			seed[1] *
				sourceSize +
				seed[0],
		];
	while (
		stack.length >
		0
	) {
		const index =
			stack.pop()!;
		if (
			visited[
				index
			]
		)
			continue;
		visited[
			index
		] =
			1;
		const offset =
			index *
			4;
		const x =
			index %
			sourceSize;
		const y =
			Math.floor(
				index /
					sourceSize,
			);
		if (
			pixels[
				offset +
					3
			] ===
				0 ||
			!isInside(
				[
					x,
					y,
				],
				within,
			) ||
			luminance(
				pixels,
				offset,
			) >
				maxLuminance
		)
			continue;
		pixels[
			offset +
				3
		] =
			0;
		if (
			x >
			0
		)
			stack.push(
				index -
					1,
			);
		if (
			x <
			sourceSize -
				1
		)
			stack.push(
				index +
					1,
			);
		if (
			y >
			0
		)
			stack.push(
				index -
					sourceSize,
			);
		if (
			y <
			sourceSize -
				1
		)
			stack.push(
				index +
					sourceSize,
			);
	}
}

async function renderWearable(
	edit: WearableEdit,
) {
	const edited = new URL(`wearables/${edit.source}.png`, assets);
	const input = await Bun.file(edited).exists() ? edited :
		new URL(
			`items/${edit.source}.png`,
			assets,
		);
	const {
		data,
		info,
	} =
		await sharp(
			input.pathname,
		)
			.ensureAlpha()
			.raw()
			.toBuffer(
				{
					resolveWithObject: true,
				},
			);
	if (
		info.width !==
			sourceSize ||
		info.height !==
			sourceSize
	)
		throw new Error(
			`${edit.source} must be ${sourceSize}x${sourceSize}`,
		);
	for (const {
		area,
		color,
	} of edit.backfill ??
		[]) {
		backfill(
			data,
			area,
			color,
		);
	}
	for (const {
		seed,
		maxLuminance,
		within,
	} of edit.clear ??
		[]) {
		floodClear(
			data,
			seed,
			maxLuminance,
			within,
		);
	}
	let image =
		sharp(
			data,
			{
				raw: info,
			},
		);
	if (
		edit.cut
	) {
		const polygons =
			edit.cut
				.map(
					(
						points,
					) =>
						`<polygon points="${points.map((point) => point.join(",")).join(" ")}"/>`,
				)
				.join(
					"",
				);
		const mask =
			Buffer.from(
				`<svg xmlns="http://www.w3.org/2000/svg" width="${sourceSize}" height="${sourceSize}">${polygons}</svg>`,
			);
		image =
			sharp(
				await image
					.composite(
						[
							{
								input:
									mask,
								blend:
									"dest-out",
							},
						],
					)
					.png()
					.toBuffer(),
			);
	}
	return image
		.resize(
			cell,
			cell,
		)
		.png()
		.toBuffer();
}

const ids =
	Object.keys(
		wearables,
	).sort();
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
				return {
					input:
						await renderWearable(
							wearables[
								id
							]!,
						),
					left: x,
					top: y,
				};
			},
		),
	);
const width =
	Math.min(
		ids.length,
		columns,
	) *
	cell;
const height =
	Math.ceil(
		ids.length /
			columns,
	) *
	cell;

await sharp(
	{
		create:
			{
				width,
				height,
				channels: 4,
				background:
					{
						r: 0,
						g: 0,
						b: 0,
						alpha: 0,
					},
			},
	},
)
	.composite(
		sprites,
	)
	.png()
	.toFile(
		new URL(
			"wearables.png",
			assets,
		)
			.pathname,
	);
await Bun.write(
	new URL(
		"wearables.json",
		assets,
	),
	`${JSON.stringify(
		{
			meta: {
				image:
					"wearables.png",
				size: {
					w: width,
					h: height,
				},
			},
			frames,
		},
		null,
		"\t",
	)}\n`,
);
console.log(
	`Packed ${ids.length} wearables into ${width}x${height}`,
);

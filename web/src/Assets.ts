import * as PIXI from "pixi.js";

const assetDefinitions =
	{
		weapons:
			{
				path: "/game-assets/weapons.png",
			},
		weaponsx05:
			{
				path: "/game-assets/weapons-x0.5.png",
			},
		weaponsx025:
			{
				path: "/game-assets/weapons-x0.25.png",
			},
		weaponsx0125:
			{
				path: "/game-assets/weapons-x0.125.png",
			},
		bulbroHeroes:
			{
				path: "/game-assets/bulbro-heroes.png",
			},
		objects:
			{
				path: "/game-assets/objects.png",
			},
		allEnemies:
			{
				path: "/game-assets/all-enemies.png",
			},
	} as const;

export type AssetName =
	keyof typeof assetDefinitions;

type LoadOptions =
	{
		scaleMode?:
			| "nearest"
			| "linear";
	};

export class Assets {
	static async preloadAll(): Promise<void> {
		const assets =
			Object.values(
				assetDefinitions,
			);
		await Promise.all(
			assets.map(
				(
					asset,
				) =>
					PIXI.Assets.load(
						asset.path,
					),
			),
		);
	}

	static async get(
		name: AssetName,
		options?: LoadOptions,
	): Promise<PIXI.TextureSource> {
		const asset =
			assetDefinitions[
				name
			];
		const path =
			asset.path;

		return PIXI.Assets.load(
			options?.scaleMode
				? {
						src: path,
						data: {
							scaleMode:
								options.scaleMode,
						},
					}
				: path,
		);
	}
}

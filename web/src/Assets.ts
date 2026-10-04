import * as PIXI from "pixi.js";
import { audioEngine } from "@/audio/AudioEngine";

const assetDefinitions =
	{
		weapons:
			{
				path: new URL(
					"./assets/weapons.png",
					import.meta
						.url,
				)
					.href,
			},
		bulbroHeroes:
			{
				path: new URL(
					"./assets/bulbro-heroes.png",
					import.meta
						.url,
				)
					.href,
			},
		objects:
			{
				path: new URL(
					"./assets/objects.png",
					import.meta
						.url,
				)
					.href,
			},
		allEnemies:
			{
				path: new URL(
					"./assets/all-enemies.png",
					import.meta
						.url,
				)
					.href,
			},
		lightmap:
			{
				path: new URL(
					"./assets/lightmap.png",
					import.meta
						.url,
				)
					.href,
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
			[
				// Preload image assets
				...assets.map(
					(
						asset,
					) =>
						PIXI.Assets.load(
							asset.path,
						),
				),
				// Preload audio assets
				audioEngine.init(),
			],
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

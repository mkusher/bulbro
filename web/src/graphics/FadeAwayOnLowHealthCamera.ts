import * as PIXI from "pixi.js";
import { SimpleLightmapFilter } from "pixi-filters/simple-lightmap";
import type {
	Position,
	Size,
} from "@/geometry";
import type { WaveState } from "@/waveState";
import type { Camera } from "./Camera";
import { Assets } from "@/Assets";

/**
 * Decorator that darkens the screen when player health drops below 50%.
 * Uses SimpleLightmapFilter to linearly fade from alpha 1.0 at 50% hp to 0.5 at 0% hp.
 */
export class FadeAwayOnLowHealthCamera
	implements
		Camera
{
	#lightmap:
		| PIXI.Texture
		| undefined;
	#camera: Camera;
	#filter: SimpleLightmapFilter | null =
		null;

	constructor(
		camera: Camera,
	) {
		this.#camera =
			camera;
	}

	get stage() {
		return this
			.#camera
			.stage;
	}

	get ui() {
		return this
			.#camera
			.ui;
	}

	get ticker() {
		return this
			.#camera
			.ticker;
	}

	get canvas() {
		return this
			.#camera
			.canvas;
	}

	async init(
		size: Size,
	) {
		this.#lightmap =
			new PIXI.Texture(
				{
					source:
						await Assets.get(
							"lightmap",
						),
				},
			);
		await this.#camera.init(
			size,
		);
	}

	zoom(
		scale: number,
	) {
		this.#camera.zoom(
			scale,
		);
	}

	setCenter(
		position: Position,
	) {
		this.#camera.setCenter(
			position,
		);
	}

	update(
		state: WaveState,
	) {
		const player =
			state
				.players[0];
		const healthPoints =
			player?.healthPoints ??
			0;
		const maxHp =
			player
				?.stats
				.maxHp ??
			1;

		const ratio =
			maxHp >
			0
				? healthPoints /
					maxHp
				: 0;

		if (
			ratio >
			0.5
		) {
			this.#removeFilter();
		} else {
			const alpha =
				0 +
				(ratio /
					0.5) *
					1;
			this.#applyFilter(
				alpha,
			);
		}

		this.#camera.update(
			state,
		);
	}

	#applyFilter(
		alpha: number,
	) {
		if (
			!this
				.#filter
		) {
			this.#filter =
				new SimpleLightmapFilter(
					{
						lightMap:
							this
								.#lightmap!,
						alpha,
					},
				);
			this.stage.filters =
				[
					...(this
						.stage
						.filters ??
						[]),
					this
						.#filter,
				];
			return;
		}
		this.#filter.alpha =
			alpha;
	}

	#removeFilter() {
		if (
			!this
				.#filter
		) {
			return;
		}
		this.stage.filters =
			(
				this
					.stage
					.filters ??
				[]
			).filter(
				(
					f,
				) =>
					f !==
					this
						.#filter,
			);
		this.#filter =
			null;
	}
}

import * as PIXI from "pixi.js";
import { OutlineFilter } from "pixi-filters/outline";
import { findBulbroById } from "@/characters-definitions";
import type {
	Direction,
	Position,
} from "@/geometry";
import type { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { CharacterSprites } from "@/graphics/CharacterSprite";
import { DebugSprite } from "@/graphics/DebugSprite";
import { GameSprite } from "@/graphics/GameSprite";
import { ShadowSprite } from "@/graphics/ShadowSprite";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import {
	appearanceHeadroom,
	appearanceKey,
	type ResolvedAppearance,
	resolveAppearance,
} from "@/items/ItemAppearance";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { WeaponsSprite } from "@/weapon/sprites/WeaponsSprite.ts";
import type { BulbroState } from "../BulbroState";
import { BodySprite } from "./BodySprite.ts";
import {
	FaceSprite,
	type FaceType,
} from "./FaceSprite.ts";
import {
	type LegState,
	LegsSprite,
} from "./LegsSprite.ts";
import { OverheadHealthBar } from "./OverheadHealthBar.ts";
import { WearableSprite } from "./WearableSprite.ts";

export {
	type FaceType,
	faces,
	faceTypes,
} from "./FaceSprite.ts";

const fullSize =
	{
		width: 190,
		height: 280,
	};

const bodySize =
	{
		width: 100,
		height: 130,
	};

type RenderedAppearance =
	{
		characterSprites: CharacterSprites<PIXI.Container>;
		wearables: Promise<
			WearableSprite[]
		>;
	};

/**
 * Manages a player sprite graphic.
 */
export class BulbaSprite extends GameSprite {
	#sprite?: PIXI.Container;
	#debugSprite?: DebugSprite;
	#characterScaling = 0.3;
	#weaponsSprite: WeaponsSprite;
	#movement?: AnimatedSprite<PIXI.Container>;
	#idle?: AnimatedSprite<PIXI.Container>;
	#whenHit?: AnimatedSprite<PIXI.Container>;
	#whenDangerouslyHit?: AnimatedSprite<PIXI.Container>;
	#characterSprites?: CharacterSprites<PIXI.Container>;
	#shadow: ShadowSprite;
	#faceType: FaceType;
	#overheadHealthBar: OverheadHealthBar;
	#appearanceKey =
		"";
	#appearanceItems?: readonly string[];
	#frameRendering?: Promise<void>;
	/** Previous appearances, kept on screen until a frame of the new one is ready. */
	#retiredAppearances: RenderedAppearance[] =
		[];
	#wearables: Promise<
		WearableSprite[]
	> =
		Promise.resolve(
			[],
		);
	// One filter instance is shared by every cached frame
	#outlineFilter =
		new OutlineFilter(
			{
				thickness: 3,
				color: 0x000000,
				alpha: 1,
			},
		);

	constructor(
		faceType: FaceType,
		debug?: boolean,
	) {
		super(
			{
				anchor:
					"bottom-center",
				direction:
					{
						type: "flip",
					},
			},
		);
		this.#faceType =
			faceType;
		this.#shadow =
			new ShadowSprite(
				{
					width:
						fullSize.width *
						this
							.#characterScaling,
					height:
						fullSize.height *
						this
							.#characterScaling,
				},
			);
		this.#weaponsSprite =
			new WeaponsSprite(
				Boolean(
					debug,
				),
			);
		this.#overheadHealthBar =
			new OverheadHealthBar(
				bodySize.width *
					this
						.#characterScaling,
				bodySize.height *
					this
						.#characterScaling +
					5,
			);
		if (
			debug
		) {
			this.#debugSprite =
				new DebugSprite(
					fullSize,
					{
						anchor:
							"bottom-center",
					},
				);
		}
	}

	async init(
		bulbro: BulbroState,
	) {
		this.#shadow.appendTo(
			this
				.container,
		);
		if (
			this
				.#debugSprite
		) {
			this.#debugSprite.appendTo(
				this
					.container,
			);
		}
		this.update(
			bulbro,
			deltaTime(
				0,
			),
			nowTime(
				0,
			),
		);
		// Resolve once update has attached the first frame
		await this
			.#frameRendering;
	}

	/**
	 * Owned items are baked into cached animation frames,
	 * so the animations are rebuilt whenever the visible items change.
	 */
	#updateAppearance(
		bulbro: BulbroState,
	) {
		// State copies share the items array until an item is bought
		if (
			bulbro.items ===
			this
				.#appearanceItems
		) {
			return;
		}
		this.#appearanceItems =
			bulbro.items;
		const appearance =
			resolveAppearance(
				bulbro.items,
				findBulbroById(
					bulbro.characterId,
				)
					.style
					.wearingItems,
			);
		const key =
			appearanceKey(
				appearance,
			);
		if (
			this
				.#characterSprites &&
			key ===
				this
					.#appearanceKey
		) {
			return;
		}
		this.#appearanceKey =
			key;
		this.#overheadHealthBar.setHeadroom(
			appearanceHeadroom(
				appearance,
			) *
				this
					.#characterScaling,
		);
		if (
			this
				.#characterSprites
		) {
			this.#retiredAppearances.push(
				{
					characterSprites:
						this
							.#characterSprites,
					wearables:
						this
							.#wearables,
				},
			);
		}
		this.#wearables =
			this.#createWearables(
				appearance,
			);
		this.#createAnimations(
			this
				.#wearables,
		);
	}

	async #createWearables(
		appearance: ResolvedAppearance,
	) {
		const wearables =
			Object.values(
				appearance,
			).map(
				(
					wearable,
				) =>
					new WearableSprite(
						wearable,
					),
			);
		await Promise.all(
			wearables.map(
				(
					wearable,
				) =>
					wearable.init(),
			),
		);
		return wearables;
	}

	/** Frees the cached frames of appearances replaced by the current one. */
	#destroyRetiredAppearances() {
		for (const {
			characterSprites,
			wearables,
		} of this
			.#retiredAppearances) {
			characterSprites.destroy(
				{
					children: true,
					texture: true,
					textureSource: false,
				},
			);
			wearables.then(
				(
					sprites,
				) => {
					for (const sprite of sprites) {
						sprite.destroy();
					}
				},
			);
		}
		this.#retiredAppearances =
			[];
	}

	#createAnimations(
		wearables: Promise<
			WearableSprite[]
		>,
	) {
		this.#idle =
			this.#createSwingingAnimation(
				80,
				0.1,
				wearables,
			);
		this.#movement =
			this.#createWalkingAnimation(
				40,
				0.2,
				wearables,
			);
		this.#whenHit =
			this.#createSwingingAnimation(
				50,
				0.25,
				wearables,
			);

		this.#whenDangerouslyHit =
			this.#createSwingingAnimation(
				60,
				0.3,
				wearables,
			);

		this.#characterSprites =
			new CharacterSprites(
				{
					walking:
						this
							.#movement,
					hurt: this
						.#whenHit,
					hurtALot:
						this
							.#whenDangerouslyHit,
					idle: this
						.#idle,
				},
			);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	override appendTo(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
	): void {
		super.appendTo(
			parent,
			layer,
		);
		this.#overheadHealthBar.appendTo(
			parent,
			layer,
		);
	}

	update(
		player: BulbroState,
		delta: DeltaTime,
		now: NowTime,
	) {
		// A dead Bulbro disappears from the field until the next wave
		this.container.visible =
			player.isAlive();
		this.container.alpha =
			player.isInvulnerable(
				now,
			) &&
			Math.floor(
				now /
					50,
			) %
				2 ===
				0
				? 0.5
				: 1;
		this.#updateAppearance(
			player,
		);
		this.#updateSpritePosition(
			player.position,
			player.lastDirection,
		);

		if (
			this
				.#debugSprite
		) {
			const shape =
				player.toMovableObject();
			const rectangle =
				shape
					.shape
					.type ===
				"rectangle"
					? shape.shape
					: (() => {
							throw new Error(
								"Shape is not supported",
							);
						})();

			this.#debugSprite?.update(
				rectangle,
			);
		}
		this.#weaponsSprite.update(
			player,
			now,
		);

		this.#overheadHealthBar.update(
			player,
		);

		const characterSprites =
			this
				.#characterSprites;
		this.#frameRendering =
			characterSprites
				?.getSprite(
					player,
					delta,
					now,
				)
				.then(
					(
						sprite,
					) => {
						// Skip frames of an appearance replaced meanwhile
						if (
							sprite &&
							characterSprites ===
								this
									.#characterSprites
						) {
							this.#renderCharacterSprite(
								player,
								sprite,
							);
						}
					},
				);
	}

	#renderCharacterSprite =
		(
			player: BulbroState,
			sprite: PIXI.Container,
		) => {
			if (
				this
					.#sprite !==
				sprite
			) {
				if (
					this
						.#sprite
				) {
					sprite.x =
						this.#sprite.x;
					sprite.y =
						this.#sprite.y;
					this.#sprite?.removeFromParent();
				}
				this.#sprite =
					sprite;
				this.addChild(
					sprite,
				);
			}
			// Re-attach weapons to the current frame's weaponsContainer
			// Hierarchy: sprite (SwingingAnimation) -> character -> weaponsContainer
			const character =
				sprite
					.children[0] as PIXI.Container;
			const weaponsContainer =
				character
					.children[0] as PIXI.Container;
			this.#weaponsSprite.appendTo(
				weaponsContainer,
			);
			// Weapons left the replaced frame, so it is safe to free now
			this.#destroyRetiredAppearances();
			this.#updateSpritePosition(
				player.position,
				player.lastDirection,
			);
		};

	#updateSpritePosition(
		pos: Position,
		lastDirection?: Direction,
	): void {
		this.updatePosition(
			pos,
			lastDirection,
		);

		if (
			!this
				.#sprite
		) {
			return;
		}
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	override remove(): void {
		this.#weaponsSprite.remove();
		this.#overheadHealthBar.remove();
		super.remove();
	}

	#createSwingingAnimation(
		frameSpeed: number,
		amplitude: number,
		wearables: Promise<
			WearableSprite[]
		>,
	) {
		const swinging =
			new SwingingAnimation(
				(
					frame,
				) =>
					this.#buildCharacter(
						frame,
						wearables,
						"normal",
					),
				frameSpeed,
				amplitude,
				{
					x:
						-0.8,
					y: 1,
				},
			);
		return swinging.createAnimatedSprite();
	}

	#createWalkingAnimation(
		frameSpeed: number,
		amplitude: number,
		wearables: Promise<
			WearableSprite[]
		>,
	) {
		const cycleLength = 20;
		const swinging =
			new SwingingAnimation(
				(
					frame,
				) =>
					this.#buildCharacter(
						frame,
						wearables,
						this.#getLegStateForFrame(
							frame,
							cycleLength,
						),
					),
				frameSpeed,
				amplitude,
				{
					x:
						-0.8,
					y: 1,
				},
			);
		return swinging.createAnimatedSprite();
	}

	#getLegStateForFrame(
		frame: number,
		cycleLength: number,
	): LegState {
		// Divide the cycle into 4 phases for walking animation
		const phase =
			Math.floor(
				(frame /
					cycleLength) *
					4,
			) %
			4;
		switch (
			phase
		) {
			case 0:
				return "wide-l";
			case 1:
				return "normal-r";
			case 2:
				return "wide-r";
			case 3:
				return "normal";
			default:
				return "normal";
		}
	}

	async #buildCharacter(
		frame: number,
		wearables: Promise<
			WearableSprite[]
		>,
		legState: LegState = "normal",
	) {
		const bodySprite =
			new BodySprite();
		const legsSprite =
			new LegsSprite();

		const faceSprite =
			new FaceSprite(
				this
					.#faceType,
			);
		const [
			wearableSprites,
		] =
			await Promise.all(
				[
					wearables,
					bodySprite.init(),
					legsSprite.init(),
					faceSprite.init(),
				],
			);
		const bodySize =
			bodySprite.size;
		const character =
			new PIXI.Container();
		const weaponsContainer =
			new PIXI.Container();
		const scaling =
			new PIXI.Container();
		scaling.scale =
			this.#characterScaling;
		weaponsContainer.addChild(
			scaling,
		);
		character.addChild(
			weaponsContainer,
		);
		bodySprite.appendTo(
			scaling,
		);
		legsSprite.appendTo(
			scaling,
			bodySize,
			legState,
		);
		faceSprite.appendTo(
			scaling,
			bodySize,
		);
		for (const wearable of wearableSprites) {
			wearable.appendTo(
				scaling,
				bodySize,
			);
		}
		scaling.filters =
			[
				this
					.#outlineFilter,
			];

		// Use fixed body dimensions for offset calculation, not dynamic container bounds.
		// Container bounds change when weapons rotate, causing unwanted character movement.
		const scaledBodyHeight =
			bodySize.height *
			this
				.#characterScaling;
		const scaledBodyWidth =
			bodySize.width *
			this
				.#characterScaling;
		weaponsContainer.y =
			-scaledBodyHeight -
			5;
		weaponsContainer.x =
			-scaledBodyWidth /
			2;
		return character;
	}
}

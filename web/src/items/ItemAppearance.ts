import itemsAtlas from "@/assets/items.json";
import wearablesAtlas from "@/assets/wearables.json";
import type { WearingItem } from "@/bulbro/BulbroCharacter";
import type { Point } from "@/geometry";

/** Where a wearable sits on the bulbro; each slot shows at most one item. */
export type AppearanceSlot =
	"head";

/**
 * Artwork source for a wearable: "items" reuses the shop icon,
 * "wearables" is dedicated on-character artwork and
 * "bulbroHeroes" holds character accessories next to the body parts.
 */
export type WearableAtlasName =
	| "items"
	| "wearables"
	| "bulbroHeroes";

type AtlasFrame =
	{
		x: number;
		y: number;
		w: number;
		h: number;
	};

export const wearableAtlases: Record<
	WearableAtlasName,
	{
		frames: Record<
			string,
			AtlasFrame
		>;
	}
> =
	{
		items:
			itemsAtlas,
		wearables:
			wearablesAtlas,
		bulbroHeroes:
			{
				frames:
					{
						crown:
							{
								x: 64,
								y: 286,
								w: 113,
								h: 75,
							},
					},
			},
	};

/**
 * How an owned item changes the rendered bulbro. Coordinates are in body
 * texture pixels: offset is where the frame's center goes, relative to the
 * top-center of the body.
 */
export type ItemAppearance =
	{
		slot: AppearanceSlot;
		atlas: WearableAtlasName;
		/** Atlas frame name, defaults to the item id. */
		frame?: string;
		offset: Point;
		scale: number;
		/** Extra horizontal scale, to fit the item around the bulbro head. */
		stretchX?: number;
		/** Flips the artwork horizontally. */
		mirror?: boolean;
		rotation?: number;
	};

export const itemAppearances: Readonly<
	Record<
		string,
		ItemAppearance
	>
> =
	{
		beanie:
			{
				slot: "head",
				atlas:
					"wearables",
				offset:
					{
						x: 0,
						y: 14,
					},
				scale: 0.75,
				stretchX: 1.2,
				mirror: true,
			},
		bowlerHat:
			{
				slot: "head",
				atlas:
					"items",
				offset:
					{
						x: 0,
						y: 10,
					},
				scale: 0.75,
				mirror: true,
			},
		helmet:
			{
				slot: "head",
				atlas:
					"wearables",
				offset:
					{
						x: 0,
						y: 24,
					},
				scale: 0.85,
				mirror: true,
			},
		propellerHat:
			{
				slot: "head",
				atlas:
					"items",
				offset:
					{
						x: 0,
						y: 3,
					},
				scale: 0.75,
				mirror: true,
			},
		warriorHelmet:
			{
				slot: "head",
				atlas:
					"wearables",
				offset:
					{
						x:
							-13,
						y: 22,
					},
				scale: 1.4,
				stretchX: 1.4,
			},
		// The open mouth frames the face, like a hood
		wolfHelmet:
			{
				slot: "head",
				atlas:
					"wearables",
				offset:
					{
						x:
							-5,
						y: 38,
					},
				scale: 1.05,
				stretchX: 1.45,
			},
	};

/** Accessories a character wears by default, until an owned item takes the slot. */
export const characterWearableAppearances: Readonly<
	Partial<
		Record<
			WearingItem,
			ItemAppearance
		>
	>
> =
	{
		crown:
			{
				slot: "head",
				atlas:
					"bulbroHeroes",
				offset:
					{
						x: 0,
						y:
							-12,
					},
				scale: 0.7,
			},
	};

export type ResolvedWearable =
	{
		itemId: string;
		appearance: ItemAppearance;
	};

export type ResolvedAppearance =
	Partial<
		Record<
			AppearanceSlot,
			ResolvedWearable
		>
	>;

/**
 * Character accessories fill their slots first,
 * then the most recently bought item wins its slot.
 */
export function resolveAppearance(
	items: readonly string[],
	characterWearables: readonly WearingItem[] = [],
): ResolvedAppearance {
	const resolved: ResolvedAppearance =
		{};
	for (const wearingItem of characterWearables) {
		const appearance =
			characterWearableAppearances[
				wearingItem
			];
		if (
			appearance
		) {
			resolved[
				appearance.slot
			] =
				{
					itemId:
						wearingItem,
					appearance,
				};
		}
	}
	for (const itemId of items) {
		const appearance =
			itemAppearances[
				itemId
			];
		if (
			appearance
		) {
			resolved[
				appearance.slot
			] =
				{
					itemId,
					appearance,
				};
		}
	}
	return resolved;
}

/** Stable identity of a resolved appearance, to detect when sprites must be rebuilt. */
export function appearanceKey(
	appearance: ResolvedAppearance,
): string {
	return Object.entries(
		appearance,
	)
		.map(
			([
				slot,
				wearable,
			]) =>
				`${slot}:${wearable.itemId}`,
		)
		.sort()
		.join(
			",",
		);
}

export function wearableFrame(
	appearance: ItemAppearance,
	itemId: string,
):
	| AtlasFrame
	| undefined {
	const frames =
		wearableAtlases[
			appearance
				.atlas
		]
			.frames;
	const name =
		appearance.frame ??
		itemId;
	return Object.prototype.hasOwnProperty.call(
		frames,
		name,
	)
		? frames[
				name
			]
		: undefined;
}

/** How far wearables stick out above the body top, in body texture pixels. */
export function appearanceHeadroom(
	appearance: ResolvedAppearance,
): number {
	let headroom = 0;
	for (const wearable of Object.values(
		appearance,
	)) {
		const frame =
			wearableFrame(
				wearable.appearance,
				wearable.itemId,
			);
		if (
			!frame
		)
			continue;
		const {
			scale,
			stretchX = 1,
			rotation = 0,
			offset,
		} = wearable.appearance;
		// Vertical half-extent of the frame's bounding box once rotated
		const halfHeight =
			((frame.w *
				stretchX *
				Math.abs(
					Math.sin(
						rotation,
					),
				) +
				frame.h *
					Math.abs(
						Math.cos(
							rotation,
						),
					)) *
				scale) /
			2;
		headroom =
			Math.max(
				headroom,
				halfHeight -
					offset.y,
			);
	}
	return headroom;
}

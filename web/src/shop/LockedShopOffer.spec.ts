import {
	expect,
	it,
} from "bun:test";
import { BulbroState } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import { classicMapSize } from "@/game-canvas";
import { withEventMeta } from "@/game-events/GameEvents";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	createInitialState,
	nextWave,
	updateState,
} from "@/waveState";
import {
	restoreLockedOffers,
	saveLockedOffer,
} from "./LockedShopOffer";
import { generateShopItems } from "./ShopItemsGenerator";

it("retains serializable locks across wave initialization while resetting both reroll counters", () => {
	const initial =
		createInitialState(
			[
				{
					id: "p1",
					bulbro:
						wellRoundedBulbro,
				},
			],
			classicMapSize,
			0,
		);
	const offers =
		generateShopItems(
			wellRoundedBulbro,
			{
				random:
					() =>
						0.5,
			},
		).map(
			saveLockedOffer,
		);
	const locked =
		updateState(
			initial,
			withEventMeta(
				{
					type: "shopLocksChanged",
					playerId:
						"p1",
					offers,
				},
				deltaTime(
					0,
				),
				nowTime(
					0,
				),
			),
		);
	const player =
		new BulbroState(
			{
				...locked.players[0]!.toJSON(),
				rerollCount: 3,
				upgradeRerollCount: 2,
			},
		);
	const next =
		nextWave(
			{
				...locked,
				players:
					[
						player,
					],
			},
			{
				type: "tick",
				deltaTime:
					deltaTime(
						0,
					),
				occurredAt:
					nowTime(
						1,
					),
			},
		);
	const restored =
		new BulbroState(
			JSON.parse(
				JSON.stringify(
					next.players[0]!.toJSON(),
				),
			),
		);
	expect(
		restored.rerollCount,
	).toBe(
		0,
	);
	expect(
		restored.upgradeRerollCount,
	).toBe(
		0,
	);
	expect(
		restored.lockedShopOffers,
	).toEqual(
		offers,
	);
	expect(
		restoreLockedOffers(
			restored.lockedShopOffers,
		).map(
			saveLockedOffer,
		),
	).toEqual(
		offers,
	);
});

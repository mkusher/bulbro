import {
	describe,
	expect,
	test,
} from "bun:test";
import { type } from "arktype";
import {
	type SerializedPlayer,
	WebsocketMessage,
} from "./index";

function serializedPlayer(
	id: string,
): SerializedPlayer {
	return {
		id,
		characterId:
			"well-rounded",
		level: 1,
		totalExperience: 20,
		materialsAvailable: 12,
		healthPoints: 10,
		statSources:
			[
				{
					id: "character",
					kind: "character",
					bonuses:
						{
							maxHp: 5,
						},
				},
				{
					id: "item:0:acid",
					kind: "item",
					bonuses:
						{
							maxHp: 8,
							dodge:
								-2,
						},
				},
			],
		items:
			[
				"acid",
			],
		weapons:
			[
				{
					id: "pistol",
					type: "pistol",
					tier: 2,
					statsBonus:
						{
							damage: 12,
						},
					shotSpeed: 10,
				},
			],
	};
}

describe("live game protocol", () => {
	test.each(
		[
			"game-state-updated-by-host",
			"game-state-updated-by-guest",
		] as const,
	)(
		"accepts %s event batches and preserves their payload",
		(messageType) => {
			const message =
				{
					type: messageType,
					gameId:
						"game-1",
					version: 1,
					events:
						[
							{
								type: "tick",
								occurredAt: 12,
								deltaTime: 16,
							},
						],
					sentAt: 100,
				};

			expect(
				WebsocketMessage(
					message,
				),
			).toEqual(
				message,
			);
		},
	);

	test("rejects the former state-object shape", () => {
		const result =
			WebsocketMessage(
				{
					type: "game-state-updated-by-host",
					gameId:
						"game-1",
					version: 1,
					state:
						{},
				},
			);

		expect(
			result,
		).toBeInstanceOf(
			type.errors,
		);
	});

	test("accepts position updates", () => {
		const message =
			{
				type: "game-state-position-updated" as const,
				gameId:
					"game-1",
				playerId:
					"player-1",
				position:
					{
						x: 1,
						y: 2,
					},
				direction:
					{
						x: 0,
						y: 1,
					},
				version: 0,
				sentAt: 20,
			};

		expect(
			WebsocketMessage(
				message,
			),
		).toEqual(
			message,
		);
	});

	test("accepts next wave readiness with the full player state", () => {
		const message =
			{
				type: "next-wave-player-ready" as const,
				gameId:
					"game-1",
				wave: 2,
				playerId:
					"player-1",
				player:
					{
						...serializedPlayer(
							"player-1",
						),
						lastHitAt: 0,
					},
				sentAt: 20,
			};

		expect(
			WebsocketMessage(
				message,
			),
		).toEqual(
			message,
		);
	});

	test("rejects next wave readiness with a fractional wave", () => {
		expect(
			WebsocketMessage(
				{
					type: "next-wave-player-ready",
					gameId:
						"game-1",
					wave: 1.5,
					playerId:
						"player-1",
					player:
						serializedPlayer(
							"player-1",
						),
					sentAt: 20,
				},
			),
		).toBeInstanceOf(
			type.errors,
		);
	});

	test("rejects next wave readiness without the player's character", () => {
		expect(
			WebsocketMessage(
				{
					type: "next-wave-player-ready",
					gameId:
						"game-1",
					wave: 2,
					playerId:
						"player-1",
					player:
						{
							id: "player-1",
						},
					sentAt: 20,
				},
			),
		).toBeInstanceOf(
			type.errors,
		);
	});

	test("accepts withdrawn next wave readiness", () => {
		const message =
			{
				type: "next-wave-player-not-ready" as const,
				gameId:
					"game-1",
				wave: 2,
				playerId:
					"player-1",
				sentAt: 20,
			};

		expect(
			WebsocketMessage(
				message,
			),
		).toEqual(
			message,
		);
	});

	test("accepts next wave start with every player's state", () => {
		const message =
			{
				type: "next-wave-started" as const,
				gameId:
					"game-1",
				wave: 2,
				players:
					[
						serializedPlayer(
							"host",
						),
						serializedPlayer(
							"guest",
						),
					],
				serverStartTime: 100,
			};

		expect(
			WebsocketMessage(
				message,
			),
		).toEqual(
			message,
		);
	});

	test.each(
		[
			[
				"items",
				{
					items:
						undefined,
				},
			],
			[
				"a non-string item",
				{
					items:
						[
							1,
						],
				},
			],
			[
				"stat sources",
				{
					statSources:
						undefined,
				},
			],
			[
				"an unknown stat source kind",
				{
					statSources:
						[
							{
								id: "x",
								kind: "cheat",
								bonuses:
									{},
							},
						],
				},
			],
			[
				"a non-numeric stat bonus",
				{
					statSources:
						[
							{
								id: "character",
								kind: "character",
								bonuses:
									{
										maxHp:
											"5",
									},
							},
						],
				},
			],
			[
				"an invalid weapon tier",
				{
					weapons:
						[
							{
								id: "pistol",
								type: "pistol",
								tier: 5,
								statsBonus:
									{},
								shotSpeed: 10,
							},
						],
				},
			],
		] as const,
	)(
		"rejects next wave readiness with invalid %s",
		(_, override) => {
			expect(
				WebsocketMessage(
					{
						type: "next-wave-player-ready",
						gameId:
							"game-1",
						wave: 2,
						playerId:
							"player-1",
						player:
							{
								...serializedPlayer(
									"player-1",
								),
								...override,
							},
						sentAt: 20,
					},
				),
			).toBeInstanceOf(
				type.errors,
			);
		},
	);
});

import {
	describe,
	expect,
	test,
} from "bun:test";
import { type } from "arktype";
import { WebsocketMessage } from "./index";

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
						id: "player-1",
						materialsAvailable: 12,
						weapons:
							[],
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
						{
							id: "host",
							healthPoints: 10,
						},
						{
							id: "guest",
							healthPoints: 5,
						},
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
});

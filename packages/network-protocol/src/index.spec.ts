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
	)("accepts %s event batches and preserves their payload", (messageType) => {
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
	});

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
});

import {
	expect,
	test,
} from "bun:test";
import { Hono } from "hono";
import type { Logger } from "pino";
import { issueToken } from "../../../server/src/auth";
import { registry } from "../../../server/src/games-registry";
import { configureApi } from "../../../server/src/router";
import { bulbros } from "../../../web/src/characters-definitions";
import { createPlayer } from "../../../web/src/player";

test("ready accepts every character's available starting weapons", async () => {
	const app =
		new Hono();
	configureApi(
		app,
		{
			info() {},
		} as unknown as Logger,
	);
	const id =
		crypto.randomUUID();
	const {
		token,
	} =
		await issueToken(
			id,
		);
	const lobby =
		registry.registerLobby(
			{
				id,
				username:
					"Host",
			},
		);
	for (const bulbro of bulbros) {
		for (const weapon of bulbro.availableWeapons) {
			const player =
				createPlayer(
					id,
					bulbro,
					[
						weapon,
					],
				);
			const response =
				await app.request(
					`/game-lobby/${lobby.id}/ready`,
					{
						method:
							"POST",
						headers:
							{
								Authorization: `Bearer ${token}`,
							},
						body: JSON.stringify(
							{
								player,
							},
						),
					},
				);
			expect(
				response.status,
				`${bulbro.id} with ${weapon.id}`,
			).toBe(
				200,
			);
			expect(
				(
					await response.json()
				)
					.lobby
					.readyPlayers,
			).toEqual(
				[
					player,
				],
			);
		}
	}
});

test("ready rejects nonnumeric weapon scaling without marking the player ready", async () => {
	const app =
		new Hono();
	configureApi(
		app,
		{
			info() {},
		} as unknown as Logger,
	);
	const id =
		crypto.randomUUID();
	const {
		token,
	} =
		await issueToken(
			id,
		);
	const lobby =
		registry.registerLobby(
			{
				id,
				username:
					"Host",
			},
		);
	const bulbro =
		bulbros[0]!;
	const weapon =
		bulbro
			.availableWeapons[0]!;
	const player =
		createPlayer(
			id,
			bulbro,
			[
				{
					...weapon,
					statsBonus:
						{
							scaling:
								{
									rangedDamage:
										"invalid" as unknown as number,
								},
						},
				},
			],
		);
	const response =
		await app.request(
			`/game-lobby/${lobby.id}/ready`,
			{
				method:
					"POST",
				headers:
					{
						Authorization: `Bearer ${token}`,
					},
				body: JSON.stringify(
					{
						player,
					},
				),
			},
		);
	expect(
		response.status,
	).toBe(
		400,
	);
	expect(
		await response.json(),
	).toEqual(
		{
			error:
				"Invalid player",
		},
	);
	expect(
		registry.find(
			lobby.id,
		)
			?.readyPlayers,
	).toEqual(
		[],
	);
});

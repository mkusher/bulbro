import {
	expect,
	test,
} from "bun:test";
import { Hono } from "hono";
import type { Logger } from "pino";
import { issueToken } from "./auth";
import { registry } from "./games-registry";
import { configureApi } from "./router";
import type { WebsocketConnection } from "./websocket-connection";
import { websocketConnections } from "./websocket-connections";

test("room creation requires a token matching the host", async () => {
	const app =
		new Hono();
	configureApi(
		app,
		{
			info: () => {},
		} as unknown as Logger,
	);
	const hostId =
		crypto.randomUUID();
	const {
		token,
	} =
		await issueToken(
			hostId,
		);
	const body =
		JSON.stringify(
			{
				host: {
					id: hostId,
					username:
						"host",
				},
			},
		);
	const request =
		(
			authorization?: string,
			requestBody = body,
		) =>
			app.request(
				"/game-lobby",
				{
					method:
						"POST",
					headers:
						authorization
							? {
									Authorization:
										authorization,
								}
							: {},
					body: requestBody,
				},
			);
	expect(
		(
			await request()
		)
			.status,
	).toBe(
		401,
	);
	expect(
		(
			await request(
				`Bearer ${token}`,
				JSON.stringify(
					{
						host: {
							id: "other",
							username:
								"other",
						},
					},
				),
			)
		)
			.status,
	).toBe(
		403,
	);
	const response =
		await request(
			`Bearer ${token}`,
		);
	expect(
		response.status,
	).toBe(
		200,
	);
	expect(
		(
			await response.json()
		)
			.lobby
			.hostId,
	).toBe(
		hostId,
	);
});

test("game start requires the host, two ready online players, and matching state", async () => {
	const app =
		new Hono();
	configureApi(
		app,
		{
			info: () => {},
		} as unknown as Logger,
	);
	const hostId =
		crypto.randomUUID();
	const guestId =
		crypto.randomUUID();
	const lobby =
		registry.registerLobby(
			{
				id: hostId,
				username:
					"Host",
			},
		);
	const hostToken =
		(
			await issueToken(
				hostId,
			)
		)
			.token;
	const guestToken =
		(
			await issueToken(
				guestId,
			)
		)
			.token;
	const start =
		(
			token: string,
			players: string[],
		) =>
			app.request(
				`/game/${lobby.id}/start`,
				{
					method:
						"POST",
					headers:
						{
							Authorization: `Bearer ${token}`,
						},
					body: JSON.stringify(
						{
							state:
								{
									players:
										players.map(
											(
												id,
											) => ({
												id,
											}),
										),
								},
						},
					),
				},
			);
	const ready =
		(
			id: string,
		) => ({
			id,
			bulbro:
				{
					id: "bulbro",
					name: "Bulbro",
					statBonuses:
						{},
					style:
						{
							faceType:
								"normal",
							wearingItems:
								[],
						},
					weapons:
						[],
				},
		});
	expect(
		(
			await start(
				hostToken,
				[
					hostId,
				],
			)
		)
			.status,
	).toBe(
		409,
	);
	registry.addPlayer(
		lobby.id,
		{
			id: guestId,
			username:
				"Guest",
		},
	);
	expect(
		(
			await start(
				guestToken,
				[
					hostId,
					guestId,
				],
			)
		)
			.status,
	).toBe(
		403,
	);
	registry.markReady(
		lobby.id,
		ready(
			hostId,
		),
	);
	registry.markReady(
		lobby.id,
		ready(
			guestId,
		),
	);
	registry.markConnected(
		lobby.id,
		hostId,
	);
	registry.markConnected(
		lobby.id,
		guestId,
	);
	expect(
		(
			await start(
				hostToken,
				[
					hostId,
					guestId,
				],
			)
		)
			.status,
	).toBe(
		409,
	);
	const received: object[] =
		[];
	const fakeSocket =
		(
			sink: object[],
		) =>
			({
				sendObject:
					(
						message: object,
					) =>
						sink.push(
							message,
						),
			}) as unknown as WebsocketConnection;
	websocketConnections.add(
		hostId,
		fakeSocket(
			[],
		),
	);
	websocketConnections.add(
		guestId,
		fakeSocket(
			received,
		),
	);
	try {
		expect(
			(
				await start(
					hostToken,
					[
						hostId,
						"stranger",
					],
				)
			)
				.status,
		).toBe(
			400,
		);
		expect(
			(
				await start(
					hostToken,
					[
						hostId,
						guestId,
					],
				)
			)
				.status,
		).toBe(
			200,
		);
		expect(
			received,
		).toHaveLength(
			1,
		);
	} finally {
		websocketConnections.remove(
			hostId,
		);
		websocketConnections.remove(
			guestId,
		);
	}
});

test("readiness requires the exact starting weapon count within capacity", async () => {
	const app =
		new Hono();
	configureApi(
		app,
		{
			info: () => {},
		} as unknown as Logger,
	);
	const id =
		crypto.randomUUID();
	const lobby =
		registry.registerLobby(
			{
				id,
				username:
					"Host",
			},
		);
	const {
		token,
	} =
		await issueToken(
			id,
		);
	const weapon =
		{
			id: "smg",
			name: "SMG",
			classes:
				[],
			statsBonus:
				{},
			shotSpeed: 1,
		};
	const ready =
		(
			count: number,
			statBonuses = {},
		) =>
			app.request(
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
							player:
								{
									id,
									bulbro:
										{
											id: "custom",
											name: "Custom",
											statBonuses,
											style:
												{
													faceType:
														"normal",
													wearingItems:
														[],
												},
											weapons:
												Array(
													count,
												).fill(
													weapon,
												),
										},
								},
						},
					),
				},
			);
	expect(
		(
			await ready(
				0,
			)
		)
			.status,
	).toBe(
		400,
	);
	expect(
		(
			await ready(
				2,
			)
		)
			.status,
	).toBe(
		400,
	);
	expect(
		registry.find(
			lobby.id,
		)
			?.readyPlayers,
	).toHaveLength(
		0,
	);
	expect(
		(
			await ready(
				1,
			)
		)
			.status,
	).toBe(
		200,
	);
	expect(
		(
			await ready(
				2,
				{
					startingWeapons: 1,
					maxWeapons:
						-4,
				},
			)
		)
			.status,
	).toBe(
		200,
	);
	expect(
		(
			await ready(
				7,
				{
					startingWeapons: 6,
				},
			)
		)
			.status,
	).toBe(
		400,
	);
	expect(
		registry.find(
			lobby.id,
		)
			?.readyPlayers[0]
			?.bulbro
			.weapons,
	).toHaveLength(
		2,
	);
	expect(
		(
			await ready(
				7,
				{
					startingWeapons: 6,
					maxWeapons: 1,
				},
			)
		)
			.status,
	).toBe(
		200,
	);
});

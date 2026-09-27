import {
	expect,
	test,
} from "bun:test";
import { Hono } from "hono";
import type { Logger } from "pino";
import { issueToken } from "./auth";
import { configureApi } from "./router";

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

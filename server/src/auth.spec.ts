import {
	expect,
	test,
} from "bun:test";
import {
	issueToken,
	verifyToken,
} from "./auth";

test("issues a signed token with identity and expiry", async () => {
	const {
		token,
		authenticatedAt,
		expires,
	} =
		await issueToken(
			"player-1",
		);
	expect(
		await verifyToken(
			token,
		),
	).toEqual(
		{
			id: "player-1",
			authenticatedAt,
			expires,
		},
	);
	expect(
		expires,
	).toBeGreaterThan(
		authenticatedAt,
	);
});

test("rejects tampered and malformed tokens", async () => {
	const {
		token,
	} =
		await issueToken(
			"player-1",
		);
	const [
		header,
		payload,
		signature,
	] =
		token.split(
			".",
		);
	const changed =
		Buffer.from(
			JSON.stringify(
				{
					id: "player-2",
					authenticatedAt: 1,
					expires:
						Date.now() +
						10000,
				},
			),
		).toString(
			"base64url",
		);
	expect(
		await verifyToken(
			`${header}.${changed}.${signature}`,
		),
	).toBeNull();
	expect(
		await verifyToken(
			`${header}.${payload}.${signature}x`,
		),
	).toBeNull();
	expect(
		await verifyToken(
			"bad-token",
		),
	).toBeNull();
});

test("rejects a token at its expiry", async () => {
	const {
		token,
		expires,
	} =
		await issueToken(
			"player-1",
		);
	const originalNow =
		Date.now;
	Date.now =
		() =>
			expires;
	try {
		expect(
			await verifyToken(
				token,
			),
		).toBeNull();
	} finally {
		Date.now =
			originalNow;
	}
});

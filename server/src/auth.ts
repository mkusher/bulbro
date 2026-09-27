import { type } from "arktype";

const Claims =
	type(
		{
			id: "string",
			authenticatedAt:
				"number",
			expires:
				"number",
		},
	);
export type Claims =
	typeof Claims.infer;
const secret =
	new TextEncoder().encode(
		Bun
			.env
			.JWT_SECRET ??
			crypto.randomUUID(),
	);
const key =
	crypto.subtle.importKey(
		"raw",
		secret,
		{
			name: "HMAC",
			hash: "SHA-256",
		},
		false,
		[
			"sign",
			"verify",
		],
	);
const encoder =
	new TextEncoder();
const decoder =
	new TextDecoder();

function encode(
	value: object,
) {
	return Buffer.from(
		JSON.stringify(
			value,
		),
	).toString(
		"base64url",
	);
}

export async function issueToken(
	id: string,
) {
	const authenticatedAt =
		Date.now();
	const expires =
		authenticatedAt +
		24 *
			60 *
			60 *
			1000;
	const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ id, authenticatedAt, expires })}`;
	const signature =
		await crypto.subtle.sign(
			"HMAC",
			await key,
			encoder.encode(
				body,
			),
		);
	return {
		token: `${body}.${Buffer.from(signature).toString("base64url")}`,
		authenticatedAt,
		expires,
	};
}

export async function verifyToken(
	token:
		| string
		| undefined,
): Promise<Claims | null> {
	if (
		!token
	)
		return null;
	const parts =
		token.split(
			".",
		);
	if (
		parts.length !==
		3
	)
		return null;
	const [
		headerPart,
		payloadPart,
		signaturePart,
	] =
		parts as [
			string,
			string,
			string,
		];
	try {
		const header =
			JSON.parse(
				decoder.decode(
					Buffer.from(
						headerPart,
						"base64url",
					),
				),
			);
		if (
			header.alg !==
				"HS256" ||
			header.typ !==
				"JWT"
		)
			return null;
		const valid =
			await crypto.subtle.verify(
				"HMAC",
				await key,
				Uint8Array.from(
					Buffer.from(
						signaturePart,
						"base64url",
					),
				),
				encoder.encode(
					`${headerPart}.${payloadPart}`,
				),
			);
		if (
			!valid
		)
			return null;
		const claims =
			Claims(
				JSON.parse(
					decoder.decode(
						Buffer.from(
							payloadPart,
							"base64url",
						),
					),
				),
			);
		if (
			claims instanceof
				type.errors ||
			claims.expires <=
				Date.now() ||
			claims.authenticatedAt >
				Date.now() ||
			claims.expires <=
				claims.authenticatedAt
		)
			return null;
		return claims;
	} catch {
		return null;
	}
}

export async function authenticateHeader(
	header:
		| string
		| undefined,
) {
	const match =
		/^Bearer (\S+)$/i.exec(
			header ??
				"",
		);
	return verifyToken(
		match?.[1],
	);
}

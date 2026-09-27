import { signal } from "@preact/signals";
import { type } from "arktype";
import { generateStupidName } from "@/profile/silly-name";
import { apiUrl } from "./clientConfig";

const UserSchema =
	type(
		{
			id: "string",
			username:
				"string",
			"isGuest?":
				"boolean",
		},
	);

export type User =
	typeof UserSchema.infer;

export const sessionToken =
	signal<
		| string
		| null
	>(
		null,
	);
export function authorizationHeaders() {
	if (
		!sessionToken.value
	)
		throw new Error(
			"Sign in before joining a network game",
		);
	return {
		Authorization: `Bearer ${sessionToken.value}`,
	};
}

export async function createUser() {
	const url =
		new URL(
			"users",
			apiUrl,
		);
	const {
		isGuest,
		...user
	} =
		currentUser.value;
	const res =
		await fetch(
			url,
			{
				method:
					"POST",
				body: JSON.stringify(
					user,
				),
			},
		);
	const body =
		await res.json();
	if (
		!res.ok ||
		typeof body.token !==
			"string"
	) {
		currentUser.value =
			{
				...currentUser.value,
				isGuest: true,
			};
		throw new Error(
			"Sign in failed",
		);
	}

	const newUser =
		UserSchema(
			body.user,
		);

	if (
		newUser instanceof
		type.errors
	) {
		currentUser.value =
			{
				...currentUser.value,
				isGuest: true,
			};
		throw newUser;
	}

	currentUser.value =
		newUser;
	sessionToken.value =
		body.token;
}

const guest =
	{
		id: "guest",
		username:
			generateStupidName(),
		isGuest: true,
	};

export const currentUser =
	signal<User>(
		guest,
	);

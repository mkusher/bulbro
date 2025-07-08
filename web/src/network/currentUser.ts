import { signal } from "@preact/signals";
import { apiUrl } from "./clientConfig";
import { type } from "arktype";

const UserSchema = type({
	id: "string",
	username: "string",
	"isGuest?": "boolean",
});

type User = typeof UserSchema.infer;

export async function createUser() {
	const url = new URL("users", apiUrl);
	const { isGuest, ...user } = currentUser.value;
	currentUser.value = user;
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify(user),
	});
	const body = await res.json();

	const newUser = UserSchema(body.user);

	if (newUser instanceof type.errors) {
		currentUser.value = {
			...currentUser.value,
			isGuest: true,
		};
		throw newUser;
	}

	currentUser.value = newUser;
}

const guest = {
	id: "guest",
	username: "Le Guest",
	isGuest: true,
};

export const currentUser = signal<User>(guest);

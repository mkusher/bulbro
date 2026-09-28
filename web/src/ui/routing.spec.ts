import {
	afterEach,
	expect,
	it,
} from "bun:test";
import { getJoinLobbyUrl } from "./routing";

const happyDOM =
	(
		window as unknown as {
			happyDOM: {
				setURL(
					url: string,
				): void;
			};
		}
	)
		.happyDOM;
const originalURL =
	window
		.location
		.href;
afterEach(
	() =>
		happyDOM.setURL(
			originalURL,
		),
);

it("shares a lobby on the current site with an encoded ID", () => {
	happyDOM.setURL(
		"https://bulbro.space/find-lobby",
	);
	expect(
		getJoinLobbyUrl(
			"game 123",
		),
	).toBe(
		"https://bulbro.space/lobby/game%20123",
	);
});

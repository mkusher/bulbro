import {
	afterEach,
	expect,
	it,
} from "bun:test";
import {
	h,
	render,
} from "preact";
import { LocationProvider } from "preact-iso";

const originalFetch =
	globalThis.fetch;
const originalWebSocket =
	globalThis.WebSocket;
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
	async () => {
		const {
			currentLobby,
		} =
			await import(
				"@/network/currentLobby"
			);
		const {
			sessionToken,
		} =
			await import(
				"@/network/currentUser"
			);
		currentLobby.value?.close();
		currentLobby.value =
			null;
		sessionToken.value =
			null;
		globalThis.fetch =
			originalFetch;
		globalThis.WebSocket =
			originalWebSocket;
		happyDOM.setURL(
			originalURL,
		);
		document.body.replaceChildren();
	},
);

it("joins a lobby from its direct URL after creating a session", async () => {
	happyDOM.setURL(
		"https://bulbro.space/lobby/game-123",
	);
	const requests: URL[] =
		[];
	globalThis.fetch =
		(async (
			input:
				| RequestInfo
				| URL,
		) => {
			const url =
				new URL(
					String(
						input,
					),
				);
			requests.push(
				url,
			);
			if (
				url.pathname ===
				"/api/users"
			) {
				return Response.json(
					{
						user: {
							id: "guest-id",
							username:
								"Guest",
						},
						token:
							"test-token",
					},
				);
			}
			return Response.json(
				{
					lobby:
						{
							id: "game-123",
							hostId:
								"host-id",
							createdAt: 1,
							players:
								[
									{
										id: "host-id",
										username:
											"Host",
									},
									{
										id: "guest-id",
										username:
											"Guest",
									},
								],
							readyPlayers:
								[],
						},
				},
			);
		}) as typeof fetch;
	class TestWebSocket extends EventTarget {
		constructor(
			_url:
				| string
				| URL,
		) {
			super();
		}
		send(
			_message: string,
		) {}
		close() {}
	}
	globalThis.WebSocket =
		TestWebSocket as unknown as typeof WebSocket;
	const {
		JoinLobby,
	} =
		await import(
			"./JoinLobby"
		);
	const {
		currentLobby,
	} =
		await import(
			"@/network/currentLobby"
		);
	const container =
		document.createElement(
			"div",
		);
	document.body.append(
		container,
	);
	render(
		h(
			LocationProvider,
			{},
			h(
				JoinLobby,
				{
					id: "game-123",
					params:
						{
							id: "game-123",
						},
				},
			),
		),
		container,
	);
	container
		.querySelector(
			"form",
		)
		?.dispatchEvent(
			new Event(
				"submit",
				{
					bubbles: true,
					cancelable: true,
				},
			),
		);
	await Bun.sleep(
		20,
	);
	expect(
		requests.map(
			(
				url,
			) =>
				url.pathname,
		),
	).toEqual(
		[
			"/api/users",
			"/api/game-lobby/game-123/join-requests",
		],
	);
	expect(
		currentLobby
			.value
			?.id,
	).toBe(
		"game-123",
	);
});

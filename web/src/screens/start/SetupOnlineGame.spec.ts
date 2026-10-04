import {
	afterEach,
	beforeEach,
	expect,
	it,
	mock,
} from "bun:test";
import {
	h,
	render,
} from "preact";
import { LocationProvider } from "preact-iso";
import { logger } from "@/logger";
import {
	currentLobby,
	readyPlayers,
} from "@/network/currentLobby";
import {
	currentUser,
	sessionToken,
} from "@/network/currentUser";
import { LobbyConnection } from "@/network/LobbyConnection";

// happy-dom has neither WebAudio nor WebGL
mock.module(
	"@/audio/useStartBgm",
	() => ({
		useStartBgm:
			() => {},
	}),
);
mock.module(
	"@/ui/PixiApp",
	() => ({
		PixiApp:
			() =>
				null,
	}),
);

const originalFetch =
	globalThis.fetch;
const originalWebSocket =
	globalThis.WebSocket;
const originalUser =
	currentUser.value;

const lobby =
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
					status:
						"connected" as const,
				},
				{
					id: "guest-id",
					username:
						"Guest",
					status:
						"connected" as const,
				},
			],
		readyPlayers:
			[],
	};

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

beforeEach(
	() => {
		globalThis.WebSocket =
			TestWebSocket as unknown as typeof WebSocket;
		currentUser.value =
			{
				id: "host-id",
				username:
					"Host",
			};
		sessionToken.value =
			"test-token";
		currentLobby.value =
			new LobbyConnection(
				logger,
				"host-id",
				lobby,
				() => {},
			);
	},
);

afterEach(
	() => {
		currentLobby.value?.close();
		currentLobby.value =
			null;
		readyPlayers.value =
			[];
		sessionToken.value =
			null;
		currentUser.value =
			originalUser;
		globalThis.fetch =
			originalFetch;
		globalThis.WebSocket =
			originalWebSocket;
		document.body.replaceChildren();
	},
);

function renderScreen(
	SetupOnlineGame: () => preact.JSX.Element,
) {
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
				SetupOnlineGame,
				{},
			),
		),
		container,
	);
	return container;
}

it("marks the local player as ready with the selected bulbro", async () => {
	const requests: {
		url: URL;
		body: {
			player: {
				id: string;
				bulbro: {
					id: string;
					weapons: {
						id: string;
					}[];
				};
			};
		};
	}[] =
		[];
	globalThis.fetch =
		(async (
			input:
				| RequestInfo
				| URL,
			init?: RequestInit,
		) => {
			const url =
				new URL(
					String(
						input,
					),
				);
			const body =
				JSON.parse(
					String(
						init?.body,
					),
				);
			requests.push(
				{
					url,
					body,
				},
			);
			return Response.json(
				{
					lobby:
						{
							...lobby,
							readyPlayers:
								[
									body.player,
								],
						},
				},
			);
		}) as typeof fetch;
	const {
		SetupOnlineGame,
	} =
		await import(
			"./SetupOnlineGame"
		);
	const container =
		renderScreen(
			SetupOnlineGame,
		);
	await Bun.sleep(
		20,
	);

	const readyForm =
		[
			...container.querySelectorAll(
				"form",
			),
		].find(
			(
				form,
			) =>
				form.querySelector(
					"button[type=submit]:not([aria-label])",
				),
		);
	expect(
		readyForm,
	).toBeDefined();
	readyForm?.dispatchEvent(
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
				r,
			) =>
				r
					.url
					.pathname,
		),
	).toEqual(
		[
			"/api/game-lobby/game-123/ready",
		],
	);
	const player =
		requests[0]
			?.body
			.player;
	expect(
		player,
	).toBeDefined();
	if (
		!player
	)
		return;
	expect(
		player.id,
	).toBe(
		"host-id",
	);
	expect(
		player
			.bulbro
			.id,
	).toBe(
		"well-rounded",
	);
	expect(
		player.bulbro.weapons.map(
			(
				w,
			) =>
				w.id,
		),
	).toContain(
		"smg",
	);
	expect(
		readyPlayers.value.map(
			(
				p,
			) =>
				p.id,
		),
	).toEqual(
		[
			"host-id",
		],
	);
});

it("shows a ready failure and allows retrying", async () => {
	let attempts = 0;
	globalThis.fetch =
		(async (
			_input,
			init,
		) => {
			attempts++;
			if (
				attempts ===
				1
			)
				return Response.json(
					{
						error:
							"Could not mark ready",
					},
					{
						status: 400,
					},
				);
			const {
				player,
			} =
				JSON.parse(
					String(
						init?.body,
					),
				);
			return Response.json(
				{
					lobby:
						{
							...lobby,
							readyPlayers:
								[
									player,
								],
						},
				},
			);
		}) as typeof fetch;
	const {
		SetupOnlineGame,
	} =
		await import(
			"./SetupOnlineGame"
		);
	const container =
		renderScreen(
			SetupOnlineGame,
		);
	await Bun.sleep(
		20,
	);
	const form =
		container
			.querySelector(
				"button[type=submit]:not([aria-label])",
			)
			?.closest(
				"form",
			);
	expect(
		form,
	).toBeTruthy();
	const submit =
		() =>
			form?.dispatchEvent(
				new Event(
					"submit",
					{
						bubbles: true,
						cancelable: true,
					},
				),
			);
	submit();
	await Bun.sleep(
		20,
	);
	expect(
		container.querySelector(
			'[role="alert"]',
		)
			?.textContent,
	).toBe(
		"Could not mark ready",
	);
	expect(
		readyPlayers.value,
	).toEqual(
		[],
	);
	submit();
	await Bun.sleep(
		20,
	);
	expect(
		container.querySelector(
			'[role="alert"]',
		),
	).toBeNull();
	expect(
		readyPlayers.value.map(
			(
				player,
			) =>
				player.id,
		),
	).toEqual(
		[
			"host-id",
		],
	);
});

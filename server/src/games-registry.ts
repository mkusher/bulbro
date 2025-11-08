import { type } from "arktype";

export const Player =
	type(
		{
			id: "string",
			username:
				"string",
			"status?":
				"string",
		},
	);

export const Weapon =
	type(
		{
			id: "string",
			name: "string",
			classes:
				"string[]",
			statsBonus:
				"Record<string, string | number | boolean>",
			shotSpeed:
				"number",
		},
	);

export const Bulbro =
	type(
		{
			id: "string",
			name: "string",
			statBonuses:
				"Record<string, string | number | boolean>",
			style:
				type(
					{
						faceType:
							"string",
						wearingItems:
							"unknown[]",
					},
				),
			weapons:
				Weapon.array(),
		},
	);

export const ReadyPlayer =
	type(
		{
			id: "string",
			bulbro:
				Bulbro,
		},
	);

export const Lobby =
	type(
		{
			id: "string",
			hostId:
				"string",
			players:
				Player.array(),
			readyPlayers:
				ReadyPlayer.array(),
			createdAt:
				"number",
		},
	);

export type Player =
	typeof Player.infer;
export type ReadyPlayer =
	typeof ReadyPlayer.infer;
export type Lobby =
	typeof Lobby.infer;

export class GamesRegistry {
	#registry =
		new Map<
			string,
			Lobby
		>();

	registerLobby(
		host: Player,
	) {
		const lobby: Lobby =
			{
				id: crypto.randomUUID(),
				hostId:
					host.id,
				players:
					[
						host,
					],
				readyPlayers:
					[],
				createdAt:
					Date.now(),
			};
		this.#registry.set(
			lobby.id,
			lobby,
		);
		return lobby;
	}

	find(
		id: string,
	) {
		return this.#registry.get(
			id,
		);
	}

	addPlayer(
		id: string,
		player: Player,
	) {
		const game =
			this.#registry.get(
				id,
			);
		if (
			!game
		) {
			return;
		}

		const lobby =
			{
				...game,
				players:
					[
						...game.players.filter(
							(
								p,
							) =>
								p.id !==
								player.id,
						),
						player,
					],
			};
		this.#registry.set(
			id,
			lobby,
		);

		return lobby;
	}

	markReady(
		id: string,
		readyPlayer: ReadyPlayer,
	) {
		const game =
			this.#registry.get(
				id,
			);
		if (
			!game
		) {
			return;
		}
		const lobby: Lobby =
			{
				...game,
				readyPlayers:
					[
						...game.readyPlayers,
						readyPlayer,
					],
			};
		this.#registry.set(
			id,
			lobby,
		);

		return lobby;
	}

	markDisconnected(
		id: string,
		playerId: string,
	) {
		const game =
			this.#registry.get(
				id,
			);
		if (
			!game
		) {
			return;
		}
		const lobby: Lobby =
			{
				...game,
				players:
					game.players.map(
						(
							p,
						) =>
							p.id ===
							playerId
								? {
										...p,
										status:
											"offline",
									}
								: p,
					),
			};
		this.#registry.set(
			id,
			lobby,
		);

		return lobby;
	}

	findGamesForPlayer(
		playerId: string,
	) {
		return this.#registry
			.values()
			.filter(
				(
					game,
				) =>
					!!game.players.find(
						(
							p,
						) =>
							p.id ===
							playerId,
					),
			)
			.map(
				(
					game,
				) =>
					game.id,
			);
	}
}

export const registry =
	new GamesRegistry();

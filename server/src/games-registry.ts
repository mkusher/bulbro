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

export function canStartLobby(
	lobby: Lobby,
) {
	return (
		lobby
			.players
			.length ===
			2 &&
		lobby.players.some(
			(
				player,
			) =>
				player.id ===
				lobby.hostId,
		) &&
		new Set(
			lobby.players.map(
				(
					player,
				) =>
					player.id,
			),
		)
			.size ===
			2 &&
		lobby.players.every(
			(
				player,
			) =>
				player.status ===
					"connected" &&
				lobby.readyPlayers.some(
					(
						readyPlayer,
					) =>
						readyPlayer.id ===
						player.id,
				),
		)
	);
}

/**
 * Players' states submitted from the shop for the wave that starts next.
 */
export type NextWaveReadiness =
	{
		wave: number;
		players: Map<
			string,
			object
		>;
	};

export class GamesRegistry {
	#registry =
		new Map<
			string,
			Lobby
		>();
	#nextWaveReadiness =
		new Map<
			string,
			NextWaveReadiness
		>();
	#startedWaves =
		new Map<
			string,
			number
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
						{
							...host,
							status:
								"offline",
						},
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
		if (
			game
				.players
				.length >=
				2 &&
			!game.players.some(
				(
					p,
				) =>
					p.id ===
					player.id,
			)
		)
			return;

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
						{
							...player,
							status:
								"offline",
						},
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
		if (
			!game.players.some(
				(
					p,
				) =>
					p.id ===
					readyPlayer.id,
			)
		)
			return;
		const lobby: Lobby =
			{
				...game,
				readyPlayers:
					[
						...game.readyPlayers.filter(
							(
								p,
							) =>
								p.id !==
								readyPlayer.id,
						),
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

	markConnected(
		id: string,
		playerId: string,
	) {
		const game =
			this.#registry.get(
				id,
			);
		if (
			!game ||
			!game.players.some(
				(
					p,
				) =>
					p.id ===
					playerId,
			)
		)
			return;
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
											"connected",
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

	/**
	 * The first wave was started by the host; next wave readiness starts over.
	 */
	markGameStarted(
		id: string,
	) {
		this.#startedWaves.set(
			id,
			1,
		);
		this.#nextWaveReadiness.delete(
			id,
		);
	}

	/**
	 * Stores a member's post-shop state for the given upcoming wave.
	 * Returns undefined for unknown games, non-members, and stale waves.
	 */
	markReadyForNextWave(
		id: string,
		wave: number,
		playerId: string,
		player: object,
	) {
		const game =
			this.#registry.get(
				id,
			);
		if (
			!game?.players.some(
				(
					p,
				) =>
					p.id ===
					playerId,
			)
		)
			return;
		const startedWave =
			this.#startedWaves.get(
				id,
			) ??
			1;
		if (
			wave !==
			startedWave +
				1
		)
			return;
		const readiness =
			this.#nextWaveReadiness.get(
				id,
			) ?? {
				wave,
				players:
					new Map(),
			};
		readiness.players.set(
			playerId,
			player,
		);
		this.#nextWaveReadiness.set(
			id,
			readiness,
		);
		return readiness;
	}

	/**
	 * Forgets a member's post-shop state for the given upcoming wave.
	 * Returns undefined for unknown games, non-members, and stale waves.
	 */
	markNotReadyForNextWave(
		id: string,
		wave: number,
		playerId: string,
	) {
		const game =
			this.#registry.get(
				id,
			);
		if (
			!game?.players.some(
				(
					p,
				) =>
					p.id ===
					playerId,
			)
		)
			return;
		const startedWave =
			this.#startedWaves.get(
				id,
			) ??
			1;
		if (
			wave !==
			startedWave +
				1
		)
			return;
		const readiness =
			this.#nextWaveReadiness.get(
				id,
			) ?? {
				wave,
				players:
					new Map(),
			};
		readiness.players.delete(
			playerId,
		);
		this.#nextWaveReadiness.set(
			id,
			readiness,
		);
		return readiness;
	}

	/**
	 * Returns the wave and players' states, host first, when every member is
	 * ready and connected.
	 */
	nextWaveToStart(
		id: string,
	) {
		const game =
			this.#registry.get(
				id,
			);
		const readiness =
			this.#nextWaveReadiness.get(
				id,
			);
		if (
			!game ||
			!readiness ||
			game
				.players
				.length <
				2 ||
			!game.players.every(
				(
					p,
				) =>
					p.status ===
						"connected" &&
					readiness.players.has(
						p.id,
					),
			)
		)
			return;
		const players =
			[
				...game.players,
			]
				.sort(
					(
						a,
						b,
					) =>
						Number(
							b.id ===
								game.hostId,
						) -
						Number(
							a.id ===
								game.hostId,
						),
				)
				.flatMap(
					(
						p,
					) =>
						readiness.players.get(
							p.id,
						) ??
						[],
				);
		return {
			wave: readiness.wave,
			players,
		};
	}

	markNextWaveStarted(
		id: string,
		wave: number,
	) {
		this.#startedWaves.set(
			id,
			wave,
		);
		this.#nextWaveReadiness.delete(
			id,
		);
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

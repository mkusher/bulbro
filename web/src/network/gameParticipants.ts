import type { Lobby } from "./LobbySocketMessages";

export function remotePlayerIdFor(
	lobby: Lobby,
	localPlayerId: string,
) {
	const remote =
		lobby.players.filter(
			(
				player,
			) =>
				player.id !==
				localPlayerId,
		);
	if (
		lobby
			.players
			.length !==
			2 ||
		remote.length !==
			1 ||
		!remote[0] ||
		!lobby.players.some(
			(
				player,
			) =>
				player.id ===
				localPlayerId,
		)
	)
		throw new Error(
			"Network game requires two distinct players including the local player",
		);
	return remote[0]
		.id;
}

export function orderPlayersLocalFirst<
	T extends
		{
			id: string;
		},
>(
	players: T[],
	localPlayerId: string,
): [
	T,
	T,
] {
	const local =
		players.find(
			(
				player,
			) =>
				player.id ===
				localPlayerId,
		);
	const remote =
		players.filter(
			(
				player,
			) =>
				player.id !==
				localPlayerId,
		);
	if (
		players.length !==
			2 ||
		!local ||
		remote.length !==
			1 ||
		!remote[0]
	) {
		throw new Error(
			"Network game requires two ready players",
		);
	}
	return [
		local,
		remote[0],
	];
}

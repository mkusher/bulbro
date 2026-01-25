import { useLocation } from "preact-iso";

export function useRouter() {
	const location =
		useLocation();

	return {
		toGame:
			() =>
				location.route(
					"/game",
				),
		toSettings:
			() =>
				location.route(
					"/settings",
				),
		toFindLobby:
			() =>
				location.route(
					"/find-lobby",
				),
		toSetupOnlineGame:
			() =>
				location.route(
					"/setup-online-game",
				),
		toMainMenu:
			() =>
				location.route(
					"/",
				),
	};
}

export function getJoinLobbyUrl(
	lobbyId: string,
) {
	return `https://bulbro.lol/lobby/${lobbyId}`;
}

export function getTgJoinLobbyUrl(
	lobbyId: string,
) {
	const startCommand =
		{
			type: "joinlobby",
			lobbyId,
		};
	return `https://t.me/bulbro_bot/game?startapp=${encodeURIComponent(window.btoa(JSON.stringify(startCommand)))}`;
}

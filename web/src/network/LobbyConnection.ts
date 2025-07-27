import { wsUrl } from "./clientConfig";
import { WebsocketConnection } from "./websocket/WebsocketConnection";
import { type Logger } from "@/logger";
import { NetworkGameConnection } from "./NetworkGameConnection";
import {
	parseMessage,
	type Lobby,
	type WebsocketMessage,
	type PlayerAttendee,
} from "./LobbySocketMessages";
import type { GameProcess } from "@/GameProcess";
import { isLocalPlayerHost } from "./currentLobby";
import { WebsocketInGameCommunicationChannel } from "./websocket/WebsocketInGameCommunicationChannel";
import type { ProcessMessage } from "./InGameCommunicationChannel";

export class LobbyConnection implements Lobby {
	#logger: Logger;
	#lobby: Lobby;
	#connection!: WebsocketConnection;
	#unsubscribe!: () => void;
	#userId: string;
	#processMessage: (message: typeof WebsocketMessage.infer) => void;
	constructor(
		logger: Logger,
		userId: string,
		lobby: Lobby,
		processMessage: (message: typeof WebsocketMessage.infer) => void,
		connection?: WebsocketConnection,
		unsubscribe = () => {},
	) {
		this.#logger = logger.child({ component: "lobby-connection" });
		this.#userId = userId;
		this.#lobby = lobby;
		this.#processMessage = processMessage;
		this.#unsubscribe = unsubscribe;
		if (connection) {
			this.#connection = connection;
		} else {
			this.#startLobbyWebsocket();
		}
	}

	async #startLobbyWebsocket() {
		this.#connection = new WebsocketConnection(
			wsUrl,
			this.#logger.child({
				component: "websocket-connection",
			}),
		);
		this.#unsubscribe = this.#connection.onMessage((e) => {
			const message = parseMessage(e.data);
			return this.#processMessage(message);
		});

		this.#connection.sendObject({ userId: this.#userId, type: "auth" });

		return this.#connection;
	}

	createGame(gameProcess: GameProcess, processMessage: ProcessMessage) {
		this.#unsubscribe();
		return new NetworkGameConnection(
			this.#logger,
			new WebsocketInGameCommunicationChannel(this.#connection, this.#logger),
			this.#lobby,
			gameProcess,
			processMessage,
			isLocalPlayerHost.value,
		);
	}

	get id() {
		return this.#lobby.id;
	}

	get createdAt() {
		return this.#lobby.createdAt;
	}

	get hostId() {
		return this.#lobby.hostId;
	}

	get players() {
		return this.#lobby.players;
	}

	addPlayers(players: PlayerAttendee[]) {
		return players.reduce(
			(lobby: LobbyConnection, player: PlayerAttendee) =>
				lobby.addPlayer(player),
			this,
		);
	}
	addPlayer(player: PlayerAttendee) {
		if (this.hasPlayer(player)) {
			return this;
		}
		return new LobbyConnection(
			this.#logger,
			this.#userId,
			{
				...this.#lobby,
				players: [...this.#lobby.players, player],
			},
			this.#processMessage,
			this.#connection,
			this.#unsubscribe,
		);
	}
	hasPlayer(player: PlayerAttendee) {
		return this.#lobby.players.find((p) => p.id === player.id);
	}
	removePlayer(player: PlayerAttendee) {
		if (!this.hasPlayer(player)) {
			return this;
		}
		return new LobbyConnection(
			this.#logger,
			this.#userId,
			{
				...this.#lobby,
				players: this.players.filter((p) => p.id !== player.id),
			},
			this.#processMessage,
			this.#connection,
			this.#unsubscribe,
		);
	}
}

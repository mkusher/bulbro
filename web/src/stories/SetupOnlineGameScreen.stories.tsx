import { useEffect } from "preact/hooks";
import { wellRoundedBulbro } from "@/characters-definitions";
import { logger } from "@/logger";
import {
	currentLobby,
	readyPlayers,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import { LobbyConnection } from "@/network/LobbyConnection";
import { createPlayer } from "@/player";
import { SetupOnlineGame } from "@/screens/start/SetupOnlineGame";
import { smg } from "@/weapons-definitions";

export default {
	title:
		"Screens/Setup Online Game",
	component:
		SetupOnlineGame,
};

// Mock data
const mockHostUser =
	{
		id: "host-123",
		username:
			"HostPlayer",
		isGuest: false,
	};

const mockLobbyBase =
	{
		id: "lobby-abc123",
		createdAt:
			Date.now(),
		hostId:
			"host-123",
	};

const mockHostPlayer =
	createPlayer(
		"host-123",
		wellRoundedBulbro,
		[
			smg,
		],
	);
const mockGuestPlayer =
	createPlayer(
		"guest-456",
		wellRoundedBulbro,
		[
			smg,
		],
	);

type Props =
	{
		hasGuest?: boolean;
		hostReady?: boolean;
		guestReady?: boolean;
	};

function MockedSetupOnlineGame({
	hasGuest,
	hostReady,
	guestReady,
}: Props) {
	useEffect(() => {
		// Set current user as host
		currentUser.value =
			mockHostUser;

		// Create lobby players
		const players =
			[
				{
					id: "host-123",
					username:
						"HostPlayer",
					status:
						"connected",
				},
			];

		if (
			hasGuest
		) {
			players.push(
				{
					id: "guest-456",
					username:
						"GuestPlayer",
					status:
						"connected",
				},
			);
		}

		const lobby =
			{
				...mockLobbyBase,
				players,
			};

		currentLobby.value =
			new LobbyConnection(
				logger,
				"host-123",
				lobby,
				() => {},
			);

		// Set ready players
		const readyList =
			[];
		if (
			hostReady
		) {
			readyList.push(
				mockHostPlayer,
			);
		}
		if (
			hasGuest &&
			guestReady
		) {
			readyList.push(
				mockGuestPlayer,
			);
		}
		readyPlayers.value =
			readyList;

		return () => {
			currentLobby.value =
				null;
			readyPlayers.value =
				[];
		};
	}, [
		hasGuest,
		hostReady,
		guestReady,
	]);

	return (
		<SetupOnlineGame />
	);
}

export const NotAuthenticated =
	{
		render:
			() => (
				<SetupOnlineGame />
			),
	};

export const OnlyHostHasJoined =
	{
		render:
			(
				args: Props,
			) => (
				<MockedSetupOnlineGame
					{...args}
				/>
			),
		args: {
			hasGuest: false,
			hostReady: false,
			guestReady: false,
		},
		argTypes:
			{
				hasGuest:
					{
						control:
							"boolean",
					},
				hostReady:
					{
						control:
							"boolean",
					},
				guestReady:
					{
						control:
							"boolean",
					},
			},
	};

export const HostAndNonHostHasJoined =
	{
		render:
			(
				args: Props,
			) => (
				<MockedSetupOnlineGame
					{...args}
				/>
			),
		args: {
			hasGuest: true,
			hostReady: false,
			guestReady: false,
		},
		argTypes:
			{
				hasGuest:
					{
						control:
							"boolean",
						description:
							"Whether a guest player has joined the lobby",
					},
				hostReady:
					{
						control:
							"boolean",
						description:
							"Whether the host player is ready",
					},
				guestReady:
					{
						control:
							"boolean",
						description:
							"Whether the guest player is ready",
					},
			},
	};

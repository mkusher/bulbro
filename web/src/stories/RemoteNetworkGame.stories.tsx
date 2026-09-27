import {
	useEffect,
	useRef,
	useState,
} from "preact/hooks";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	currentGameCanvas,
	currentGameProcess,
	isLoading,
	waveResult,
} from "@/currentGameProcess";
import {
	configureNetworkServer,
	useSameOriginNetworkServer,
} from "@/network/clientConfig";
import {
	createLobby,
	currentLobby,
	currentNetworkGame,
	joinLobby,
	markAsReady,
	readyPlayers,
} from "@/network/currentLobby";
import {
	createUser,
	currentUser,
	sessionToken,
} from "@/network/currentUser";
import { startNetworkGameAsHost } from "@/network/start-game";
import { createPlayer } from "@/player";
import { smg } from "@/weapons-definitions";

type StoryArgs =
	{
		serverUrl: string;
		gameId: string;
	};

function GameCanvas() {
	const container =
		useRef<HTMLDivElement>(
			null,
		);
	const canvas =
		currentGameCanvas.value;
	useEffect(() => {
		if (
			!canvas ||
			!container.current
		)
			return;
		container.current.replaceChildren(
			canvas,
		);
	}, [
		canvas,
	]);
	return (
		<div
			ref={
				container
			}
			className="min-h-[600px] w-full"
		>
			{!canvas &&
				"Loading game..."}
		</div>
	);
}

function RemoteNetworkGame({
	serverUrl:
		initialServerUrl,
	gameId:
		initialGameId,
}: StoryArgs) {
	const [
		serverUrl,
		setServerUrl,
	] =
		useState(
			initialServerUrl,
		);
	const [
		gameId,
		setGameId,
	] =
		useState(
			initialGameId,
		);
	const [
		username,
		setUsername,
	] =
		useState(
			() =>
				`Player-${Math.random().toString(36).slice(2, 6)}`,
		);
	const [
		stage,
		setStage,
	] =
		useState<
			| "setup"
			| "lobby"
			| "game"
		>(
			"setup",
		);
	const [
		busy,
		setBusy,
	] =
		useState(
			false,
		);
	const [
		error,
		setError,
	] =
		useState(
			"",
		);
	const lobby =
		currentLobby.value;
	const localId =
		currentUser
			.value
			.id;
	const remote =
		lobby?.players.find(
			(
				player,
			) =>
				player.id !==
				localId,
		);
	const localReady =
		readyPlayers.value.some(
			(
				player,
			) =>
				player.id ===
				localId,
		);
	const remoteReady =
		!!remote &&
		readyPlayers.value.some(
			(
				player,
			) =>
				player.id ===
				remote.id,
		);
	const isHost =
		lobby?.hostId ===
		localId;

	useEffect(() => {
		if (
			stage ===
			"setup"
		) {
			setServerUrl(
				initialServerUrl,
			);
			setGameId(
				initialGameId,
			);
		}
	}, [
		initialServerUrl,
		initialGameId,
		stage,
	]);

	useEffect(
		() =>
			() => {
				currentLobby.value?.close();
				if (
					currentNetworkGame.value
				)
					currentGameProcess.value.waveProcess
						?.stop(
							"fail",
						)
						.catch(
							() => {},
						);
				currentLobby.value =
					null;
				currentNetworkGame.value =
					null;
				readyPlayers.value =
					[];
				currentGameCanvas.value =
					undefined;
				sessionToken.value =
					null;
				useSameOriginNetworkServer();
			},
		[],
	);

	async function connect(
		create: boolean,
	) {
		setBusy(
			true,
		);
		setError(
			"",
		);
		try {
			configureNetworkServer(
				serverUrl.trim(),
			);
			currentUser.value =
				{
					...currentUser.value,
					username:
						username.trim() ||
						"Player",
					isGuest: true,
				};
			await createUser();
			readyPlayers.value =
				[];
			currentNetworkGame.value =
				null;
			if (
				create
			)
				await createLobby(
					() =>
						setStage(
							"game",
						),
				);
			else
				await joinLobby(
					gameId.trim(),
					() =>
						setStage(
							"game",
						),
				);
			setGameId(
				currentLobby
					.value
					?.id ??
					gameId,
			);
			setStage(
				"lobby",
			);
		} catch (cause) {
			setError(
				cause instanceof
					Error
					? cause.message
					: String(
							cause,
						),
			);
		} finally {
			setBusy(
				false,
			);
		}
	}

	async function ready() {
		if (
			!lobby
		)
			return;
		setBusy(
			true,
		);
		setError(
			"",
		);
		try {
			await markAsReady(
				lobby.id,
				createPlayer(
					localId,
					wellRoundedBulbro,
					[
						smg,
					],
				),
			);
		} catch (cause) {
			setError(
				cause instanceof
					Error
					? cause.message
					: String(
							cause,
						),
			);
		} finally {
			setBusy(
				false,
			);
		}
	}

	function start() {
		setError(
			"",
		);
		setStage(
			"game",
		);
		startNetworkGameAsHost(
			0,
		).catch(
			(
				cause,
			) => {
				setError(
					cause instanceof
						Error
						? cause.message
						: String(
								cause,
							),
				);
				setStage(
					"lobby",
				);
			},
		);
	}

	function copyGameId() {
		if (
			!lobby
		)
			return;
		if (
			navigator
				.clipboard
				?.writeText
		) {
			navigator.clipboard
				.writeText(
					lobby.id,
				)
				.catch(
					() =>
						window.prompt(
							"Copy game ID",
							lobby.id,
						),
				);
		} else {
			window.prompt(
				"Copy game ID",
				lobby.id,
			);
		}
	}

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-4 p-5 text-white">
			<h1 className="text-2xl font-bold">
				Remote
				network
				game
			</h1>
			<p>
				Run
				the
				real
				server
				with{" "}
				<code>
					cd
					server
					&amp;&amp;
					bun
					start
				</code>
				.
				Create
				a
				room
				here,
				then
				open
				this
				story
				in
				another
				tab
				and
				join
				with
				its
				game
				ID.
			</p>
			{error && (
				<p
					role="alert"
					className="rounded bg-red-900 p-3"
				>
					{
						error
					}
				</p>
			)}
			{stage ===
				"setup" && (
				<div className="flex flex-col gap-3 rounded bg-slate-800 p-4">
					<label>
						Server
						URL{" "}
						<input
							className="ml-2 w-80 rounded bg-white p-2 text-black"
							type="url"
							value={
								serverUrl
							}
							onInput={(
								event,
							) =>
								setServerUrl(
									event
										.currentTarget
										.value,
								)
							}
						/>
					</label>
					<label>
						Player
						name{" "}
						<input
							className="ml-2 rounded bg-white p-2 text-black"
							value={
								username
							}
							onInput={(
								event,
							) =>
								setUsername(
									event
										.currentTarget
										.value,
								)
							}
						/>
					</label>
					<label>
						Game
						ID{" "}
						<input
							className="ml-2 w-80 rounded bg-white p-2 text-black"
							value={
								gameId
							}
							onInput={(
								event,
							) =>
								setGameId(
									event
										.currentTarget
										.value,
								)
							}
							placeholder="Paste an existing room ID"
						/>
					</label>
					<div className="flex gap-2">
						<button
							className="rounded bg-blue-600 px-4 py-2 disabled:opacity-50"
							disabled={
								busy
							}
							onClick={() =>
								connect(
									true,
								)
							}
						>
							Create
							game
							ID
						</button>
						<button
							className="rounded bg-green-600 px-4 py-2 disabled:opacity-50"
							disabled={
								busy ||
								!gameId.trim()
							}
							onClick={() =>
								connect(
									false,
								)
							}
						>
							Join
							game
							ID
						</button>
					</div>
				</div>
			)}
			{lobby && (
				<div className="flex flex-wrap items-center gap-4 rounded bg-slate-800 p-4">
					<span>
						Game
						ID:{" "}
						<strong className="select-all">
							{
								lobby.id
							}
						</strong>
					</span>
					<button
						className="rounded bg-slate-600 px-3 py-1"
						onClick={
							copyGameId
						}
					>
						Copy
						ID
					</button>
					<span>
						You:{" "}
						{
							currentUser
								.value
								.username
						}{" "}
						(
						{isHost
							? "host"
							: "guest"}
						)
					</span>
					<span>
						Remote:{" "}
						{remote
							? `${remote.username} — ${remote.status === "connected" ? "connected" : "disconnected"}`
							: "waiting"}
					</span>
				</div>
			)}
			{stage ===
				"lobby" &&
				lobby && (
					<div className="flex items-center gap-3">
						<button
							className="rounded bg-blue-600 px-4 py-2 disabled:opacity-50"
							disabled={
								busy ||
								localReady
							}
							onClick={
								ready
							}
						>
							{localReady
								? "Ready"
								: "Ready with default Bulbro"}
						</button>
						<span>
							Other
							player:{" "}
							{remoteReady
								? "ready"
								: "not ready"}
						</span>
						{isHost && (
							<button
								className="rounded bg-green-600 px-4 py-2 disabled:opacity-50"
								disabled={
									!localReady ||
									!remoteReady ||
									remote?.status !==
										"connected"
								}
								onClick={
									start
								}
							>
								Start
								game
							</button>
						)}
						{!isHost && (
							<span>
								Waiting
								for
								host
								to
								start
							</span>
						)}
					</div>
				)}
			{stage ===
				"game" && (
				<div>
					<p>
						{isLoading.value
							? "Loading game..."
							: waveResult.value
								? `Result: ${waveResult.value}`
								: "Use WASD or arrow keys to move."}
					</p>
					<GameCanvas />
				</div>
			)}
		</div>
	);
}

export default {
	title:
		"Network/Remote Game (Real Server)",
	component:
		RemoteNetworkGame,
	args: {
		serverUrl: `http://${window.location.hostname}:8080`,
		gameId:
			"",
	},
	argTypes:
		{
			serverUrl:
				{
					control:
						"text",
					description:
						"Origin of the running game server",
				},
			gameId:
				{
					control:
						"text",
					description:
						"Existing game ID to join; leave empty to create one",
				},
		},
};

export const TwoTabs =
	{
		render:
			(
				args: StoryArgs,
			) => (
				<RemoteNetworkGame
					{...args}
				/>
			),
	};

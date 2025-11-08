import "./ui/global.css";
import { useEffect } from "preact/hooks";
import {
	LocationProvider,
	Route,
	Router,
} from "preact-iso";
import { logger } from "./logger";
import { FindLobby } from "./screens/FindLobby";
import { InGame } from "./screens/Game";
import { StartScreen } from "./screens/StartScreen";
import { GameGlobalSettings } from "./screens/start/GameGlobalSettings";
import { SetupLocalCoOp } from "./screens/start/SetupLocalCoOp";
import { SetupOnlineGame } from "./screens/start/SetupOnlineGame";
import { SetupSinglePlayer } from "./screens/start/SetupSinglePlayer";
import { TgAppStartScreen } from "./screens/TgAppStartScreen";

export function Game() {
	useEffect(() => {
		logger.info(
			"Starting application",
		);
	}, []);
	return (
		<LocationProvider>
			<Router>
				<Route
					path="/"
					component={
						StartScreen
					}
				/>
				<Route
					path="/game"
					component={
						InGame
					}
				/>
				<Route
					path="/tg-app"
					component={
						TgAppStartScreen
					}
				/>
				<Route
					path="/setup-single-player"
					component={
						SetupSinglePlayer
					}
				/>
				<Route
					path="/setup-local-co-op-player"
					component={
						SetupLocalCoOp
					}
				/>
				<Route
					path="/find-lobby"
					component={
						FindLobby
					}
				/>
				<Route
					path="/setup-online-game"
					component={
						SetupOnlineGame
					}
				/>
				<Route
					path="/settings"
					component={
						GameGlobalSettings
					}
				/>
			</Router>
		</LocationProvider>
	);
}

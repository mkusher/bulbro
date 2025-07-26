import "./ui/global.css";
import { StartScreen } from "./screens/StartScreen";
import { LocationProvider, Route, Router } from "preact-iso";
import { TgAppStartScreen } from "./screens/TgAppStartScreen";
import { SetupSinglePlayer } from "./screens/start/SetupSinglePlayer";
import { SetupLocalCoOp } from "./screens/start/SetupLocalCoOp";
import { SetupOnlineGame } from "./screens/start/SetupOnlineGame";
import { GameGlobalSettings } from "./screens/start/GameGlobalSettings";
import { InGame } from "./screens/Game";
import { FindLobby } from "./screens/FindLobby";

export function Game() {
	return (
		<LocationProvider>
			<Router>
				<Route path="/" component={StartScreen} />
				<Route path="/game" component={InGame} />
				<Route path="/tg-app" component={TgAppStartScreen} />
				<Route path="/setup-single-player" component={SetupSinglePlayer} />
				<Route path="/setup-local-co-op-player" component={SetupLocalCoOp} />
				<Route path="/find-lobby" component={FindLobby} />
				<Route path="/setup-online-game" component={SetupOnlineGame} />
				<Route path="/settings" component={GameGlobalSettings} />
			</Router>
		</LocationProvider>
	);
}

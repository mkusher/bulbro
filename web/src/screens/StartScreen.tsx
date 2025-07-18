import { useState } from "preact/hooks";
import { SetupSinglePlayer } from "./start/SetupSinglePlayer";
import { SetupLocalCoOp } from "./start/SetupLocalCoOp";
import { GameGlobalSettings } from "./start/GameGlobalSettings";

import { MainMenu } from "./start/MainMenu";
import { SetupOnlineGame } from "./start/SetupOnlineGame";
import { startLocalGame } from "@/currentGameProcess";

export function StartScreen() {
	const [screen, setScreen] = useState("start");
	const toScreen = (screen: string) => () => setScreen(screen);
	if (screen === "setup-single-player") {
		return <SetupSinglePlayer startGame={startLocalGame} />;
	}
	if (screen === "setup-local-co-op-player") {
		return <SetupLocalCoOp startGame={startLocalGame} />;
	}
	if (screen === "setup-online-game") {
		return <SetupOnlineGame />;
	}
	if (screen === "game-settings") {
		return <GameGlobalSettings goBack={toScreen("start")} />;
	}
	return <MainMenu toScreen={toScreen} />;
}

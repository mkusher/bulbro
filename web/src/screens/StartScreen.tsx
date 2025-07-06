import { useState } from "preact/hooks";
import type { StartGame } from "@/ui/start-game";
import { SetupSinglePlayer } from "./start/SetupSinglePlayer";
import { SetupLocalCoOp } from "./start/SetupLocalCoOp";
import { GameGlobalSettings } from "./start/GameGlobalSettings";

import { MainMenu } from "./start/MainMenu";

type Props = {
	startGame: StartGame;
};

export function StartScreen({ startGame }: Props) {
	const [screen, setScreen] = useState("start");
	const toScreen = (screen: string) => () => setScreen(screen);
	if (screen === "setup-single-player") {
		return <SetupSinglePlayer startGame={startGame} />;
	}
	if (screen === "setup-local-co-op-player") {
		return <SetupLocalCoOp startGame={startGame} />;
	}
	if (screen === "game-settings") {
		return <GameGlobalSettings goBack={toScreen("start")} />;
	}
	return <MainMenu toScreen={toScreen} />;
}

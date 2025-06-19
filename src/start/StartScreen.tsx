import { useState } from "preact/hooks";
import type { StartGame } from "./start-game";
import { SetupSinglePlayer } from "./SetupSinglePlayer";
import { SetupLocalCoOp } from "./SetupLocalCoOp";

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
	return (
		<div>
			<h1>BulBro</h1>
			<button onClick={toScreen("setup-single-player")}>
				Start single player
			</button>
			<button onClick={toScreen("setup-local-co-op-player")}>
				Start local co-op
			</button>
		</div>
	);
}

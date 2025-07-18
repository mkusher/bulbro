import "./ui/global.css";
import { useRef, useEffect } from "preact/hooks";
import { StartScreen } from "./screens/StartScreen";
import { Loader } from "./ui/Loading";
import { Failed } from "./screens/Failed";
import { PreRound } from "./screens/PreRound";
import { currentState } from "./currentState";
import { TouchscreenJoystick } from "./controls/TouchscreenJoystick";
import { SplashBanner } from "./ui/Splash";
import { MainContainer } from "./ui/Layout";
import {
	currentGameProcess,
	isRound as isRoundSignal,
	isLoading as isLoadingSignal,
	waveResult,
} from "./currentGameProcess";
import type { GameProcess } from "./GameProcess";

export function Game() {
	const gameProcess = currentGameProcess.value;
	const finishedResult = waveResult.value;
	const isRound = isRoundSignal.value;
	const isLoading = isLoadingSignal.value;

	if (isLoading) {
		return (
			<MainContainer>
				<Loader />
			</MainContainer>
		);
	}

	if (finishedResult === "fail") {
		return (
			<SplashBanner>
				<MainContainer noPadding top>
					<Failed />
				</MainContainer>
			</SplashBanner>
		);
	}

	if (finishedResult === "win") {
		return (
			<SplashBanner>
				<MainContainer noPadding top>
					<PreRound state={currentState.value} />
				</MainContainer>
			</SplashBanner>
		);
	}

	if (!isRound) {
		return (
			<SplashBanner>
				<MainContainer noPadding top>
					<StartScreen />
				</MainContainer>
			</SplashBanner>
		);
	}

	return (
		<MainContainer noPadding>
			<TouchscreenJoystick />
			<ShowRound gameProcess={gameProcess} />
		</MainContainer>
	);
}

type Props = {
	gameProcess: GameProcess;
};

export function ShowRound({ gameProcess }: Props) {
	const rootEl = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (rootEl.current && gameProcess.gameCanvas) {
			rootEl.current.appendChild(gameProcess.gameCanvas);
		}
	}, [gameProcess.gameCanvas]);

	return <div className="full-viewport" ref={rootEl} />;
}

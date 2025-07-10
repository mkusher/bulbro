import "./ui/global.css";
import { useRef, useEffect, useState } from "preact/hooks";
import type { GameProcess } from "./GameProcess";
import { StartScreen } from "./screens/StartScreen";
import { Loader } from "./ui/Loading";
import { Failed } from "./screens/Failed";
import { PreRound } from "./screens/PreRound";
import { currentState, type CurrentState } from "./currentState";
import { TouchscreenJoystick } from "./controls/TouchscreenJoystick";
import { SplashBanner } from "./ui/Splash";
import { MainContainer } from "./ui/Layout";

type Props = {
	gameProcess: GameProcess;
};

export function Game({ gameProcess }: Props) {
	const [isRound, setIsRound] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [finishedResult, setFinishedResult] = useState<
		"win" | "fail" | undefined
	>(undefined);

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
					<PreRound
						state={currentState.value}
						startRound={async (state: CurrentState) => {
							setIsLoading(true);
							setFinishedResult(undefined);
							try {
								const { wavePromise } = await gameProcess.startNextWave(state);
								setIsLoading(false);
								setIsRound(true);
								const result = await wavePromise;
								setFinishedResult(result);
							} finally {
								setIsLoading(false);
							}
						}}
					/>
				</MainContainer>
			</SplashBanner>
		);
	}

	if (!isRound) {
		return (
			<SplashBanner>
				<MainContainer noPadding top>
					<StartScreen
						startGame={async (players, difficulty, duration) => {
							setIsLoading(true);
							setFinishedResult(undefined);
							try {
								await gameProcess.initMap();
								const { wavePromise } = await gameProcess.start(
									players,
									difficulty,
									duration,
								);
								setIsLoading(false);
								setIsRound(true);
								const result = await wavePromise;
								setFinishedResult(result);
							} finally {
								setIsLoading(false);
							}
						}}
					/>
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

export function ShowRound({ gameProcess }: Props) {
	const rootEl = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (rootEl.current) {
			gameProcess.showMap(rootEl.current);
		}
	}, [gameProcess]);

	return <div className="full-viewport" ref={rootEl} />;
}

import { useRef, useEffect, useState } from "preact/hooks";
import type { GameProcess } from "./GameProcess";
import { StartScreen } from "./start/StartScreen";
import { Loader } from "./start/Loading";
import type { PropsWithChildren } from "preact/compat";
import { Failed } from "./start/Failed";
import { PreRound } from "./start/PreRound";
import { currentState, type CurrentState } from "./currentState";
import { TouchscreenJoystick } from "./controls/TouchscreenJoystick";

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
			<MainContainer>
				<Failed />
			</MainContainer>
		);
	}

	if (finishedResult === "win") {
		return (
			<MainContainer>
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
		);
	}

	if (!isRound) {
		return (
			<MainContainer>
				<StartScreen
					startGame={async (characters, difficulty, weaponsSetup, duration) => {
						setIsLoading(true);
						setFinishedResult(undefined);
						try {
							await gameProcess.initMap();
							const { wavePromise } = await gameProcess.start(
								characters,
								weaponsSetup,
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

export function MainContainer({
	children,
	noPadding,
}: PropsWithChildren<{ noPadding?: boolean }>) {
	return (
		<div
			className={`main-container full-viewport${!!noPadding ? " no-padding" : ""}`}
		>
			{children}
		</div>
	);
}

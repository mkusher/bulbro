import { useRef, useEffect, useState } from "preact/hooks";
import type { GameProcess } from "./GameProcess";
import { SelectForStart } from "./start/SelectForStart";
import { Loader } from "./start/Loading";
import type { PropsWithChildren } from "preact/compat";
import { Failed } from "./start/Failed";
import { PreRound } from "./start/PreRound";

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
					startRound={async (weapons) => {
						setIsLoading(true);
						setFinishedResult(undefined);
						try {
							const { wavePromise } = await gameProcess.startNextWave(weapons);
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
				<SelectForStart
					gameProcess={gameProcess}
					startGame={async (
						gameProcess,
						bulbro,
						difficulty,
						weapons,
						duration,
					) => {
						setIsLoading(true);
						setFinishedResult(undefined);
						try {
							await gameProcess.initMap();
							const { wavePromise } = await gameProcess.start(
								bulbro,
								weapons,
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
		<MainContainer>
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

	return <div ref={rootEl} />;
}

export function MainContainer({ children }: PropsWithChildren) {
	return <div className="main-container full-viewport">{children}</div>;
}

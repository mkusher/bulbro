import { useRef, useEffect } from "preact/hooks";
import { Loader } from "@/ui/Loading";
import { Failed } from "@/screens/Failed";
import { PreRound } from "@/screens/PreRound";
import { waveState } from "@/waveState";
import { TouchscreenJoystick } from "@/controls/TouchscreenJoystick";
import { SplashBanner } from "@/ui/Splash";
import { MainContainer } from "@/ui/Layout";
import {
	isRound as isRoundSignal,
	isLoading as isLoadingSignal,
	waveResult,
	currentGameCanvas,
} from "@/currentGameProcess";

export function InGame() {
	const gameCanvas = currentGameCanvas.value;
	const finishedResult = waveResult.value;
	const isRound = isRoundSignal.value;
	const isLoading = isLoadingSignal.value;

	if (!isRound) {
		return (
			<SplashBanner>
				<MainContainer noPadding top>
					<Failed />
				</MainContainer>
			</SplashBanner>
		);
	}

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
					<PreRound state={waveState.value} />
				</MainContainer>
			</SplashBanner>
		);
	}

	return (
		<MainContainer noPadding>
			<TouchscreenJoystick />
			<ShowRound canvas={gameCanvas} />
		</MainContainer>
	);
}

type Props = {
	canvas: HTMLCanvasElement | undefined;
};

export function ShowRound({ canvas }: Props) {
	const rootEl = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (rootEl.current && canvas) {
			rootEl.current.innerHTML = "";
			rootEl.current.appendChild(canvas);
		}
	}, [canvas, rootEl.current]);

	return (
		<div className="full-viewport" ref={rootEl}>
			Loading...
		</div>
	);
}

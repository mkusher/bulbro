import {
	useEffect,
	useRef,
} from "preact/hooks";
import { TouchscreenJoystick } from "@/controls/TouchscreenJoystick";
import {
	currentGameCanvas,
	isLoading as isLoadingSignal,
	isRound as isRoundSignal,
	waveResult,
} from "@/currentGameProcess";
import {
	currentLobby,
	currentNetworkGame,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import { Failed } from "@/screens/Failed";
import { PreRound } from "@/screens/PreRound";
import { MainContainer } from "@/ui/Layout";
import { Loader } from "@/ui/Loading";
import { SplashBanner } from "@/ui/Splash";
import { StartScreen } from "./StartScreen";

export function InGame() {
	const gameCanvas =
		currentGameCanvas.value;
	const finishedResult =
		waveResult.value;
	const isRound =
		isRoundSignal.value;
	const isLoading =
		isLoadingSignal.value;
	const remotePlayer =
		currentNetworkGame.value &&
		currentLobby.value?.players.find(
			(
				p,
			) =>
				p.id !==
				currentUser
					.value
					.id,
		);

	if (
		isLoading
	) {
		return (
			<MainContainer>
				<Loader />
			</MainContainer>
		);
	}

	if (
		!isRound
	) {
		return (
			<StartScreen />
		);
	}

	if (
		finishedResult ===
		"fail"
	) {
		return (
			<SplashBanner>
				<MainContainer
					noPadding
					top
				>
					<Failed />
				</MainContainer>
			</SplashBanner>
		);
	}

	if (
		finishedResult ===
		"win"
	) {
		return (
			<SplashBanner>
				<MainContainer
					noPadding
					top
				>
					<PreRound />
				</MainContainer>
			</SplashBanner>
		);
	}

	return (
		<MainContainer
			noPadding
		>
			{remotePlayer && (
				<p className="absolute top-2 left-2 z-10 rounded bg-black/70 px-3 py-1 text-white">
					{
						remotePlayer.username
					}
					:{" "}
					{remotePlayer.status ===
					"connected"
						? "Connected"
						: "Disconnected"}
				</p>
			)}
			<TouchscreenJoystick />
			<ShowRound
				canvas={
					gameCanvas
				}
			/>
		</MainContainer>
	);
}

type Props =
	{
		canvas:
			| HTMLCanvasElement
			| undefined;
	};

export function ShowRound({
	canvas,
}: Props) {
	const rootEl =
		useRef<HTMLDivElement | null>(
			null,
		);
	useEffect(() => {
		if (
			rootEl.current &&
			canvas
		) {
			rootEl.current.innerHTML =
				"";
			rootEl.current.appendChild(
				canvas,
			);
		}
	}, [
		canvas,
		rootEl.current,
	]);

	return (
		<div
			className="full-viewport"
			ref={
				rootEl
			}
		>
			Starting...
		</div>
	);
}

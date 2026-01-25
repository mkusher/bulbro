import { computed } from "@preact/signals";
import { Label } from "@radix-ui/react-label";
import { ShareIcon } from "lucide-react";
import {
	useEffect,
	useState,
} from "preact/hooks";
import type { Bulbro } from "@/bulbro";
import { BulbroCard } from "@/bulbro/BulbroCard";
import { wellRoundedBulbro } from "@/characters-definitions";
import type { Difficulty } from "@/game-formulas";
import { logger } from "@/logger";
import {
	currentLobby,
	markAsReady,
	readyPlayers,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import { startNetworkGameAsHost } from "@/network/start-game";
import { createPlayer } from "@/player";
import { isTgApp } from "@/tg-app";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { DifficultySelector } from "@/ui/DifficultySelector";
import {
	CentralCard,
	MainContainer,
} from "@/ui/Layout";
import {
	getJoinLobbyUrl,
	getTgJoinLobbyUrl,
	useRouter,
} from "@/ui/routing";
import { SplashBanner } from "@/ui/Splash";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { WeaponSelector } from "@/ui/WeaponSelector";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";
import {
	audioEngine,
	bgmEnabled,
} from "@/audio";

function getShareUrl() {
	const lobby =
		currentLobby.value;
	if (
		!lobby
	)
		return;
	if (
		isTgApp.value
	) {
		return getTgJoinLobbyUrl(
			lobby.id,
		);
	}
	return getJoinLobbyUrl(
		lobby.id,
	);
}
const shareMessage =
	computed(
		() => ({
			text: `Join lobby`,
			url: getShareUrl(),
		}),
	);

export function SetupOnlineGame() {
	const [
		firstBulbro,
		changeFirstBulbro,
	] =
		useState<Bulbro>(
			wellRoundedBulbro,
		);
	const [
		selectedDifficulty,
		selectDifficulty,
	] =
		useState<Difficulty>(
			0,
		);
	const [
		selectedWeapon,
		setSelectedWeapon,
	] =
		useState<Weapon | null>(
			smg,
		);
	const [
		selectedDuration,
		setDuration,
	] =
		useState<number>(
			60,
		);
	const lobby =
		currentLobby.value ?? {
			id: "",
			players:
				[],
			hostId:
				"",
		};
	const iam =
		currentUser.value;
	const [
		isStarting,
		setIsStarting,
	] =
		useState(
			false,
		);
	const router =
		useRouter();
	const share: ShareData =
		shareMessage.value;

	// Start BGM when component mounts
	useEffect(() => {
		const initAudio =
			async () => {
				await audioEngine.init();
				await audioEngine.resume();
				if (
					bgmEnabled.value
				) {
					audioEngine.playBgm();
				}
			};
		initAudio();
	}, []);
	const canShare =
		window
			.navigator
			.canShare &&
		window.navigator.canShare(
			share,
		);
	if (
		iam.isGuest
	) {
		return (
			<h1>
				Not
				authenticated
			</h1>
		);
	}
	const onReady =
		(
			e: SubmitEvent,
		) => {
			e.preventDefault();
			markAsReady(
				lobby.id,
				createPlayer(
					iam.id,
					firstBulbro,
					selectedWeapon
						? [
								selectedWeapon,
							]
						: [],
				),
			);
		};
	const onStart =
		(
			e: Event,
		) => {
			e.preventDefault();
			setIsStarting(
				true,
			);
			startNetworkGameAsHost(
				selectedDifficulty,
				selectedDuration,
			);
			router.toGame();
		};

	const shareLobby =
		async (
			e: Event,
		) => {
			e.preventDefault();
			if (
				canShare
			) {
				await window.navigator.share(
					share,
				);
			} else {
				logger.warn(
					"Share is not available",
				);
			}
		};
	const anotherPlayer =
		lobby.players.find(
			(
				p,
			) =>
				p.id !==
				iam.id,
		);

	const isLocalReady =
		readyPlayers.value.find(
			(
				p,
			) =>
				p.id ===
				iam.id,
		);
	const anotherPlayerBulbro =
		readyPlayers.value.find(
			(
				p,
			) =>
				p.id ===
				anotherPlayer?.id,
		);
	const isAnotherPlayerReady =
		!!anotherPlayerBulbro;
	const isHost =
		iam.id ===
		lobby.hostId;
	return (
		<SplashBanner>
			<MainContainer
				noPadding
				top
			>
				<CentralCard>
					<Card>
						<CardHeader>
							<CardTitle>
								Lobby
							</CardTitle>
							<CardDescription>
								<form
									className="flex gap-2 items-center"
									onSubmit={
										shareLobby
									}
								>
									<label>
										ID
										for
										joining:{" "}
										<input
											type="text"
											className="bg-gray-200 rounded-xs w-2xs can-select px-2 py-1"
											disabled
											value={
												lobby.id
											}
										/>
									</label>
									{!anotherPlayer ? (
										<Button
											variant="outline"
											size="icon"
											className="size-8"
											type="submit"
											disabled={
												!canShare
											}
										>
											<ShareIcon />
										</Button>
									) : null}
								</form>
								<p>
									Status:
									Connected{" "}
									{isLocalReady
										? "Ready"
										: "Not ready"}
								</p>
								<p>
									Another
									player
									status:{" "}
									{!anotherPlayer
										? "Disconnected"
										: (anotherPlayer.status ??
											"Connected")}{" "}
									{isAnotherPlayerReady
										? "Ready"
										: "Not ready"}
								</p>
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-6">
							<h2>
								Hi,{" "}
								{
									currentUser
										.value
										.username
								}
								!
							</h2>
							<div className="flex flex-col xl:flex-row gap-3 flex-wrap">
								{!isLocalReady ? (
									<form
										onSubmit={
											onReady
										}
										className="flex flex-col gap-3"
									>
										<BulbroSelector
											selectedBulbro={
												firstBulbro
											}
											onChange={(
												bulbro,
											) =>
												changeFirstBulbro(
													bulbro,
												)
											}
										/>
										<WeaponSelector
											selectedWeapon={
												selectedWeapon
											}
											availableWeapons={
												firstBulbro.availableWeapons
											}
											onChange={
												setSelectedWeapon
											}
										/>
										<div className="grid">
											<Button type="submit">
												Ready
											</Button>
										</div>
									</form>
								) : (
									<BulbroCard
										bulbro={{
											...firstBulbro,
											weapons:
												selectedWeapon
													? [
															selectedWeapon,
														]
													: [],
										}}
									/>
								)}
								<div className="flex flex-col gap-6 my-3">
									<h2>
										{
											anotherPlayer?.username
										}
									</h2>
									{anotherPlayer ? (
										anotherPlayerBulbro ? (
											<>
												<p>
													Ready
												</p>
												<BulbroCard
													bulbro={
														anotherPlayerBulbro.bulbro
													}
												/>
											</>
										) : (
											<p>
												Not
												Ready
											</p>
										)
									) : (
										<h1>
											Waiting
											for
											a
											player
											to
											connect...
										</h1>
									)}
								</div>
							</div>
							<div id="difficulty-select">
								<DifficultySelector
									selectDifficulty={
										selectDifficulty
									}
									selectedDifficulty={
										selectedDifficulty
									}
								/>
							</div>
							<div id="duration">
								<Label>
									Wave
									duration:
								</Label>
								<Input
									type="number"
									value={
										selectedDuration
									}
									onChange={(
										e,
									) => {
										setDuration(
											Number(
												e
													.currentTarget
													.value,
											),
										);
									}}
								/>
							</div>
						</CardContent>
						<CardFooter className="grid">
							{isHost ? (
								<Button
									onClick={
										onStart
									}
									disabled={
										readyPlayers
											.value
											.length <
											2 ||
										isStarting
									}
								>
									Start
									game
								</Button>
							) : (
								<p>
									Waiting
									for
									the
									game
									to
									start...
								</p>
							)}
						</CardFooter>
					</Card>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}

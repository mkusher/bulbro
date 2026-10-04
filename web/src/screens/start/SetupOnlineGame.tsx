import { computed } from "@preact/signals";
import { ShareIcon } from "lucide-react";
import { useState } from "preact/hooks";
import { useStartBgm } from "@/audio/useStartBgm";
import { BulbroCard } from "@/bulbro/BulbroCard";
import { wellRoundedBulbro } from "@/characters-definitions";
import type { Difficulty } from "@/game-formulas";
import { t } from "@/i18n";
import { logger } from "@/logger";
import {
	currentLobby,
	markAsReady,
	readyPlayers,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import { lobbyConnectionError } from "@/network/LobbyConnection";
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
	type PlayerStatus,
	PlayersStatus,
} from "@/ui/PlayersStatus";
import {
	getJoinLobbyUrl,
	getTgJoinLobbyUrl,
	useRouter,
} from "@/ui/routing";
import { SplashBanner } from "@/ui/Splash";
import { StartingWeaponSelector } from "@/ui/StartingWeaponSelector";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { smg } from "@/weapons-definitions";
import { Failed } from "../Failed";
import { useStartingLoadout } from "./useStartingLoadout";

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
			text: t(
				"lobby.title",
			),
			url: getShareUrl(),
		}),
	);

export function SetupOnlineGame() {
	const loadout =
		useStartingLoadout(
			wellRoundedBulbro,
			smg,
		);
	const {
		bulbro:
			firstBulbro,
		selectBulbro:
			changeFirstBulbro,
	} =
		loadout;
	const [
		selectedDifficulty,
		selectDifficulty,
	] =
		useState<Difficulty>(
			0,
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
	const [
		startError,
		setStartError,
	] =
		useState(
			"",
		);
	const router =
		useRouter();
	const share: ShareData =
		shareMessage.value;

	// Start BGM when component mounts
	useStartBgm();

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
			<Failed />
		);
	}
	const onReady =
		async (
			e: SubmitEvent,
		) => {
			e.preventDefault();
			if (
				!loadout.isValid
			)
				return;
			setStartError(
				"",
			);
			try {
				await markAsReady(
					lobby.id,
					createPlayer(
						iam.id,
						firstBulbro,
						loadout.weapons,
					),
				);
			} catch (error) {
				setStartError(
					error instanceof
						Error
						? error.message
						: String(
								error,
							),
				);
			}
		};
	const onStart =
		(
			e: Event,
		) => {
			e.preventDefault();
			setIsStarting(
				true,
			);
			setStartError(
				"",
			);
			startNetworkGameAsHost(
				selectedDifficulty,
				router.toGame,
			).catch(
				(
					error,
				) => {
					setStartError(
						error instanceof
							Error
							? error.message
							: String(
									error,
								),
					);
					setIsStarting(
						false,
					);
				},
			);
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
	const playersStatus: PlayerStatus[] =
		lobby.players.map(
			(
				player,
			) => {
				const readyPlayer =
					readyPlayers.value.find(
						(
							ready,
						) =>
							ready.id ===
							player.id,
					);
				const isLocal =
					player.id ===
					iam.id;
				return {
					id: player.id,
					username:
						player.username,
					connected:
						player.status ===
						"connected",
					ready:
						!!readyPlayer,
					isLocal,
					bulbroName:
						isLocal
							? firstBulbro.name
							: readyPlayer
									?.bulbro
									.name,
				};
			},
		);
	const isHost =
		iam.id ===
		lobby.hostId;
	const canStart =
		lobby
			.players
			.length ===
			2 &&
		lobby.players.every(
			(
				player,
			) =>
				player.status ===
					"connected" &&
				readyPlayers.value.some(
					(
						ready,
					) =>
						ready.id ===
						player.id,
				),
		);
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
								{t(
									"lobby.title",
								)}
							</CardTitle>
							<CardDescription>
								<form
									className="flex gap-2 items-center"
									onSubmit={
										shareLobby
									}
								>
									<label>
										{t(
											"lobby.idForJoining",
										)}{" "}
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
											aria-label={t(
												"setup.share",
											)}
											disabled={
												!canShare
											}
										>
											<ShareIcon />
										</Button>
									) : null}
								</form>
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-6">
							<PlayersStatus
								players={
									playersStatus
								}
							/>
							<h2>
								{t(
									"greeting",
									{
										username:
											iam.username,
									},
								)}
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
										<StartingWeaponSelector
											bulbro={
												firstBulbro
											}
											selections={
												loadout.selections
											}
											onChange={
												loadout.selectWeapon
											}
										/>
										<div className="grid">
											<Button
												type="submit"
												disabled={
													!loadout.isValid
												}
											>
												{t(
													"setup.ready",
												)}
											</Button>
										</div>
									</form>
								) : (
									<BulbroCard
										bulbro={{
											...firstBulbro,
											weapons:
												[
													...firstBulbro.weapons,
													...loadout.weapons,
												],
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
													{t(
														"setup.ready",
													)}
												</p>
												<BulbroCard
													bulbro={
														anotherPlayerBulbro.bulbro
													}
												/>
											</>
										) : (
											<p>
												{t(
													"setup.notReady",
												)}
											</p>
										)
									) : (
										<h1>
											{t(
												"setup.waitingForPlayer",
											)}
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
						</CardContent>
						<CardFooter className="grid">
							{(startError ||
								lobbyConnectionError.value) && (
								<p role="alert">
									{startError ||
										lobbyConnectionError.value}
								</p>
							)}
							{isHost ? (
								<Button
									onClick={
										onStart
									}
									disabled={
										!canStart ||
										isStarting
									}
								>
									{t(
										"setup.startGame",
									)}
								</Button>
							) : (
								<p>
									{t(
										"setup.waitingForStart",
									)}
								</p>
							)}
						</CardFooter>
					</Card>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}

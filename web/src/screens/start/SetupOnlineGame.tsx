import { useState } from "preact/hooks";
import type { StartGame } from "@/ui/start-game";
import { wellRoundedBulbro } from "@/characters-definitions";
import { type Difficulty } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";
import { BulbroConfig } from "@/ui/BulbroConfig";
import type { CharacterSetup } from "@/GameProcess";
import { CardPosition } from "./CardPosition";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/ui/shadcn/input";
import { DifficultySelector } from "@/ui/DifficultySelector";
import {
	currentLobby,
	markAsReady,
	readyPlayers,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import { createPlayer } from "@/player";
import { BulbroConfigView } from "@/ui/BulbroConfigView";

type Props = {
	startGame: StartGame;
};

export function SetupOnlineGame({ startGame }: Props) {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "dark oracle",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [weaponsSetup, setWeaponsSetup] = useState<Weapon[]>([smg]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const lobby = currentLobby.value ?? {
		id: "",
		players: [],
		hostId: "",
	};
	const iam = currentUser.value;
	if (iam.isGuest) {
		return <h1>Not authenticated</h1>;
	}
	const onReady = (e: SubmitEvent) => {
		e.preventDefault();
		markAsReady(
			lobby.id,
			createPlayer(
				iam.id,
				firstBulbro.bulbro,
				firstBulbro.sprite,
				weaponsSetup,
			),
		);
	};
	const onStart = (e: Event) => {
		e.preventDefault();
	};
	const anotherPlayer = lobby.players.find((p) => p.id !== iam.id);

	const isLocalReady = readyPlayers.value.find((p) => p.id === iam.id);
	const anotherPlayerBulbro = readyPlayers.value.find(
		(p) => p.id === anotherPlayer?.id,
	);
	const isAnotherPlayerReady = !!anotherPlayerBulbro;
	const isHost = iam.id === lobby.hostId;
	return (
		<CardPosition>
			<Card>
				<CardHeader>
					<CardTitle>Lobby</CardTitle>
					<CardDescription>
						<p>
							ID for joining:{" "}
							<span className="bg-gray-200 can-select p-1">{lobby.id}</span>
						</p>
						<p>Status: Connected {isLocalReady ? "Ready" : "Not ready"}</p>
						<p>
							Another player status:{" "}
							{!anotherPlayer
								? "Disconnected"
								: (anotherPlayer.status ?? "Connected")}{" "}
							{isAnotherPlayerReady ? "Ready" : "Not ready"}
						</p>
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6">
					<h2>Hi, {currentUser.value.username}!</h2>
					<div className="flex flex-col xl:flex-row gap-3 flex-wrap">
						{!isLocalReady ? (
							<form onSubmit={onReady} className="flex flex-col gap-3">
								<BulbroConfig
									selectBulbro={(bulbro) =>
										changeFirstBulbro({ ...firstBulbro, bulbro })
									}
									selectedBulbro={firstBulbro.bulbro}
									selectBulbroStyle={(sprite) =>
										changeFirstBulbro({ ...firstBulbro, sprite })
									}
									selectedBulbroStyle={firstBulbro.sprite}
									selectedWeapons={weaponsSetup ?? []}
									selectWeapons={setWeaponsSetup}
								/>
								<div className="grid">
									<Button type="submit">Ready</Button>
								</div>
							</form>
						) : (
							<BulbroConfigView
								selectedBulbro={firstBulbro.bulbro}
								selectedBulbroStyle={firstBulbro.sprite}
								selectedWeapons={weaponsSetup}
							/>
						)}
						<div className="flex flex-col gap-6 my-3">
							<h2>{anotherPlayer?.username}</h2>
							{!!anotherPlayer ? (
								anotherPlayerBulbro ? (
									<>
										<p>Ready</p>
										<BulbroConfigView
											selectedBulbro={anotherPlayerBulbro.bulbro}
											selectedBulbroStyle={anotherPlayerBulbro.sprite}
											selectedWeapons={anotherPlayerBulbro.bulbro.weapons}
										/>
									</>
								) : (
									<p>Not Ready</p>
								)
							) : (
								<h1>Waiting for a player to connect...</h1>
							)}
						</div>
					</div>
					<div id="difficulty-select">
						<DifficultySelector
							selectDifficulty={selectDifficulty}
							selectedDifficulty={selectedDifficulty}
						/>
					</div>
					<div id="duration">
						<Label>Wave duration:</Label>
						<Input
							type="number"
							value={selectedDuration}
							onChange={(e) => {
								setDuration(Number(e.currentTarget.value));
							}}
						/>
					</div>
				</CardContent>
				<CardFooter className="grid">
					{isHost ? (
						<Button onClick={onStart} disabled={readyPlayers.value.length < 2}>
							Start game
						</Button>
					) : (
						<p>Waiting for the game to start...</p>
					)}
				</CardFooter>
			</Card>
		</CardPosition>
	);
}

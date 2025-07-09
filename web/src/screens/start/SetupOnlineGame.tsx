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
import { currentLobby } from "@/network/currentLobby";
import { BulbroConfigView } from "@/ui/BulbroConfigView";
import { currentUser } from "@/network/currentUser";

type Props = {
	startGame: StartGame;
};

export function SetupOnlineGame({ startGame }: Props) {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "dark oracle",
	});
	const [secondBulbro, changeSecondBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "valkyrie",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [weaponsSetup, setWeaponsSetup] = useState<Weapon[][]>([[smg], [smg]]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			[firstBulbro, secondBulbro],
			selectedDifficulty,
			weaponsSetup,
			selectedDuration,
		);
	};
	const lobby = currentLobby.value ?? {
		id: "",
		players: [],
	};
	const iam = currentUser.value;
	if (iam.isGuest) {
		return <h1>Not authenticated</h1>;
	}
	const anotherPlayer = lobby.players.find((p) => p.id !== iam.id);
	return (
		<CardPosition>
			<Card>
				<CardHeader>
					<CardTitle>Lobby {lobby.players.length}</CardTitle>
					<CardDescription>
						<p>
							ID for joining:{" "}
							<span className="bg-gray-200 can-select p-1">{lobby.id}</span>
						</p>
						<p>Connection status: Connected</p>
						<p>
							Another player status:{" "}
							{!anotherPlayer ? "Disconnected" : "Connected"}
						</p>
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6">
					<h2>Hi, {currentUser.value.username}!</h2>
					<form onSubmit={onSubmit}>
						<div className="flex md:flex-row gap-3 flex-wrap">
							<div className="character">
								<BulbroConfig
									selectBulbro={(bulbro) =>
										changeFirstBulbro({ ...firstBulbro, bulbro })
									}
									selectedBulbro={firstBulbro.bulbro}
									selectBulbroStyle={(sprite) =>
										changeFirstBulbro({ ...firstBulbro, sprite })
									}
									selectedBulbroStyle={firstBulbro.sprite}
									selectedWeapons={weaponsSetup[0] ?? []}
									selectWeapons={(weapons) =>
										setWeaponsSetup(([w]) => [weapons, w ?? []])
									}
								/>
							</div>
							<div className="flex flex-col gap-6 my-3">
								<h2>{anotherPlayer?.username}</h2>
								{!!anotherPlayer ? (
									<BulbroConfigView
										selectedBulbro={secondBulbro.bulbro}
										selectedBulbroStyle={secondBulbro.sprite}
										selectedWeapons={weaponsSetup[1] ?? []}
									/>
								) : (
									<h1>Disconnected</h1>
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
					</form>
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-full">
						Start
					</Button>
				</CardFooter>
			</Card>
		</CardPosition>
	);
}

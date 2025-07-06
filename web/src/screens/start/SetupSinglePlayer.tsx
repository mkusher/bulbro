import { useState } from "preact/hooks";
import type { StartGame } from "@/ui/start-game";
import { wellRoundedBulbro } from "@/characters-definitions";
import { type Difficulty } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { fist, pistol } from "@/weapons-definitions";
import { BulbroConfig } from "@/ui/BulbroConfig";
import type { CharacterSetup } from "@/GameProcess";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/shadcn/card";
import { Label } from "@/ui/shadcn/label";
import { Input } from "@/ui/shadcn/input";
import { Button } from "@/ui/shadcn/button";
import { CardPosition } from "./CardPosition";
import { DifficultySelector } from "@/ui/DifficultySelector";

type Props = {
	startGame: StartGame;
};

export function SetupSinglePlayer({ startGame }: Props) {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "dark oracle",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[][]>([
		[pistol, fist],
	]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			[firstBulbro],
			selectedDifficulty,
			selectedWeapons,
			selectedDuration,
		);
	};
	return (
		<CardPosition>
			<Card>
				<form className="flex flex-col gap-3" onSubmit={onSubmit}>
					<CardHeader>
						<h2>Start new session</h2>
					</CardHeader>
					<CardContent className="grid gap-6">
						<BulbroConfig
							selectBulbro={(bulbro) =>
								changeFirstBulbro({ ...firstBulbro, bulbro })
							}
							selectedBulbro={firstBulbro.bulbro}
							selectBulbroStyle={(sprite) =>
								changeFirstBulbro({ ...firstBulbro, sprite })
							}
							selectedBulbroStyle={firstBulbro.sprite}
							selectedWeapons={selectedWeapons[0] ?? []}
							selectWeapons={(weapons) => selectWeapons([weapons])}
						/>
						<div id="difficulty-select">
							<DifficultySelector
								selectDifficulty={selectDifficulty}
								selectedDifficulty={selectedDifficulty}
							/>
						</div>
						<div id="duration grid gap-3">
							<Label htmlFor="wave-duration">Wave duration:</Label>
							<Input
								type="number"
								name="wave-duration"
								value={selectedDuration}
								onChange={(e) => {
									setDuration(Number(e.currentTarget.value));
								}}
							/>
						</div>
					</CardContent>
					<CardFooter className="flex">
						<Button type="submit" className="w-full">
							Start
						</Button>
					</CardFooter>
				</form>
			</Card>
		</CardPosition>
	);
}

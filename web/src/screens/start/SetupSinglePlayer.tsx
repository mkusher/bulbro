import { useState } from "preact/hooks";
import type { StartGame } from "@/ui/start-game";
import { wellRoundedBulbro } from "@/characters-definitions";
import { isDifficulty, type Difficulty } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { fist, pistol } from "@/weapons-definitions";
import { DifficultyOption } from "@/ui/Options";
import { BulbroConfig } from "@/ui/BulbroConfig";
import type { CharacterSetup } from "@/GameProcess";
import layoutStyles from "@/ui/layout.module.css";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/shadcn/card";
import { Label } from "@/ui/shadcn/label";
import { Input } from "@/ui/shadcn/input";
import { Button } from "@/ui/shadcn/button";

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
		<div className="flex h-screen w-4/5">
			<div className="m-auto w-full flex flex-col gap-6 pb-40">
				<Card>
					<CardHeader>
						<h2>Start new session</h2>
					</CardHeader>
					<CardContent className="grid gap-6">
						<form className="w-full flex flex-col gap-3" onSubmit={onSubmit}>
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
								selectWeapons={(weapons) =>
									selectWeapons(([w]) => [weapons, w ?? []])
								}
							/>
							<div id="difficulty-select">
								<Label htmlFor="difficulty">Difficulty:</Label>
								<select
									name="difficulty"
									value={selectedDifficulty}
									onChange={(e) => {
										const newValue = Number(e.currentTarget.value);
										if (isDifficulty(newValue)) {
											selectDifficulty(newValue);
										}
									}}
								>
									{([0, 1, 2, 3, 4, 5] as const).map(
										(difficulty: Difficulty) => (
											<DifficultyOption
												key={difficulty}
												value={difficulty}
												selected={selectedDifficulty === difficulty}
											/>
										),
									)}
								</select>
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
						</form>
					</CardContent>
					<CardFooter className="flex">
						<Button type="submit" className="w-full">
							Start
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

import { useState } from "preact/hooks";
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
import { CentralCard, MainContainer } from "@/ui/Layout";
import { DifficultySelector } from "@/ui/DifficultySelector";
import { createPlayer } from "@/player";
import { v4 } from "uuid";
import { createMainControls } from "@/controls";
import { SplashBanner } from "@/ui/Splash";
import { startLocalGame } from "@/currentGameProcess";
import { useRouter } from "@/ui/routing";

export function SetupSinglePlayer() {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "dark oracle",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[][]>([
		[pistol, fist],
	]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const router = useRouter();
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startLocalGame(
			[firstBulbro].map((character, i) =>
				createPlayer(
					v4(),
					character.bulbro,
					character.sprite,
					selectedWeapons[i],
				),
			),
			[createMainControls()],
			selectedDifficulty,
			selectedDuration,
		);
		router.toGame();
	};
	return (
		<SplashBanner>
			<MainContainer noPadding top>
				<CentralCard>
					<form onSubmit={onSubmit}>
						<Card className="flex flex-col gap-6 mt-30">
							<CardHeader>
								<h1 className="text-3xl">Start single player run</h1>
							</CardHeader>
							<CardContent className="flex flex-col gap-6 max-w-screen">
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
								<div id="difficulty-select" className="gap-3">
									<DifficultySelector
										selectDifficulty={selectDifficulty}
										selectedDifficulty={selectedDifficulty}
									/>
								</div>
								<div id="duration" className="gap-3">
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
							<CardFooter className="flex gap-6">
								<Button type="submit" className="w-full">
									Start
								</Button>
							</CardFooter>
						</Card>
					</form>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}

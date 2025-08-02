import { useState } from "preact/hooks";
import { wellRoundedBulbro } from "@/characters-definitions";
import { type Difficulty } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";
import { BulbroConfig } from "@/ui/BulbroConfig";
import type { CharacterSetup } from "@/GameProcess";
import { CentralCard } from "@/ui/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/ui/shadcn/input";
import { DifficultySelector } from "@/ui/DifficultySelector";
import { createPlayer } from "@/player";
import { v4 } from "uuid";
import { createMainControls, SecondaryKeyboardControl } from "@/controls";
import { startLocalGame } from "@/currentGameProcess";
import { useRouter } from "@/ui/routing";

export function SetupLocalCoOp() {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "normal",
	});
	const [secondBulbro, changeSecondBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "vampire",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [weaponsSetup, setWeaponsSetup] = useState<Weapon[][]>([[smg], [smg]]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const router = useRouter();
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startLocalGame(
			[firstBulbro, secondBulbro].map((character, i) =>
				createPlayer(v4(), character.bulbro, character.sprite, weaponsSetup[i]),
			),
			[createMainControls(), new SecondaryKeyboardControl()],
			selectedDifficulty,
			selectedDuration,
		);
		router.toGame();
	};
	return (
		<CentralCard>
			<Card>
				<CardHeader>
					<h2>Start new co-op session</h2>
				</CardHeader>
				<CardContent className="grid gap-6">
					<form onSubmit={onSubmit}>
						<div className="flex flex-col md:flex-row gap-3">
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
							<div className="character">
								<BulbroConfig
									selectBulbro={(bulbro) =>
										changeSecondBulbro({ ...secondBulbro, bulbro })
									}
									selectedBulbro={secondBulbro.bulbro}
									selectBulbroStyle={(sprite) =>
										changeSecondBulbro({ ...secondBulbro, sprite })
									}
									selectedBulbroStyle={secondBulbro.sprite}
									selectedWeapons={weaponsSetup[1] ?? []}
									selectWeapons={(weapons) =>
										setWeaponsSetup(([w]) => [w ?? [], weapons])
									}
								/>
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
		</CentralCard>
	);
}

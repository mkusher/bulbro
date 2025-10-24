import { useState } from "preact/hooks";
import { wellRoundedBulbro } from "@/characters-definitions";
import { type Difficulty } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { CentralCard } from "@/ui/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/ui/shadcn/input";
import { DifficultySelector } from "@/ui/DifficultySelector";
import { WeaponSelector } from "@/ui/WeaponSelector";
import { createPlayer } from "@/player";
import { v4 } from "uuid";
import { createMainControls, SecondaryKeyboardControl } from "@/controls";
import { startLocalGame } from "@/currentGameProcess";
import { useRouter } from "@/ui/routing";
import type { Bulbro } from "@/bulbro";

export function SetupLocalCoOp() {
	const [firstBulbro, changeFirstBulbro] = useState<Bulbro>(wellRoundedBulbro);
	const [secondBulbro, changeSecondBulbro] =
		useState<Bulbro>(wellRoundedBulbro);
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [firstPlayerWeapon, setFirstPlayerWeapon] = useState<Weapon | null>(
		smg,
	);
	const [secondPlayerWeapon, setSecondPlayerWeapon] = useState<Weapon | null>(
		smg,
	);
	const [selectedDuration, setDuration] = useState<number>(60);
	const router = useRouter();
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startLocalGame(
			[
				createPlayer(
					v4(),
					firstBulbro,
					firstPlayerWeapon ? [firstPlayerWeapon] : [],
				),
				createPlayer(
					v4(),
					secondBulbro,
					secondPlayerWeapon ? [secondPlayerWeapon] : [],
				),
			],
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
								<BulbroSelector
									selectedBulbro={firstBulbro}
									onChange={(bulbro) => changeFirstBulbro(bulbro)}
								/>
								<div className="mt-4">
									<WeaponSelector
										selectedWeapon={firstPlayerWeapon}
										availableWeapons={firstBulbro.availableWeapons}
										onChange={setFirstPlayerWeapon}
									/>
								</div>
							</div>
							<div className="character">
								<BulbroSelector
									selectedBulbro={secondBulbro}
									onChange={(bulbro) => changeSecondBulbro(bulbro)}
								/>
								<div className="mt-4">
									<WeaponSelector
										selectedWeapon={secondPlayerWeapon}
										availableWeapons={secondBulbro.availableWeapons}
										onChange={setSecondPlayerWeapon}
									/>
								</div>
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

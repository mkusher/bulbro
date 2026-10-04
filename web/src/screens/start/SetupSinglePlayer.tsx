import {
	useEffect,
	useState,
} from "preact/hooks";
import { v4 } from "uuid";
import {
	audioEngine,
	bgmEnabled,
	useStartBgm,
} from "@/audio";
import { wellRoundedBulbro } from "@/characters-definitions";
import { createMainControls } from "@/controls";
import { startLocalGame } from "@/currentGameProcess";
import type { Difficulty } from "@/game-formulas";
import { t } from "@/i18n";
import { createPlayer } from "@/player";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { DifficultySelector } from "@/ui/DifficultySelector";
import {
	CentralCard,
	MainContainer,
} from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { SplashBanner } from "@/ui/Splash";
import { StartingWeaponSelector } from "@/ui/StartingWeaponSelector";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";
import { useStartingLoadout } from "./useStartingLoadout";

export function SetupSinglePlayer() {
	const loadout =
		useStartingLoadout(
			wellRoundedBulbro,
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
	const router =
		useRouter();

	// Start BGM when component mounts
	useStartBgm();
	const onSubmit =
		(
			e: SubmitEvent,
		) => {
			e.preventDefault();
			if (
				!loadout.isValid
			)
				return;
			startLocalGame(
				[
					firstBulbro,
				].map(
					(
						character,
					) =>
						createPlayer(
							v4(),
							character,
							loadout.weapons,
						),
				),
				[
					createMainControls(),
				],
				selectedDifficulty,
			);
			router.toGame();
		};
	return (
		<SplashBanner>
			<MainContainer
				noPadding
				top
			>
				<CentralCard>
					<form
						onSubmit={
							onSubmit
						}
					>
						<Card className="flex flex-col gap-6 mt-30 mb-30">
							<CardHeader>
								<h1 className="text-3xl">
									{t(
										"setup.single.title",
									)}
								</h1>
							</CardHeader>
							<CardContent className="flex flex-col gap-6 max-w-screen">
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
								<div
									id="weapons-select"
									className="gap-3"
								>
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
								</div>
								<div
									id="difficulty-select"
									className="gap-3"
								>
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
							<CardFooter className="flex gap-6">
								<Button
									type="submit"
									disabled={
										!loadout.isValid
									}
									className="w-full"
								>
									{t(
										"setup.single.start",
									)}
								</Button>
							</CardFooter>
						</Card>
					</form>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}

import {
	useEffect,
	useState,
} from "preact/hooks";
import { v4 } from "uuid";
import type { Bulbro } from "@/bulbro";
import { wellRoundedBulbro } from "@/characters-definitions";
import { createMainControls } from "@/controls";
import { startLocalGame } from "@/currentGameProcess";
import type { Difficulty } from "@/game-formulas";
import { createPlayer } from "@/player";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { DifficultySelector } from "@/ui/DifficultySelector";
import {
	CentralCard,
	MainContainer,
} from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { SplashBanner } from "@/ui/Splash";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";

import { WeaponSelector } from "@/ui/WeaponSelector";
import type { Weapon } from "@/weapon";
import {
	audioEngine,
	bgmEnabled,
} from "@/audio";

export function SetupSinglePlayer() {
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
		selectWeapon,
	] =
		useState<Weapon | null>(
			null,
		);
	const router =
		useRouter();

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
	const onSubmit =
		(
			e: SubmitEvent,
		) => {
			e.preventDefault();
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
							selectedWeapon
								? [
										selectedWeapon,
									]
								: [],
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
						<Card className="flex flex-col gap-6 mt-30">
							<CardHeader>
								<h1 className="text-3xl">
									Start
									single
									player
									run
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
									<WeaponSelector
										selectedWeapon={
											selectedWeapon
										}
										availableWeapons={
											firstBulbro.availableWeapons
										}
										onChange={
											selectWeapon
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
									className="w-full"
								>
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

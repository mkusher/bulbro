import {
	useEffect,
	useState,
} from "preact/hooks";
import { v4 } from "uuid";
import {
	audioEngine,
	bgmEnabled,
} from "@/audio";
import { useStartBgm } from "@/audio/useStartBgm";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	createMainControls,
	SecondaryKeyboardControl,
} from "@/controls";
import { startLocalGame } from "@/currentGameProcess";
import type { Difficulty } from "@/game-formulas";
import { t } from "@/i18n";
import { createPlayer } from "@/player";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { DifficultySelector } from "@/ui/DifficultySelector";
import { CentralCard } from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { StartingWeaponSelector } from "@/ui/StartingWeaponSelector";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";
import { smg } from "@/weapons-definitions";
import { useStartingLoadout } from "./useStartingLoadout";

export function SetupLocalCoOp() {
	const firstLoadout =
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
		firstLoadout;
	const secondLoadout =
		useStartingLoadout(
			wellRoundedBulbro,
			smg,
		);
	const {
		bulbro:
			secondBulbro,
		selectBulbro:
			changeSecondBulbro,
	} =
		secondLoadout;
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
				!(
					firstLoadout.isValid &&
					secondLoadout.isValid
				)
			)
				return;
			startLocalGame(
				[
					createPlayer(
						v4(),
						firstBulbro,
						firstLoadout.weapons,
					),
					createPlayer(
						v4(),
						secondBulbro,
						secondLoadout.weapons,
					),
				],
				[
					createMainControls(),
					new SecondaryKeyboardControl(),
				],
				selectedDifficulty,
			);
			router.toGame();
		};
	return (
		<CentralCard>
			<Card>
				<CardHeader>
					<h2>
						{t(
							"setup.coop.title",
						)}
					</h2>
				</CardHeader>
				<CardContent className="grid gap-6">
					<form
						id="local-coop-setup"
						onSubmit={
							onSubmit
						}
					>
						<div className="flex flex-col md:flex-row gap-3">
							<div className="character">
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
								<div className="mt-4">
									<StartingWeaponSelector
										bulbro={
											firstBulbro
										}
										selections={
											firstLoadout.selections
										}
										onChange={
											firstLoadout.selectWeapon
										}
									/>
								</div>
							</div>
							<div className="character">
								<BulbroSelector
									selectedBulbro={
										secondBulbro
									}
									onChange={(
										bulbro,
									) =>
										changeSecondBulbro(
											bulbro,
										)
									}
								/>
								<div className="mt-4">
									<StartingWeaponSelector
										bulbro={
											secondBulbro
										}
										selections={
											secondLoadout.selections
										}
										onChange={
											secondLoadout.selectWeapon
										}
									/>
								</div>
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
					</form>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						form="local-coop-setup"
						disabled={
							!(
								firstLoadout.isValid &&
								secondLoadout.isValid
							)
						}
						className="w-full"
					>
						{t(
							"setup.coop.start",
						)}
					</Button>
				</CardFooter>
			</Card>
		</CentralCard>
	);
}

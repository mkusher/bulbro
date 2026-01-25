import {
	useEffect,
	useState,
} from "preact/hooks";
import { v4 } from "uuid";
import type { Bulbro } from "@/bulbro";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	createMainControls,
	SecondaryKeyboardControl,
} from "@/controls";
import { startLocalGame } from "@/currentGameProcess";
import type { Difficulty } from "@/game-formulas";
import { createPlayer } from "@/player";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { DifficultySelector } from "@/ui/DifficultySelector";
import { CentralCard } from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";

import { WeaponSelector } from "@/ui/WeaponSelector";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";
import {
	audioEngine,
	bgmEnabled,
} from "@/audio";
import { useStartBgm } from "@/audio/useStartBgm";

export function SetupLocalCoOp() {
	const [
		firstBulbro,
		changeFirstBulbro,
	] =
		useState<Bulbro>(
			wellRoundedBulbro,
		);
	const [
		secondBulbro,
		changeSecondBulbro,
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
		firstPlayerWeapon,
		setFirstPlayerWeapon,
	] =
		useState<Weapon | null>(
			smg,
		);
	const [
		secondPlayerWeapon,
		setSecondPlayerWeapon,
	] =
		useState<Weapon | null>(
			smg,
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
			startLocalGame(
				[
					createPlayer(
						v4(),
						firstBulbro,
						firstPlayerWeapon
							? [
									firstPlayerWeapon,
								]
							: [],
					),
					createPlayer(
						v4(),
						secondBulbro,
						secondPlayerWeapon
							? [
									secondPlayerWeapon,
								]
							: [],
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
						Start
						new
						co-op
						session
					</h2>
				</CardHeader>
				<CardContent className="grid gap-6">
					<form
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
									<WeaponSelector
										selectedWeapon={
											firstPlayerWeapon
										}
										availableWeapons={
											firstBulbro.availableWeapons
										}
										onChange={
											setFirstPlayerWeapon
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
									<WeaponSelector
										selectedWeapon={
											secondPlayerWeapon
										}
										availableWeapons={
											secondBulbro.availableWeapons
										}
										onChange={
											setSecondPlayerWeapon
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
						className="w-full"
					>
						Start
					</Button>
				</CardFooter>
			</Card>
		</CentralCard>
	);
}

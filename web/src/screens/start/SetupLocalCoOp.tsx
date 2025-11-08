import { Label } from "@radix-ui/react-label";
import { useState } from "preact/hooks";
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
import { Input } from "@/ui/shadcn/input";
import { WeaponSelector } from "@/ui/WeaponSelector";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";

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
	const [
		selectedDuration,
		setDuration,
	] =
		useState<number>(
			60,
		);
	const router =
		useRouter();
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
				selectedDuration,
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
						<div id="duration">
							<Label>
								Wave
								duration:
							</Label>
							<Input
								type="number"
								value={
									selectedDuration
								}
								onChange={(
									e,
								) => {
									setDuration(
										Number(
											e
												.currentTarget
												.value,
										),
									);
								}}
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

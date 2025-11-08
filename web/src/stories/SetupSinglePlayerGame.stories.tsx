import { useState } from "preact/hooks";
import {
	bulbros,
	wellRoundedBulbro,
} from "@/characters-definitions";
import type { CharacterSetup } from "@/GameProcess";
import type { Difficulty } from "@/game-formulas";
import { BulbroSelector } from "@/ui/BulbroSelector";
import { DifficultySelector } from "@/ui/DifficultySelector";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import type { Weapon } from "@/weapon";
import {
	ak47,
	doubleBarrelShotgun,
	fist,
	laserGun,
	pistol,
	smg,
} from "@/weapons-definitions";
import { SetupSinglePlayer } from "../screens/start/SetupSinglePlayer";

export default {
	title:
		"Screens/Setup Single Player Game",
	component:
		SetupSinglePlayer,
};

// Full setup screen as it appears in the game
export const FullSetupScreen =
	{
		render:
			() => (
				<SetupSinglePlayer />
			),
	};

// Interactive setup screen for Storybook testing
export const InteractiveSetup =
	{
		render:
			(
				args: any,
			) => {
				const [
					character,
					setCharacter,
				] =
					useState<CharacterSetup>(
						{
							bulbro:
								bulbros.find(
									(
										b,
									) =>
										b.id ===
										args.bulbroId,
								) ||
								wellRoundedBulbro,
							sprite:
								(
									bulbros.find(
										(
											b,
										) =>
											b.id ===
											args.bulbroId,
									) ||
									wellRoundedBulbro
								)
									.style
									.faceType,
						},
					);
				const [
					difficulty,
					setDifficulty,
				] =
					useState<Difficulty>(
						args.difficulty,
					);
				const [
					weapons,
					setWeapons,
				] =
					useState<
						Weapon[]
					>(
						args.weapons,
					);
				const [
					duration,
					setDuration,
				] =
					useState<number>(
						args.duration,
					);

				const onSubmit =
					(
						e: SubmitEvent,
					) => {
						e.preventDefault();
						console.log(
							"Starting game with:",
							{
								character,
								difficulty,
								weapons,
								duration,
							},
						);
					};

				return (
					<div
						style={{
							padding:
								"20px",
							maxWidth:
								"800px",
							margin:
								"0 auto",
						}}
					>
						<form
							onSubmit={
								onSubmit
							}
						>
							<Card className="flex flex-col gap-6">
								<CardHeader>
									<h1 className="text-3xl">
										Start
										single
										player
										run
									</h1>
								</CardHeader>
								<CardContent className="flex flex-col gap-6">
									<BulbroSelector
										selectedBulbro={
											character.bulbro
										}
										onChange={(
											bulbro,
										) =>
											setCharacter(
												{
													bulbro,
													sprite:
														bulbro
															.style
															.faceType,
												},
											)
										}
									/>
									<div
										id="difficulty-select"
										className="gap-3"
									>
										<DifficultySelector
											selectDifficulty={
												setDifficulty
											}
											selectedDifficulty={
												difficulty
											}
										/>
									</div>
									<div
										id="duration"
										className="gap-3"
									>
										<Label htmlFor="wave-duration">
											Wave
											duration:
										</Label>
										<Input
											type="number"
											name="wave-duration"
											value={
												duration
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
								</CardContent>
								<CardFooter className="flex gap-6">
									<Button
										type="submit"
										className="w-full"
									>
										Start
										Game
									</Button>
								</CardFooter>
							</Card>
						</form>
					</div>
				);
			},
		args: {
			bulbroId:
				wellRoundedBulbro.id,
			difficulty: 1,
			weapons:
				[
					pistol,
					fist,
				],
			duration: 60,
		},
		argTypes:
			{
				bulbroId:
					{
						options:
							bulbros.map(
								(
									b,
								) =>
									b.id,
							),
						control:
							{
								type: "select",
							},
					},
				difficulty:
					{
						options:
							[
								0,
								1,
								2,
								3,
								4,
							],
						control:
							{
								type: "range",
								min: 0,
								max: 4,
								step: 1,
							},
					},
				weapons:
					{
						options:
							[
								[
									pistol,
									fist,
								],
								[
									smg,
									fist,
								],
								[
									doubleBarrelShotgun,
									fist,
								],
								[
									ak47,
									fist,
								],
								[
									laserGun,
									fist,
								],
								[
									pistol,
									smg,
								],
								[
									ak47,
									doubleBarrelShotgun,
									fist,
								],
							],
						control:
							{
								type: "select",
							},
					},
				duration:
					{
						control:
							{
								type: "range",
								min: 30,
								max: 300,
								step: 10,
							},
					},
			},
	};

// Character selection showcase
export const CharacterSelection =
	{
		render:
			(
				args: any,
			) => {
				const [
					character,
					setCharacter,
				] =
					useState<CharacterSetup>(
						{
							bulbro:
								bulbros.find(
									(
										b,
									) =>
										b.id ===
										args.bulbroId,
								) ||
								wellRoundedBulbro,
							sprite:
								(
									bulbros.find(
										(
											b,
										) =>
											b.id ===
											args.bulbroId,
									) ||
									wellRoundedBulbro
								)
									.style
									.faceType,
						},
					);
				const [
					weapons,
					setWeapons,
				] =
					useState<
						Weapon[]
					>(
						[
							pistol,
							fist,
						],
					);

				return (
					<div
						style={{
							padding:
								"20px",
							display:
								"flex",
							gap: "20px",
							flexWrap:
								"wrap",
						}}
					>
						<div
							style={{
								flex: 1,
								minWidth:
									"400px",
							}}
						>
							<h2>
								Character
								Configuration
							</h2>
							<BulbroSelector
								selectedBulbro={
									character.bulbro
								}
								onChange={(
									bulbro,
								) =>
									setCharacter(
										{
											bulbro,
											sprite:
												bulbro
													.style
													.faceType,
										},
									)
								}
							/>
						</div>
						<div
							style={{
								flex: 1,
								minWidth:
									"300px",
							}}
						>
							<h2>
								Character
								Preview
							</h2>
							<BulbroSelectorView
								selectedBulbro={
									character.bulbro
								}
								selectedBulbroStyle={
									character
										.bulbro
										.style
										.faceType
								}
								selectedWeapons={
									weapons
								}
							/>
						</div>
					</div>
				);
			},
		args: {
			bulbroId:
				wellRoundedBulbro.id,
		},
		argTypes:
			{
				bulbroId:
					{
						options:
							bulbros.map(
								(
									b,
								) =>
									b.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};

// Game settings showcase
export const GameSettings =
	{
		render:
			(
				args: any,
			) => {
				const [
					difficulty,
					setDifficulty,
				] =
					useState<Difficulty>(
						args.difficulty,
					);
				const [
					duration,
					setDuration,
				] =
					useState<number>(
						args.duration,
					);

				return (
					<div
						style={{
							padding:
								"20px",
							maxWidth:
								"600px",
						}}
					>
						<Card>
							<CardHeader>
								<h2>
									Game
									Settings
								</h2>
							</CardHeader>
							<CardContent className="flex flex-col gap-6">
								<div>
									<h3>
										Difficulty
										Level
									</h3>
									<DifficultySelector
										selectDifficulty={
											setDifficulty
										}
										selectedDifficulty={
											difficulty
										}
									/>
								</div>
								<div>
									<Label htmlFor="wave-duration">
										Wave
										duration
										(seconds):
									</Label>
									<Input
										type="number"
										name="wave-duration"
										value={
											duration
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
										min={
											30
										}
										max={
											300
										}
									/>
								</div>
								<div
									style={{
										padding:
											"10px",
										background:
											"#f5f5f5",
										borderRadius:
											"4px",
										fontSize:
											"14px",
									}}
								>
									<p>
										<strong>
											Current
											Settings:
										</strong>
									</p>
									<p>
										Difficulty:{" "}
										{
											difficulty
										}{" "}
										/
										4
									</p>
									<p>
										Wave
										Duration:{" "}
										{
											duration
										}{" "}
										seconds
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				);
			},
		args: {
			difficulty: 1,
			duration: 60,
		},
		argTypes:
			{
				difficulty:
					{
						options:
							[
								0,
								1,
								2,
								3,
								4,
							],
						control:
							{
								type: "range",
								min: 0,
								max: 4,
								step: 1,
							},
					},
				duration:
					{
						control:
							{
								type: "range",
								min: 30,
								max: 300,
								step: 10,
							},
					},
			},
	};

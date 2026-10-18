import {
	bulbros,
	findBulbroById,
} from "../characters-definitions";
import {
	deltaTime,
	nowTime,
} from "../time";
import type { WeaponType } from "../weapon";
import { weapons } from "../weapons-definitions";
import { StorybookGameScene } from "./StorybookGameScene";
import { createBulbroState } from "./storyHelpers";

export default {
	title:
		"Game Scenes/Bulbros",
	component:
		StorybookGameScene,
};

const createState =
	(
		bulbroType: string,
		selectedWeapons: WeaponType[] = [],
	) => {
		const bulbro =
			findBulbroById(
				bulbroType,
			);
		const bulbroWithWeapons =
			selectedWeapons.length >
			0
				? {
						...bulbro,
						weapons:
							selectedWeapons.map(
								(
									weaponType,
								) =>
									weapons.find(
										(
											w,
										) =>
											w.id ===
											weaponType,
									) ||
									weapons[0],
							),
					}
				: bulbro;

		return createBulbroState(
			bulbroType,
			{
				x: 400,
				y: 400,
			},
			bulbroWithWeapons,
		);
	};

const idleArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
	};

export const Idle =
	{
		render:
			(
				args: typeof idleArgs,
			) => (
				<StorybookGameScene
					initialState={createState(
						args.bulbroType,
					)}
					{...args}
				/>
			),
		args: idleArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

const walkingInCircleArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
	};

export const WalkingInCircle =
	{
		render:
			(
				args: typeof walkingInCircleArgs,
			) => {
				const initialState =
					createState(
						args.bulbroType,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						onStateUpdate={(
							newState,
						) => {
							// Create walking movement by updating position
							const now =
								Date.now();
							const elapsed =
								(now %
									3000) /
								3000; // 3 second cycle
							const x =
								1000 +
								Math.sin(
									elapsed *
										Math.PI *
										2,
								) *
									100;
							const y =
								750 +
								Math.cos(
									elapsed *
										Math.PI *
										2,
								) *
									50;
							const player =
								newState
									.players[0];
							if (
								player
							) {
								const event =
									player.moveFromDirection(
										{
											x,
											y,
										},
										{
											x: Math.sin(
												elapsed *
													Math.PI *
													2,
											),
											y: Math.cos(
												elapsed *
													Math.PI *
													2,
											),
										},
										nowTime(
											now,
										),
									);
								const updatedPlayer =
									player.applyEvent(
										{
											...event,
											deltaTime:
												deltaTime(
													0,
												),
											occurredAt:
												nowTime(
													now,
												),
										},
									);
								newState.players =
									[
										updatedPlayer,
									];
							}
						}}
						{...args}
					/>
				);
			},
		args: walkingInCircleArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

const walkingAtTheSamePointArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
	};

export const WalkingAtTheSamePoint =
	{
		render:
			(
				args: typeof walkingAtTheSamePointArgs,
			) => {
				const initialState =
					createState(
						args.bulbroType,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						onStateUpdate={(
							newState,
						) => {
							// Create walking movement by updating position
							const now =
								Date.now();
							const elapsed =
								(now %
									3000) /
								3000; // 3 second cycle
							const x =
								1000 +
								Math.sin(
									elapsed *
										Math.PI *
										2,
								) *
									10;
							const y =
								750 +
								Math.cos(
									elapsed *
										Math.PI *
										2,
								) *
									5;
							const player =
								newState
									.players[0];
							if (
								player
							) {
								const event =
									player.moveFromDirection(
										{
											x,
											y,
										},
										{
											x: Math.sin(
												elapsed *
													Math.PI *
													2,
											),
											y: Math.cos(
												elapsed *
													Math.PI *
													2,
											),
										},
										nowTime(
											now,
										),
									);
								const updatedPlayer =
									player.applyEvent(
										{
											...event,
											deltaTime:
												deltaTime(
													0,
												),
											occurredAt:
												nowTime(
													now,
												),
										},
									);
								newState.players =
									[
										updatedPlayer,
									];
							}
						}}
						{...args}
					/>
				);
			},
		args: walkingAtTheSamePointArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

// Weapon selection scenes
const withWeaponSelectionArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
		selectedWeapons:
			[
				"pistol",
				"knife",
			],
	};

export const WithWeaponSelection =
	{
		render:
			(
				args: typeof withWeaponSelectionArgs,
			) => {
				const selectedWeapons =
					args.selectedWeapons as WeaponType[];
				const initialState =
					createState(
						args.bulbroType,
						selectedWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						{...args}
					/>
				);
			},
		args: withWeaponSelectionArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
				selectedWeapons:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "multi-select",
							},
					},
			},
	};

const heavyWeaponsShowcaseArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
	};

export const HeavyWeaponsShowcase =
	{
		render:
			(
				args: typeof heavyWeaponsShowcaseArgs,
			) => {
				const heavyWeapons: WeaponType[] =
					[
						"ak47",
						"doubleBarrelShotgun",
						"laserGun",
					];
				const initialState =
					createState(
						args.bulbroType,
						heavyWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						onStateUpdate={(
							newState,
						) => {
							// Slowly rotate the bulbro to show off all weapons
							const now =
								Date.now();
							const elapsed =
								(now %
									5000) /
								5000; // 5 second rotation cycle
							const angle =
								elapsed *
								Math.PI *
								2;
							const radius = 30;
							const x =
								1000 +
								Math.sin(
									angle,
								) *
									radius;
							const y =
								750 +
								Math.cos(
									angle,
								) *
									radius;
							const player =
								newState
									.players[0];
							if (
								player
							) {
								const direction =
									{
										x: Math.sin(
											angle,
										),
										y: Math.cos(
											angle,
										),
									};
								const event =
									player.moveFromDirection(
										{
											x,
											y,
										},
										direction,
										nowTime(
											now,
										),
									);
								const updatedPlayer =
									player.applyEvent(
										{
											...event,
											deltaTime:
												deltaTime(
													0,
												),
											occurredAt:
												nowTime(
													now,
												),
										},
									);
								newState.players =
									[
										updatedPlayer,
									];
							}
						}}
						{...args}
					/>
				);
			},
		args: heavyWeaponsShowcaseArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

const meleeWeaponsShowcaseArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
	};

export const MeleeWeaponsShowcase =
	{
		render:
			(
				args: typeof meleeWeaponsShowcaseArgs,
			) => {
				const meleeWeapons: WeaponType[] =
					[
						"fist",
						"knife",
						"sword",
					];
				const initialState =
					createState(
						args.bulbroType,
						meleeWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						onStateUpdate={(
							newState,
						) => {
							// Make the bulbro "attack" by moving in quick bursts
							const now =
								Date.now();
							const elapsed =
								(now %
									2000) /
								2000; // 2 second attack cycle
							const isAttacking =
								elapsed <
								0.3; // Attack for 30% of cycle

							if (
								isAttacking
							) {
								const attackAngle =
									Math.floor(
										elapsed *
											10,
									) *
									Math.PI *
									0.5; // Quick directional changes
								const x =
									1000 +
									Math.sin(
										attackAngle,
									) *
										20;
								const y =
									750 +
									Math.cos(
										attackAngle,
									) *
										20;
								const player =
									newState
										.players[0];
								if (
									player
								) {
									const direction =
										{
											x: Math.sin(
												attackAngle,
											),
											y: Math.cos(
												attackAngle,
											),
										};
									const event =
										player.moveFromDirection(
											{
												x,
												y,
											},
											direction,
											nowTime(
												now,
											),
										);
									const updatedPlayer =
										player.applyEvent(
											{
												...event,
												deltaTime:
													deltaTime(
														0,
													),
												occurredAt:
													nowTime(
														now,
													),
											},
										);
									newState.players =
										[
											updatedPlayer,
										];
								}
							}
						}}
						{...args}
					/>
				);
			},
		args: meleeWeaponsShowcaseArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

const allWeaponsShowcaseArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
	};

export const AllWeaponsShowcase =
	{
		render:
			(
				args: typeof allWeaponsShowcaseArgs,
			) => {
				// Show all available weapons (limited to 6 since that's max for bulbro)
				const allWeapons: WeaponType[] =
					weapons
						.slice(
							0,
							6,
						)
						.map(
							(
								w,
							) =>
								w.id,
						);
				const initialState =
					createState(
						args.bulbroType,
						allWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						onStateUpdate={(
							newState,
						) => {
							// Gentle figure-8 movement to showcase all weapons
							const now =
								Date.now();
							const elapsed =
								(now %
									8000) /
								8000; // 8 second cycle
							const t =
								elapsed *
								Math.PI *
								2;
							const x =
								1000 +
								Math.sin(
									t,
								) *
									60;
							const y =
								750 +
								Math.sin(
									t *
										2,
								) *
									40;
							const player =
								newState
									.players[0];
							if (
								player
							) {
								const direction =
									{
										x:
											Math.cos(
												t,
											) *
											Math.cos(
												t *
													2,
											),
										y:
											Math.sin(
												t *
													2,
											) *
											2,
									};
								const event =
									player.moveFromDirection(
										{
											x,
											y,
										},
										direction,
										nowTime(
											now,
										),
									);
								const updatedPlayer =
									player.applyEvent(
										{
											...event,
											deltaTime:
												deltaTime(
													0,
												),
											occurredAt:
												nowTime(
													now,
												),
										},
									);
								newState.players =
									[
										updatedPlayer,
									];
							}
						}}
						{...args}
					/>
				);
			},
		args: allWeaponsShowcaseArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

// Single weapon selection
const withSingleWeaponArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
		weapon:
			"pistol" as WeaponType,
	};

export const WithSingleWeapon =
	{
		render:
			(
				args: typeof withSingleWeaponArgs,
			) => {
				const selectedWeapons: WeaponType[] =
					args.weapon
						? [
								args.weapon,
							]
						: [];
				const initialState =
					createState(
						args.bulbroType,
						selectedWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						{...args}
					/>
				);
			},
		args: withSingleWeaponArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
				weapon:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};

// Two weapons selection
const withTwoWeaponsArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
		weapon1:
			"pistol" as WeaponType,
		weapon2:
			"knife" as WeaponType,
	};

export const WithTwoWeapons =
	{
		render:
			(
				args: typeof withTwoWeaponsArgs,
			) => {
				const selectedWeapons: WeaponType[] =
					[
						args.weapon1,
						args.weapon2,
					].filter(
						Boolean,
					);
				const initialState =
					createState(
						args.bulbroType,
						selectedWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						{...args}
					/>
				);
			},
		args: withTwoWeaponsArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
				weapon1:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
				weapon2:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};

// Three weapons selection
const withThreeWeaponsArgs =
	{
		bulbroType:
			"well-rounded",
		debug: false,
		weapon1:
			"pistol" as WeaponType,
		weapon2:
			"knife" as WeaponType,
		weapon3:
			"sword" as WeaponType,
	};

export const WithThreeWeapons =
	{
		render:
			(
				args: typeof withThreeWeaponsArgs,
			) => {
				const selectedWeapons: WeaponType[] =
					[
						args.weapon1,
						args.weapon2,
						args.weapon3,
					].filter(
						Boolean,
					);
				const initialState =
					createState(
						args.bulbroType,
						selectedWeapons,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						{...args}
					/>
				);
			},
		args: withThreeWeaponsArgs,
		argTypes:
			{
				bulbroType:
					{
						options:
							bulbros.map(
								(
									bulbro,
								) =>
									bulbro.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
				weapon1:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
				weapon2:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
				weapon3:
					{
						options:
							weapons.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};

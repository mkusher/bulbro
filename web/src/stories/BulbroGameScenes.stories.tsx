import {
	bulbros,
	findBulbroById,
} from "../characters-definitions";
import type { WeaponType } from "../weapon";
import { weapons } from "../weapons-definitions";
import {
	nowTime,
	deltaTime,
} from "../time";
import { StorybookGameScene } from "./StorybookGameScene";
import {
	createBulbroState,
	createGameState,
} from "./storyHelpers";

export default {
	title:
		"Bulbros/Game Scenes",
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

export const Idle =
	{
		render:
			(
				args: any,
			) => (
				<StorybookGameScene
					initialState={createState(
						args.bulbroType,
					)}
					debug={
						args.debug
					}
					{...args}
				/>
			),
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
		},
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

export const WalkingInCircle =
	{
		render:
			(
				args: any,
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
						debug={
							args.debug
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
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
		},
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

export const WalkingAtTheSamePoint =
	{
		render:
			(
				args: any,
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
						debug={
							args.debug
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
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
		},
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
export const WithWeaponSelection =
	{
		render:
			(
				args: any,
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
						debug={
							args.debug
						}
						{...args}
					/>
				);
			},
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
			selectedWeapons:
				[
					"pistol",
					"knife",
				],
		},
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

export const HeavyWeaponsShowcase =
	{
		render:
			(
				args: any,
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
						debug={
							args.debug
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
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
		},
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

export const MeleeWeaponsShowcase =
	{
		render:
			(
				args: any,
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
						debug={
							args.debug
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
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
		},
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

export const AllWeaponsShowcase =
	{
		render:
			(
				args: any,
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
						debug={
							args.debug
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
		args: {
			bulbroType:
				"well-rounded",
			debug: false,
		},
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

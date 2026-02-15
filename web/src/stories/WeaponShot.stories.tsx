import { spawnBulbro } from "../bulbro/BulbroState";
import { wellRoundedBulbro } from "../characters-definitions/well-rounded";
import { babyEnemy } from "../enemies-definitions/baby";
import { spawnEnemy } from "../enemy";
import type { WaveState } from "../waveState";
import type { WeaponType } from "../weapon";
import { weapons } from "../weapons-definitions";
import { StorybookGameScene } from "./StorybookGameScene";
import { createGameState } from "./storyHelpers";

interface WeaponShotStoryProps {
	weapon: WeaponType;
	aimAngle: number;
	enemyDistance: number;
	debug: boolean;
	enableKeyboard: boolean;
	showPlayerStats: boolean;
	showGameStats: boolean;
	showCoordinateGrid: boolean;
}

const PLAYER_POSITION =
	{
		x: 1000,
		y: 750,
	};

function createWeaponShotState(
	weapon: WeaponType,
	aimAngle: number,
	enemyDistance: number,
): WaveState {
	const weaponDef =
		weapons.find(
			(
				w,
			) =>
				w.id ===
				weapon,
		) ??
		weapons[0]!;

	const bulbro =
		spawnBulbro(
			"player-1",
			"normal",
			PLAYER_POSITION,
			0,
			0,
			{
				...wellRoundedBulbro,
				weapons:
					[
						weaponDef,
					],
			},
		);

	// Place enemy in the aiming direction so the weapon fires at it
	const angleRad =
		(aimAngle *
			Math.PI) /
		180;
	const enemyPosition =
		{
			x:
				PLAYER_POSITION.x +
				Math.cos(
					angleRad,
				) *
					enemyDistance,
			y:
				PLAYER_POSITION.y +
				Math.sin(
					angleRad,
				) *
					enemyDistance,
		};

	const enemy =
		spawnEnemy(
			"enemy-1",
			enemyPosition,
			babyEnemy,
		);

	return createGameState(
		{
			players:
				[
					bulbro,
				],
			enemies:
				[
					enemy,
				],
		},
	);
}

export default {
	title:
		"Weapons/Weapon Shot",
	component:
		StorybookGameScene,
};

export const SingleWeapon =
	{
		render:
			({
				weapon,
				aimAngle,
				enemyDistance,
				debug,
				...args
			}: WeaponShotStoryProps) => {
				const initialState =
					createWeaponShotState(
						weapon,
						aimAngle,
						enemyDistance,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						debug={
							debug
						}
						enableKeyboard={
							args.enableKeyboard
						}
						showPlayerStats={
							args.showPlayerStats
						}
						showGameStats={
							args.showGameStats
						}
						showCoordinateGrid={
							args.showCoordinateGrid
						}
					/>
				);
			},
		args: {
			weapon:
				"pistol" as WeaponType,
			aimAngle: 0,
			enemyDistance: 150,
			debug: false,
			enableKeyboard: true,
			showPlayerStats: false,
			showGameStats: true,
			showCoordinateGrid: false,
		},
		argTypes:
			{
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
						description:
							"Weapon type to equip",
					},
				aimAngle:
					{
						control:
							{
								type: "range",
								min:
									-180,
								max: 180,
								step: 5,
							},
						description:
							"Aiming direction in degrees (0 = right, 90 = down, -90 = up)",
					},
				enemyDistance:
					{
						control:
							{
								type: "range",
								min: 50,
								max: 500,
								step: 10,
							},
						description:
							"Distance to the target enemy (px)",
					},
				debug:
					{
						control:
							"boolean",
					},
				enableKeyboard:
					{
						control:
							"boolean",
					},
				showPlayerStats:
					{
						control:
							"boolean",
					},
				showGameStats:
					{
						control:
							"boolean",
					},
				showCoordinateGrid:
					{
						control:
							"boolean",
					},
			},
	};

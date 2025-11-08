import { WeaponSlots } from "@/shop/WeaponSlots";
import type { Weapon } from "@/weapon";
import {
	ak47,
	doubleBarrelShotgun,
	fist,
	laserGun,
	pistol,
	smg,
	sword,
} from "@/weapons-definitions";

export default {
	title:
		"Shop/WeaponSlots",
	component:
		WeaponSlots,
};

// Default with 3 weapons
export const ThreeWeapons =
	{
		render:
			(
				args: any,
			) => (
				<WeaponSlots
					{...args}
				/>
			),
		args: {
			weapons:
				[
					pistol,
					sword,
					fist,
				],
			maxSlots: 6,
			onWeaponClick:
				(
					weapon: Weapon,
					index: number,
				) => {
					console.log(
						"Clicked weapon:",
						weapon.name,
						"at slot",
						index,
					);
				},
		},
	};

// Empty slots
export const EmptySlots =
	{
		render:
			(
				args: any,
			) => (
				<WeaponSlots
					{...args}
				/>
			),
		args: {
			weapons:
				[],
			maxSlots: 6,
			onWeaponClick:
				(
					weapon: Weapon,
					index: number,
				) => {
					console.log(
						"Clicked weapon:",
						weapon.name,
						"at slot",
						index,
					);
				},
		},
	};

// Full slots
export const FullSlots =
	{
		render:
			(
				args: any,
			) => (
				<WeaponSlots
					{...args}
				/>
			),
		args: {
			weapons:
				[
					pistol,
					sword,
					fist,
					smg,
					ak47,
					doubleBarrelShotgun,
				],
			maxSlots: 6,
			onWeaponClick:
				(
					weapon: Weapon,
					index: number,
				) => {
					console.log(
						"Clicked weapon:",
						weapon.name,
						"at slot",
						index,
					);
				},
		},
	};

// One weapon only
export const OneWeapon =
	{
		render:
			(
				args: any,
			) => (
				<WeaponSlots
					{...args}
				/>
			),
		args: {
			weapons:
				[
					laserGun,
				],
			maxSlots: 6,
			onWeaponClick:
				(
					weapon: Weapon,
					index: number,
				) => {
					console.log(
						"Clicked weapon:",
						weapon.name,
						"at slot",
						index,
					);
				},
		},
	};

// Almost full (5 weapons)
export const AlmostFull =
	{
		render:
			(
				args: any,
			) => (
				<WeaponSlots
					{...args}
				/>
			),
		args: {
			weapons:
				[
					pistol,
					sword,
					fist,
					smg,
					ak47,
				],
			maxSlots: 6,
			onWeaponClick:
				(
					weapon: Weapon,
					index: number,
				) => {
					console.log(
						"Clicked weapon:",
						weapon.name,
						"at slot",
						index,
					);
				},
		},
	};

// Custom max slots (4 slots)
export const FourSlots =
	{
		render:
			(
				args: any,
			) => (
				<WeaponSlots
					{...args}
				/>
			),
		args: {
			weapons:
				[
					pistol,
					sword,
				],
			maxSlots: 4,
			onWeaponClick:
				(
					weapon: Weapon,
					index: number,
				) => {
					console.log(
						"Clicked weapon:",
						weapon.name,
						"at slot",
						index,
					);
				},
		},
	};

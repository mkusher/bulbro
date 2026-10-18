import type { ComponentProps } from "preact";
import { WeaponSlots } from "@/shop/WeaponSlots";
import {
	type OwnedWeapon,
	toOwnedWeapons,
	weaponAtTier,
} from "@/weapon/WeaponTiers";
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

const render =
	(
		args: ComponentProps<
			typeof WeaponSlots
		>,
	) => (
		<WeaponSlots
			{...args}
		/>
	);

const actions =
	{
		sellPrice:
			(
				weapon: OwnedWeapon,
			) =>
				weapon
					.weapon
					.basePrice *
				weapon.tier,
		onSell:
			(
				weapon: OwnedWeapon,
			) => {
				console.log(
					"Sell weapon:",
					weapon
						.weapon
						.name,
					weapon.id,
				);
			},
		onCombine:
			(
				weapon: OwnedWeapon,
				other: OwnedWeapon,
			) => {
				console.log(
					"Combine weapons:",
					weapon.id,
					other.id,
				);
			},
	};

// Default with 3 weapons
export const ThreeWeapons =
	{
		render,
		args: {
			weapons:
				toOwnedWeapons(
					[
						pistol,
						sword,
						fist,
					],
				),
			maxSlots: 6,
			...actions,
		},
	};

// Empty slots
export const EmptySlots =
	{
		render,
		args: {
			weapons:
				[],
			maxSlots: 6,
			...actions,
		},
	};

// Full slots
export const FullSlots =
	{
		render,
		args: {
			weapons:
				toOwnedWeapons(
					[
						pistol,
						sword,
						fist,
						smg,
						ak47,
						doubleBarrelShotgun,
					],
				),
			maxSlots: 6,
			...actions,
		},
	};

// One weapon only: it cannot be sold
export const OneWeapon =
	{
		render,
		args: {
			weapons:
				toOwnedWeapons(
					[
						laserGun,
					],
				),
			maxSlots: 6,
			...actions,
		},
	};

// Two tier I pistols can be combined into tier II
export const CombinablePair =
	{
		render,
		args: {
			weapons:
				toOwnedWeapons(
					[
						pistol,
						pistol,
						sword,
					],
				),
			maxSlots: 6,
			...actions,
		},
	};

// Weapons of every tier
export const Tiers =
	{
		render,
		args: {
			weapons:
				(
					[
						1,
						2,
						3,
						4,
					] as const
				).map(
					(
						tier,
					): OwnedWeapon => ({
						id: `smg-${tier}`,
						tier,
						weapon:
							weaponAtTier(
								smg,
								tier,
							),
					}),
				),
			maxSlots: 6,
			...actions,
		},
	};

// Custom max slots (4 slots)
export const FourSlots =
	{
		render,
		args: {
			weapons:
				toOwnedWeapons(
					[
						pistol,
						sword,
					],
				),
			maxSlots: 4,
			...actions,
		},
	};

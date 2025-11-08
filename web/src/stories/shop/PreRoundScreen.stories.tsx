import { useState } from "preact/hooks";
import { BulbroCard } from "@/bulbro/BulbroCard";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	PrevWaveStats,
	type WaveStats,
} from "@/shop/PrevWaveStats";
import {
	Shop,
	type ShopItem,
} from "@/shop/Shop";
import { WeaponSlots } from "@/shop/WeaponSlots";
import { Button } from "@/ui/shadcn/button";
import type { Weapon } from "@/weapon";
import {
	ak47,
	doubleBarrelShotgun,
	fist,
	knife,
	laserGun,
	pistol,
	smg,
	sword,
} from "@/weapons-definitions";

export default {
	title:
		"Shop/PreRoundScreen",
};

// Complete pre-round screen with all components
export const CompletePreRoundScreen =
	{
		render:
			() => {
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
				const [
					materials,
					setMaterials,
				] =
					useState(
						250,
					);
				const [
					shopItems,
				] =
					useState<
						ShopItem[]
					>(
						[
							{
								weapon:
									smg,
								price: 100,
							},
							{
								weapon:
									sword,
								price: 75,
							},
							{
								weapon:
									doubleBarrelShotgun,
								price: 150,
							},
							{
								weapon:
									ak47,
								price: 200,
							},
						],
					);
				const [
					stats,
				] =
					useState<WaveStats>(
						{
							wave: 1,
							enemiesKilled: 45,
							damageDealt: 12450,
							damageTaken: 320,
							materialsCollected: 250,
							survivalTime: 60,
							accuracy: 68.5,
						},
					);

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						if (
							materials >=
								item.price &&
							weapons.length <
								6
						) {
							setMaterials(
								materials -
									item.price,
							);
							setWeapons(
								[
									...weapons,
									item.weapon,
								],
							);
						}
					};

				const handleWeaponClick =
					(
						weapon: Weapon,
						index: number,
					) => {
						console.log(
							"Weapon clicked:",
							weapon.name,
							"at index",
							index,
						);
					};

				return (
					<div className="p-4 max-w-6xl mx-auto">
						<div className="flex flex-col gap-3">
							{/* Header */}
							<div className="text-center">
								<h1 className="text-2xl font-bold mb-1">
									Prepare
									for
									Wave{" "}
									{stats.wave +
										1}
								</h1>
								<p className="text-sm text-muted-foreground">
									Materials:{" "}
									{
										materials
									}
								</p>
							</div>

							{/* Previous Wave Stats */}
							<PrevWaveStats
								stats={
									stats
								}
							/>

							{/* Two column layout for Bulbro and Weapon Slots */}
							<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
								{/* Bulbro Description */}
								<div className="overflow-visible">
									<BulbroCard
										bulbro={
											wellRoundedBulbro
										}
										showDetails={
											true
										}
										displayWidth={
											80
										}
										displayHeight={
											80
										}
										responsive={
											false
										}
									/>
								</div>

								{/* Weapon Slots */}
								<div>
									<WeaponSlots
										weapons={
											weapons
										}
										maxSlots={
											6
										}
										onWeaponClick={
											handleWeaponClick
										}
									/>
								</div>
							</div>

							{/* Shop */}
							<Shop
								items={
									shopItems
								}
								availableMaterials={
									materials
								}
								onPurchase={
									handlePurchase
								}
							/>

							{/* Start Wave Button */}
							<div className="flex justify-center">
								<Button
									className="w-full max-w-md"
									onClick={() =>
										console.log(
											"Starting wave...",
										)
									}
								>
									Start
									Wave{" "}
									{stats.wave +
										1}
								</Button>
							</div>
						</div>
					</div>
				);
			},
	};

// Early game scenario (wave 1)
export const EarlyGame =
	{
		render:
			() => {
				const [
					weapons,
					setWeapons,
				] =
					useState<
						Weapon[]
					>(
						[
							pistol,
						],
					);
				const [
					materials,
					setMaterials,
				] =
					useState(
						50,
					);
				const [
					shopItems,
				] =
					useState<
						ShopItem[]
					>(
						[
							{
								weapon:
									knife,
								price: 25,
							},
							{
								weapon:
									fist,
								price: 10,
							},
							{
								weapon:
									sword,
								price: 75,
							},
							{
								weapon:
									smg,
								price: 100,
							},
						],
					);
				const [
					stats,
				] =
					useState<WaveStats>(
						{
							wave: 1,
							enemiesKilled: 20,
							damageDealt: 5000,
							damageTaken: 150,
							materialsCollected: 50,
							survivalTime: 60,
							accuracy: 55.0,
						},
					);

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						if (
							materials >=
								item.price &&
							weapons.length <
								6
						) {
							setMaterials(
								materials -
									item.price,
							);
							setWeapons(
								[
									...weapons,
									item.weapon,
								],
							);
						}
					};

				return (
					<div className="p-4 max-w-6xl mx-auto">
						<div className="flex flex-col gap-3">
							<div className="text-center">
								<h1 className="text-2xl font-bold mb-1">
									Prepare
									for
									Wave{" "}
									{stats.wave +
										1}
								</h1>
								<p className="text-sm text-muted-foreground">
									Materials:{" "}
									{
										materials
									}
								</p>
							</div>
							<PrevWaveStats
								stats={
									stats
								}
							/>
							<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
								<div className="overflow-visible">
									<BulbroCard
										bulbro={
											wellRoundedBulbro
										}
										showDetails={
											true
										}
										displayWidth={
											80
										}
										displayHeight={
											80
										}
										responsive={
											false
										}
									/>
								</div>
								<WeaponSlots
									weapons={
										weapons
									}
									maxSlots={
										6
									}
								/>
							</div>
							<Shop
								items={
									shopItems
								}
								availableMaterials={
									materials
								}
								onPurchase={
									handlePurchase
								}
							/>
							<div className="flex justify-center">
								<Button className="w-full max-w-md">
									Start
									Wave{" "}
									{stats.wave +
										1}
								</Button>
							</div>
						</div>
					</div>
				);
			},
	};

// Late game scenario (wave 10)
export const LateGame =
	{
		render:
			() => {
				const [
					weapons,
					setWeapons,
				] =
					useState<
						Weapon[]
					>(
						[
							pistol,
							smg,
							sword,
							ak47,
							doubleBarrelShotgun,
						],
					);
				const [
					materials,
					setMaterials,
				] =
					useState(
						800,
					);
				const [
					shopItems,
				] =
					useState<
						ShopItem[]
					>(
						[
							{
								weapon:
									laserGun,
								price: 300,
							},
							{
								weapon:
									ak47,
								price: 200,
							},
							{
								weapon:
									doubleBarrelShotgun,
								price: 250,
							},
							{
								weapon:
									sword,
								price: 150,
							},
						],
					);
				const [
					stats,
				] =
					useState<WaveStats>(
						{
							wave: 10,
							enemiesKilled: 180,
							damageDealt: 65000,
							damageTaken: 1200,
							materialsCollected: 800,
							survivalTime: 60,
							accuracy: 78.5,
						},
					);

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						if (
							materials >=
								item.price &&
							weapons.length <
								6
						) {
							setMaterials(
								materials -
									item.price,
							);
							setWeapons(
								[
									...weapons,
									item.weapon,
								],
							);
						}
					};

				return (
					<div className="p-4 max-w-6xl mx-auto">
						<div className="flex flex-col gap-3">
							<div className="text-center">
								<h1 className="text-2xl font-bold mb-1">
									Prepare
									for
									Wave{" "}
									{stats.wave +
										1}
								</h1>
								<p className="text-sm text-muted-foreground">
									Materials:{" "}
									{
										materials
									}
								</p>
							</div>
							<PrevWaveStats
								stats={
									stats
								}
							/>
							<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
								<div className="overflow-visible">
									<BulbroCard
										bulbro={
											wellRoundedBulbro
										}
										showDetails={
											true
										}
										displayWidth={
											80
										}
										displayHeight={
											80
										}
										responsive={
											false
										}
									/>
								</div>
								<WeaponSlots
									weapons={
										weapons
									}
									maxSlots={
										6
									}
								/>
							</div>
							<Shop
								items={
									shopItems
								}
								availableMaterials={
									materials
								}
								onPurchase={
									handlePurchase
								}
							/>
							<div className="flex justify-center">
								<Button className="w-full max-w-md">
									Start
									Wave{" "}
									{stats.wave +
										1}
								</Button>
							</div>
						</div>
					</div>
				);
			},
	};

// Low materials scenario
export const LowMaterialsScenario =
	{
		render:
			() => {
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
				const [
					materials,
					setMaterials,
				] =
					useState(
						30,
					);
				const [
					shopItems,
				] =
					useState<
						ShopItem[]
					>(
						[
							{
								weapon:
									smg,
								price: 100,
							},
							{
								weapon:
									sword,
								price: 75,
							},
							{
								weapon:
									knife,
								price: 25,
							},
							{
								weapon:
									ak47,
								price: 200,
							},
						],
					);
				const [
					stats,
				] =
					useState<WaveStats>(
						{
							wave: 2,
							enemiesKilled: 25,
							damageDealt: 6500,
							damageTaken: 450,
							materialsCollected: 30,
							survivalTime: 48,
							accuracy: 52.3,
						},
					);

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						if (
							materials >=
								item.price &&
							weapons.length <
								6
						) {
							setMaterials(
								materials -
									item.price,
							);
							setWeapons(
								[
									...weapons,
									item.weapon,
								],
							);
						}
					};

				return (
					<div className="p-4 max-w-6xl mx-auto">
						<div className="flex flex-col gap-3">
							<div className="text-center">
								<h1 className="text-2xl font-bold mb-1">
									Prepare
									for
									Wave{" "}
									{stats.wave +
										1}
								</h1>
								<p className="text-sm text-muted-foreground">
									Materials:{" "}
									{
										materials
									}
								</p>
							</div>
							<PrevWaveStats
								stats={
									stats
								}
							/>
							<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
								<div className="overflow-visible">
									<BulbroCard
										bulbro={
											wellRoundedBulbro
										}
										showDetails={
											true
										}
										displayWidth={
											80
										}
										displayHeight={
											80
										}
										responsive={
											false
										}
									/>
								</div>
								<WeaponSlots
									weapons={
										weapons
									}
									maxSlots={
										6
									}
								/>
							</div>
							<Shop
								items={
									shopItems
								}
								availableMaterials={
									materials
								}
								onPurchase={
									handlePurchase
								}
							/>
							<div className="flex justify-center">
								<Button className="w-full max-w-md">
									Start
									Wave{" "}
									{stats.wave +
										1}
								</Button>
							</div>
						</div>
					</div>
				);
			},
	};

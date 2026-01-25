import { useState } from "preact/hooks";
import { wellRoundedBulbro } from "@/characters-definitions";
import { PreRoundLayout } from "@/shop/PreRoundLayout";
import {
	addWeaponToPlayer,
	type PreRoundState,
	purchaseWeapon,
} from "@/shop/PreRoundState";
import type { WaveStats } from "@/shop/PrevWaveStats";
import type { ShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import type { Weapon } from "@/weapon";
import {
	fist,
	pistol,
	smg,
	sword,
} from "@/weapons-definitions";

export default {
	title:
		"Shop/PreRoundScreen",
};

// Helper to create initial state for stories using the generator
function createInitialState(
	weapons: Weapon[],
	materials: number,
	wave: number,
	prevWaveStats?: WaveStats,
	maxShopItems?: number,
	level: number = 1,
): PreRoundState {
	// Generate shop items from the bulbro's available weapons, excluding owned weapons
	const shopItems =
		generateShopItems(
			wellRoundedBulbro,
			{
				excludeOwned:
					weapons,
				maxItems:
					maxShopItems,
				wave,
				level,
			},
		);

	return {
		currentWave:
			wave,
		players:
			[
				{
					id: "player-1",
					bulbro:
						wellRoundedBulbro,
					weapons,
					materials,
					level,
				},
			],
		shopItems,
		prevWaveStats,
	};
}

// Complete pre-round screen with all components
export const CompletePreRoundScreen =
	{
		render:
			() => {
				const [
					state,
					setState,
				] =
					useState<PreRoundState>(
						() =>
							createInitialState(
								[
									pistol,
									fist,
								],
								250,
								1,
								{
									wave: 1,
									enemiesKilled: 45,
									damageDealt: 12450,
									damageTaken: 320,
									materialsCollected: 250,
									survivalTime: 60,
									accuracy: 68.5,
								},
								4,
							),
					);

				const player =
					state
						.players[0]!;

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						const newState =
							purchaseWeapon(
								state,
								player.id,
								item,
							);
						if (
							newState
						) {
							setState(
								newState,
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
					<PreRoundLayout
						currentWave={
							state.currentWave
						}
						player={{
							bulbro:
								player.bulbro,
							weapons:
								player.weapons,
							materials:
								player.materials,
							onWeaponClick:
								handleWeaponClick,
						}}
						shopItems={
							state.shopItems
						}
						prevWaveStats={
							state.prevWaveStats
						}
						onPurchase={
							handlePurchase
						}
						onStartWave={() =>
							console.log(
								"Starting wave...",
							)
						}
					/>
				);
			},
	};

// Early game scenario (wave 1)
export const EarlyGame =
	{
		render:
			() => {
				const [
					state,
					setState,
				] =
					useState<PreRoundState>(
						() =>
							createInitialState(
								[
									pistol,
								],
								50,
								1,
								{
									wave: 1,
									enemiesKilled: 20,
									damageDealt: 5000,
									damageTaken: 150,
									materialsCollected: 50,
									survivalTime: 60,
									accuracy: 55.0,
								},
								4,
							),
					);

				const player =
					state
						.players[0]!;

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						const newState =
							purchaseWeapon(
								state,
								player.id,
								item,
							);
						if (
							newState
						) {
							setState(
								newState,
							);
						}
					};

				return (
					<PreRoundLayout
						currentWave={
							state.currentWave
						}
						player={{
							bulbro:
								player.bulbro,
							weapons:
								player.weapons,
							materials:
								player.materials,
						}}
						shopItems={
							state.shopItems
						}
						prevWaveStats={
							state.prevWaveStats
						}
						onPurchase={
							handlePurchase
						}
						onStartWave={() =>
							console.log(
								"Starting wave...",
							)
						}
					/>
				);
			},
	};

// Late game scenario (wave 10)
export const LateGame =
	{
		render:
			() => {
				const [
					state,
					setState,
				] =
					useState<PreRoundState>(
						() =>
							createInitialState(
								[
									pistol,
									smg,
									sword,
								],
								800,
								10,
								{
									wave: 10,
									enemiesKilled: 180,
									damageDealt: 65000,
									damageTaken: 1200,
									materialsCollected: 800,
									survivalTime: 60,
									accuracy: 78.5,
								},
								4,
							),
					);

				const player =
					state
						.players[0]!;

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						const newState =
							purchaseWeapon(
								state,
								player.id,
								item,
							);
						if (
							newState
						) {
							setState(
								newState,
							);
						}
					};

				return (
					<PreRoundLayout
						currentWave={
							state.currentWave
						}
						player={{
							bulbro:
								player.bulbro,
							weapons:
								player.weapons,
							materials:
								player.materials,
						}}
						shopItems={
							state.shopItems
						}
						prevWaveStats={
							state.prevWaveStats
						}
						onPurchase={
							handlePurchase
						}
						onStartWave={() =>
							console.log(
								"Starting wave...",
							)
						}
					/>
				);
			},
	};

// Low materials scenario
export const LowMaterialsScenario =
	{
		render:
			() => {
				const [
					state,
					setState,
				] =
					useState<PreRoundState>(
						() =>
							createInitialState(
								[
									pistol,
									fist,
								],
								30,
								2,
								{
									wave: 2,
									enemiesKilled: 25,
									damageDealt: 6500,
									damageTaken: 450,
									materialsCollected: 30,
									survivalTime: 48,
									accuracy: 52.3,
								},
								4,
							),
					);

				const player =
					state
						.players[0]!;

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						const newState =
							purchaseWeapon(
								state,
								player.id,
								item,
							);
						if (
							newState
						) {
							setState(
								newState,
							);
						}
					};

				return (
					<PreRoundLayout
						currentWave={
							state.currentWave
						}
						player={{
							bulbro:
								player.bulbro,
							weapons:
								player.weapons,
							materials:
								player.materials,
						}}
						shopItems={
							state.shopItems
						}
						prevWaveStats={
							state.prevWaveStats
						}
						onPurchase={
							handlePurchase
						}
						onStartWave={() =>
							console.log(
								"Starting wave...",
							)
						}
					/>
				);
			},
	};

// Story demonstrating addWeaponToPlayer function
export const AddWeaponDemo =
	{
		render:
			() => {
				const [
					state,
					setState,
				] =
					useState<PreRoundState>(
						() =>
							createInitialState(
								[
									pistol,
								],
								500,
								5,
								{
									wave: 5,
									enemiesKilled: 100,
									damageDealt: 30000,
									damageTaken: 500,
									materialsCollected: 500,
									survivalTime: 60,
									accuracy: 72.0,
								},
								4,
							),
					);

				const player =
					state
						.players[0]!;

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						// Use addWeaponToPlayer directly (without deducting materials)
						// to demonstrate the function
						const newState =
							addWeaponToPlayer(
								state,
								player.id,
								item.weapon,
							);
						setState(
							newState,
						);
					};

				return (
					<div>
						<div className="p-2 mb-2 bg-yellow-100 dark:bg-yellow-900 text-sm rounded">
							This
							demo
							uses{" "}
							<code>
								addWeaponToPlayer
							</code>{" "}
							-
							weapons
							are
							added
							without
							deducting
							materials.
						</div>
						<PreRoundLayout
							currentWave={
								state.currentWave
							}
							player={{
								bulbro:
									player.bulbro,
								weapons:
									player.weapons,
								materials:
									player.materials,
							}}
							shopItems={
								state.shopItems
							}
							prevWaveStats={
								state.prevWaveStats
							}
							onPurchase={
								handlePurchase
							}
							onStartWave={() =>
								console.log(
									"Starting wave...",
								)
							}
						/>
					</div>
				);
			},
	};

// Story showing all available shop items with auto-generated prices
export const AllShopItems =
	{
		render:
			() => {
				const [
					state,
					setState,
				] =
					useState<PreRoundState>(
						() => {
							// Generate all shop items without any exclusions
							const shopItems =
								generateShopItems(
									wellRoundedBulbro,
									{
										wave: 1,
										level: 1,
									},
								);
							return {
								currentWave: 1,
								players:
									[
										{
											id: "player-1",
											bulbro:
												wellRoundedBulbro,
											weapons:
												[],
											materials: 1000,
											level: 1,
										},
									],
								shopItems,
							};
						},
					);

				const player =
					state
						.players[0]!;

				const handlePurchase =
					(
						item: ShopItem,
					) => {
						const newState =
							purchaseWeapon(
								state,
								player.id,
								item,
							);
						if (
							newState
						) {
							setState(
								newState,
							);
						}
					};

				return (
					<div>
						<div className="p-2 mb-2 bg-blue-100 dark:bg-blue-900 text-sm rounded">
							This
							story
							shows
							all
							weapons
							available
							for{" "}
							<strong>
								{
									wellRoundedBulbro.name
								}
							</strong>{" "}
							with
							auto-calculated
							prices
							using{" "}
							<code>
								generateShopItems
							</code>
							.
						</div>
						<PreRoundLayout
							currentWave={
								state.currentWave
							}
							player={{
								bulbro:
									player.bulbro,
								weapons:
									player.weapons,
								materials:
									player.materials,
							}}
							shopItems={
								state.shopItems
							}
							onPurchase={
								handlePurchase
							}
							onStartWave={() =>
								console.log(
									"Starting wave...",
								)
							}
						/>
					</div>
				);
			},
	};

// Story demonstrating wave/level price scaling
export const WaveLevelPriceScaling =
	{
		render:
			() => {
				const [
					wave,
					setWave,
				] =
					useState(
						1,
					);
				const [
					level,
					setLevel,
				] =
					useState(
						1,
					);

				const shopItems =
					generateShopItems(
						wellRoundedBulbro,
						{
							wave,
							level,
						},
					);

				return (
					<div className="p-4 max-w-4xl mx-auto">
						<div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
							<h2 className="text-lg font-bold mb-2">
								Wave/Level
								Price
								Scaling
								Demo
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Adjust
								wave
								and
								level
								to
								see
								how
								prices
								scale.
								Wave
								1
								prices
								are
								$10-$50,
								growing
								~15%
								per
								wave
								and
								~10%
								per
								level.
							</p>
							<div className="flex gap-4">
								<label className="flex items-center gap-2">
									<span>
										Wave:
									</span>
									<input
										type="range"
										min="1"
										max="20"
										value={
											wave
										}
										onChange={(
											e,
										) =>
											setWave(
												Number(
													(
														e.target as HTMLInputElement
													)
														.value,
												),
											)
										}
										className="w-32"
									/>
									<span className="w-8 text-center font-mono">
										{
											wave
										}
									</span>
								</label>
								<label className="flex items-center gap-2">
									<span>
										Level:
									</span>
									<input
										type="range"
										min="1"
										max="10"
										value={
											level
										}
										onChange={(
											e,
										) =>
											setLevel(
												Number(
													(
														e.target as HTMLInputElement
													)
														.value,
												),
											)
										}
										className="w-32"
									/>
									<span className="w-8 text-center font-mono">
										{
											level
										}
									</span>
								</label>
							</div>
						</div>
						<PreRoundLayout
							currentWave={
								wave
							}
							player={{
								bulbro:
									wellRoundedBulbro,
								weapons:
									[],
								materials: 10000,
							}}
							shopItems={
								shopItems
							}
							onPurchase={() => {}}
							onStartWave={() =>
								console.log(
									"Starting wave...",
								)
							}
						/>
					</div>
				);
			},
	};

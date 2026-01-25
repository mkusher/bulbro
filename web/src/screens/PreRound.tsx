import { useState } from "preact/hooks";
import { findBulbroById } from "@/characters-definitions";
import { startWave } from "@/currentGameProcess";
import { PreRoundLayout } from "@/shop/PreRoundLayout";
import {
	type PreRoundState,
	purchaseWeapon,
} from "@/shop/PreRoundState";
import type { ShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import type { WaveState } from "@/waveState";
import {
	selectWeapons as selectWeaponsInState,
	spendMaterials,
} from "@/waveState";
import {
	fromWeaponState,
	toWeaponState,
	type Weapon,
} from "@/weapon";
import { useStartBgm } from "@/audio";

/**
 * Converts WaveState to PreRoundState for use with the layout.
 * Uses the shop items generator to create shop items from the player's bulbro.
 */
function waveStateToPreRoundState(
	waveState: WaveState,
): PreRoundState {
	const wave =
		waveState
			.round
			.wave;

	const players =
		waveState.players.map(
			(
				player,
			) => {
				// Look up the full bulbro character definition by ID
				const bulbro =
					findBulbroById(
						player.id,
					);
				const ownedWeapons =
					player.weapons.map(
						fromWeaponState,
					);

				return {
					id: player.id,
					bulbro,
					weapons:
						ownedWeapons,
					materials:
						player.materialsAvailable,
					level:
						player.level,
				};
			},
		);

	// Generate shop items from the first player's bulbro, excluding owned weapons
	const firstPlayer =
		players[0];
	const shopItems =
		firstPlayer
			? generateShopItems(
					firstPlayer.bulbro,
					{
						excludeOwned:
							firstPlayer.weapons,
						maxItems: 4,
						wave,
						level:
							firstPlayer.level,
					},
				)
			: [];

	return {
		currentWave:
			wave,
		players,
		shopItems,
	};
}

type Props =
	{
		state: WaveState;
	};

/**
 * PreRound screen component.
 * Manages state and connects to the game process.
 * Uses PreRoundLayout for rendering and generates shop items automatically.
 */
export function PreRound({
	state,
}: Props) {
	const [
		currentState,
		setCurrentState,
	] =
		useState(
			state,
		);
	const [
		preRoundState,
		setPreRoundState,
	] =
		useState(
			() =>
				waveStateToPreRoundState(
					state,
				),
		);

	useStartBgm();

	const handlePurchase =
		(
			item: ShopItem,
		) => {
			const player =
				preRoundState
					.players[0];
			if (
				!player
			)
				return;

			const newPreRoundState =
				purchaseWeapon(
					preRoundState,
					player.id,
					item,
				);
			if (
				newPreRoundState
			) {
				// Regenerate shop items after purchase (exclude newly owned weapons)
				const updatedPlayer =
					newPreRoundState.players.find(
						(
							p,
						) =>
							p.id ===
							player.id,
					);
				const newShopItems =
					updatedPlayer
						? generateShopItems(
								updatedPlayer.bulbro,
								{
									excludeOwned:
										updatedPlayer.weapons,
									maxItems: 4,
									wave: preRoundState.currentWave,
									level:
										updatedPlayer.level,
								},
							)
						: newPreRoundState.shopItems;

				setPreRoundState(
					{
						...newPreRoundState,
						shopItems:
							newShopItems,
					},
				);

				// Also update the wave state with the new weapon and deduct materials
				let newWaveState =
					selectWeaponsInState(
						currentState,
						{
							type: "select-weapons",
							playerId:
								player.id,
							weapons:
								newPreRoundState.players
									.find(
										(
											p,
										) =>
											p.id ===
											player.id,
									)
									?.weapons.map(
										toWeaponState,
									) ??
								[],
							now: Date.now(),
						},
					);

				// Deduct materials from the bulbro
				newWaveState =
					spendMaterials(
						newWaveState,
						player.id,
						item.price,
					);

				setCurrentState(
					newWaveState,
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

	const handleStartWave =
		() => {
			startWave(
				currentState,
			);
		};

	const player =
		preRoundState
			.players[0];
	if (
		!player
	) {
		return (
			<div>
				No
				player
				found
			</div>
		);
	}

	return (
		<PreRoundLayout
			currentWave={
				preRoundState.currentWave
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
				preRoundState.shopItems
			}
			onPurchase={
				handlePurchase
			}
			onStartWave={
				handleStartWave
			}
		/>
	);
}

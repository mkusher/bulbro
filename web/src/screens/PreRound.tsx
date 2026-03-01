import { useState } from "preact/hooks";
import { findBulbroById } from "@/characters-definitions";
import { startWave } from "@/currentGameProcess";
import { PreRoundLayout } from "@/shop/PreRoundLayout";
import type { ShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import {
	waveState,
	selectWeapons as selectWeaponsInState,
	updateState,
} from "@/waveState";
import {
	fromWeaponState,
	toWeaponState,
	type Weapon,
} from "@/weapon";
import { useStartBgm } from "@/audio";
import {
	firstRerollPrice,
	rerollIncrease,
} from "@/game-formulas";
import { recordReroll } from "@/gameStats";
import { withEventMeta } from "@/game-events/GameEvents";
import {
	deltaTime as dt,
	nowTime,
} from "@/time";

/**
 * Calculates the re-roll price for a given re-roll count and wave.
 */
function getRerollPrice(
	rerollCount: number,
	wave: number,
): number {
	return (
		firstRerollPrice(
			wave,
		) +
		rerollCount *
			rerollIncrease(
				wave,
			)
	);
}

/**
 * Generates shop items for the first player from the current wave state.
 */
function generateShopItemsFromWaveState(): ShopItem[] {
	const state =
		waveState.value;
	const player =
		state
			.players[0];
	if (
		!player
	)
		return [];

	const bulbro =
		findBulbroById(
			player.type,
		);

	return generateShopItems(
		bulbro,
		{
			excludeWeapons:
				[],
			maxItems: 4,
			wave: state
				.round
				.wave,
			rerollCount:
				player.rerollCount,
		},
	);
}

/**
 * PreRound screen component.
 * Reads and writes the waveState signal directly.
 */
export function PreRound() {
	const [
		shopItems,
		setShopItems,
	] =
		useState(
			generateShopItemsFromWaveState,
		);

	useStartBgm();

	const state =
		waveState.value;
	const player =
		state
			.players[0];
	const rerollCount =
		player?.rerollCount ??
		0;
	const rerollPrice =
		getRerollPrice(
			rerollCount,
			state
				.round
				.wave,
		);

	const handleReroll =
		() => {
			if (
				!player ||
				player.materialsAvailable <
					rerollPrice
			)
				return;

			const newRerollCount =
				rerollCount +
				1;

			recordReroll(
				rerollPrice,
			);

			const now =
				nowTime(
					Date.now(),
				);
			waveState.value =
				updateState(
					waveState.value,
					withEventMeta(
						{
							type: "shopRerolled",
							playerId:
								player.id,
							cost: rerollPrice,
							rerollCount:
								newRerollCount,
						},
						dt(
							0,
						),
						now,
					),
				);

			setShopItems(
				generateShopItemsFromWaveState(),
			);
		};

	const handlePurchase =
		(
			item: ShopItem,
		) => {
			if (
				!player ||
				player.materialsAvailable <
					item.price
			)
				return;

			const now =
				nowTime(
					Date.now(),
				);

			// Apply purchase event to deduct materials
			waveState.value =
				updateState(
					waveState.value,
					withEventMeta(
						{
							type: "shopPurchased",
							playerId:
								player.id,
							weaponId:
								item
									.weapon
									.id,
							price:
								item.price,
						},
						dt(
							0,
						),
						now,
					),
				);

			// Add weapon to player's loadout
			const updatedPlayer =
				waveState.value.players.find(
					(
						p,
					) =>
						p.id ===
						player.id,
				);
			const newWeapons =
				[
					...(updatedPlayer?.weapons ??
						[]),
					toWeaponState(
						item.weapon,
					),
				];

			waveState.value =
				selectWeaponsInState(
					waveState.value,
					{
						type: "select-weapons",
						playerId:
							player.id,
						weapons:
							newWeapons,
						now,
					},
				);

			setShopItems(
				shopItems.filter(
					(
						i,
					) =>
						i !==
						item,
				),
			);
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
				waveState.value,
			);
		};

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

	const bulbro =
		findBulbroById(
			player.type,
		);
	const ownedWeapons =
		player.weapons.map(
			fromWeaponState,
		);

	return (
		<PreRoundLayout
			currentWave={
				state
					.round
					.wave
			}
			player={{
				bulbro,
				weapons:
					ownedWeapons,
				materials:
					player.materialsAvailable,
				onWeaponClick:
					handleWeaponClick,
			}}
			shopItems={
				shopItems
			}
			onPurchase={
				handlePurchase
			}
			onStartWave={
				handleStartWave
			}
			onReroll={
				handleReroll
			}
			rerollPrice={
				shopItems.length
					? rerollPrice
					: 0
			}
		/>
	);
}

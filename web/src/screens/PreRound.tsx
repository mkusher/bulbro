import { useState } from "preact/hooks";
import { useStartBgm } from "@/audio";
import { findBulbroById } from "@/characters-definitions";
import { startWave } from "@/currentGameProcess";
import { withEventMeta } from "@/game-events/GameEvents";
import {
	firstRerollPrice,
	rerollIncrease,
} from "@/game-formulas";
import { recordReroll } from "@/gameStats";
import {
	currentLobby,
	currentNetworkGame,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import type { PreRoundNetworkProps } from "@/shop/PreRoundLayout";
import { PreRoundLayout } from "@/shop/PreRoundLayout";
import type { ShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import {
	deltaTime as dt,
	nowTime,
} from "@/time";
import {
	selectWeapons as selectWeaponsInState,
	updateState,
	waveState,
} from "@/waveState";
import {
	fromWeaponState,
	toWeaponState,
	type Weapon,
} from "@/weapon";

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
 * Online players' connection and next wave readiness, or undefined offline.
 */
function useNetworkReadiness():
	| PreRoundNetworkProps
	| undefined {
	const game =
		currentNetworkGame.value;
	const lobby =
		currentLobby.value;
	if (
		!game ||
		!lobby
	)
		return;
	const localPlayerId =
		currentUser
			.value
			.id;
	const readyPlayerIds =
		game
			.readyForNextWave
			.value;
	return {
		isLocalReady:
			readyPlayerIds.includes(
				localPlayerId,
			),
		onNotReady:
			() =>
				game.markNotReadyForNextWave(),
		players:
			lobby.players.map(
				(
					player,
				) => ({
					id: player.id,
					username:
						player.username,
					connected:
						player.status ===
						"connected",
					ready:
						readyPlayerIds.includes(
							player.id,
						),
					isLocal:
						player.id ===
						localPlayerId,
				}),
			),
	};
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
	const network =
		useNetworkReadiness();

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
				network?.isLocalReady ||
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
				network?.isLocalReady ||
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
			const game =
				currentNetworkGame.value;
			if (
				game
			) {
				game.markReadyForNextWave();
				return;
			}
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
			network={
				network
			}
		/>
	);
}

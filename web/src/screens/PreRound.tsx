import { useState } from "preact/hooks";
import { useStartBgm } from "@/audio";
import { findBulbroById } from "@/characters-definitions";
import { startWave } from "@/currentGameProcess";
import { withEventMeta } from "@/game-events/GameEvents";
import { rerollPrice as getRerollPrice } from "@/game-formulas";
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
import type { PlayerStatus } from "@/ui/PlayersStatus";
import { LevelUpLayout } from "@/upgrades/LevelUpLayout";
import {
	generateUpgradeChoices,
	type UpgradeChoice,
} from "@/upgrades/Upgrades";
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
	const bulbros =
		waveState
			.value
			.players;
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
				) => {
					const bulbro =
						bulbros.find(
							(
								b,
							) =>
								b.id ===
								player.id,
						);
					return {
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
						bulbroName:
							bulbro &&
							findBulbroById(
								bulbro.type,
							)
								.name,
						level:
							bulbro?.level,
					};
				},
			),
	};
}

/**
 * The player picking a level-up upgrade, if any: the local player online,
 * or the first player with pending level-ups in a local game.
 */
function findLevelingUpPlayer() {
	const players =
		currentNetworkGame.value
			? waveState.value.players.filter(
					(
						player,
					) =>
						player.id ===
						currentUser
							.value
							.id,
				)
			: waveState
					.value
					.players;
	return players.find(
		(
			player,
		) =>
			player.pendingLevelUps >
			0,
	);
}

/**
 * Level-up upgrade choice, one level at a time. Shown after the wave
 * ends and before the shop until every gained level got its upgrade.
 */
function LevelUp({
	players,
}: {
	players?: PlayerStatus[];
}) {
	const player =
		findLevelingUpPlayer();
	if (
		!player
	)
		return null;
	const level =
		player.nextLevelUpLevel;
	const choices =
		generateUpgradeChoices(
			{
				playerId:
					player.id,
				level,
				luck: player
					.stats
					.luck,
				rerollCount:
					player.upgradeRerollCount,
			},
		);
	const upgradesRerollPrice =
		getRerollPrice(
			player.upgradeRerollCount,
			waveState
				.value
				.round
				.wave,
		);
	const isLocalCoOp =
		!currentNetworkGame.value &&
		waveState
			.value
			.players
			.length >
			1;

	const handleSelect =
		(
			choice: UpgradeChoice,
		) => {
			waveState.value =
				updateState(
					waveState.value,
					withEventMeta(
						{
							type: "upgradeSelected",
							playerId:
								player.id,
							level,
							upgradeId:
								choice
									.upgrade
									.id,
							tier: choice.tier,
						},
						dt(
							0,
						),
						nowTime(
							Date.now(),
						),
					),
				);
		};

	const handleReroll =
		() => {
			if (
				player.materialsAvailable <
				upgradesRerollPrice
			)
				return;
			recordReroll(
				upgradesRerollPrice,
			);
			waveState.value =
				updateState(
					waveState.value,
					withEventMeta(
						{
							type: "upgradesRerolled",
							playerId:
								player.id,
							level,
							cost: upgradesRerollPrice,
							rerollCount:
								player.upgradeRerollCount +
								1,
						},
						dt(
							0,
						),
						nowTime(
							Date.now(),
						),
					),
				);
		};

	return (
		<LevelUpLayout
			key={`${player.id}:${level}`}
			level={
				level
			}
			pendingLevelUps={
				player.pendingLevelUps
			}
			choices={
				choices
			}
			onSelect={
				handleSelect
			}
			materials={
				player.materialsAvailable
			}
			rerollPrice={
				upgradesRerollPrice
			}
			onReroll={
				handleReroll
			}
			players={
				players
			}
			bulbroState={
				player
			}
			playerName={
				isLocalCoOp
					? `P${waveState.value.players.indexOf(player) + 1}: ${findBulbroById(player.type).name}`
					: undefined
			}
		/>
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
			const purchasingPlayer =
				waveState.value.players.find(
					(
						candidate,
					) =>
						candidate.id ===
						player?.id,
				);
			if (
				!purchasingPlayer ||
				purchasingPlayer
					.weapons
					.length >=
					purchasingPlayer
						.stats
						.maxWeapons ||
				network?.isLocalReady ||
				purchasingPlayer.materialsAvailable <
					item.price
			)
				return;

			const now =
				nowTime(
					Date.now(),
				);

			// Commit the cost and loadout together after both updates succeed.
			const purchasedState =
				updateState(
					waveState.value,
					withEventMeta(
						{
							type: "shopPurchased",
							playerId:
								purchasingPlayer.id,
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

			// Add weapon to purchasingPlayer's loadout
			const updatedPlayer =
				purchasedState.players.find(
					(
						p,
					) =>
						p.id ===
						purchasingPlayer.id,
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
					purchasedState,
					{
						type: "select-weapons",
						playerId:
							purchasingPlayer.id,
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
		findLevelingUpPlayer()
	) {
		return (
			<LevelUp
				players={
					network?.players
				}
			/>
		);
	}

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
				maxWeaponSlots:
					player
						.stats
						.maxWeapons,
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

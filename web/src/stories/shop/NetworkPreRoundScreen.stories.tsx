import { useState } from "preact/hooks";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	type NetworkPlayerStatus,
	NetworkPlayersStatus,
} from "@/shop/NetworkPlayersStatus";
import { PreRoundLayout } from "@/shop/PreRoundLayout";
import type { ShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import type { Weapon } from "@/weapon";
import {
	fist,
	pistol,
} from "@/weapons-definitions";

export default {
	title:
		"Shop/NetworkPreRoundScreen",
};

const localPlayer: NetworkPlayerStatus =
	{
		id: "local-player",
		username:
			"Alice",
		connected: true,
		ready: false,
		isLocal: true,
	};

const remotePlayer: NetworkPlayerStatus =
	{
		id: "remote-player",
		username:
			"Bob",
		connected: true,
		ready: false,
	};

function NetworkPreRound({
	initialLocalReady = false,
	remote = remotePlayer,
	simulateRemoteReady = false,
}: {
	initialLocalReady?: boolean;
	remote?: NetworkPlayerStatus;
	simulateRemoteReady?: boolean;
}) {
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
			180,
		);
	const [
		shopItems,
		setShopItems,
	] =
		useState<
			ShopItem[]
		>(
			() =>
				generateShopItems(
					wellRoundedBulbro,
					{
						excludeWeapons:
							weapons,
						maxItems: 4,
						wave: 2,
						rerollCount: 0,
					},
				),
		);
	const [
		isLocalReady,
		setLocalReady,
	] =
		useState(
			initialLocalReady,
		);
	const [
		remoteState,
		setRemoteState,
	] =
		useState(
			remote,
		);

	const handleReady =
		() => {
			setLocalReady(
				true,
			);
			if (
				simulateRemoteReady
			)
				setTimeout(
					() =>
						setRemoteState(
							(
								player,
							) => ({
								...player,
								ready: true,
							}),
						),
					1500,
				);
		};

	const handlePurchase =
		(
			item: ShopItem,
		) => {
			if (
				materials <
				item.price
			)
				return;
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

	return (
		<PreRoundLayout
			currentWave={
				2
			}
			player={{
				bulbro:
					wellRoundedBulbro,
				weapons,
				materials,
			}}
			shopItems={
				shopItems
			}
			onPurchase={
				handlePurchase
			}
			onStartWave={
				handleReady
			}
			rerollPrice={
				8
			}
			onReroll={() => {}}
			network={{
				isLocalReady,
				onNotReady:
					() =>
						setLocalReady(
							false,
						),
				players:
					[
						{
							...localPlayer,
							ready:
								isLocalReady,
						},
						remoteState,
					],
			}}
		/>
	);
}

// Nobody is ready yet; clicking "Ready" locks the shop and waits for Bob
export const NobodyReady =
	{
		render:
			() => (
				<NetworkPreRound />
			),
	};

// The other player already finished shopping and waits for the local player
export const RemotePlayerReady =
	{
		render:
			() => (
				<NetworkPreRound
					remote={{
						...remotePlayer,
						ready: true,
					}}
				/>
			),
	};

// Local player is ready, shop is locked until the other player is ready or "Not Ready" is clicked
export const WaitingForRemotePlayer =
	{
		render:
			() => (
				<NetworkPreRound
					initialLocalReady
				/>
			),
	};

// The other player lost the connection while shopping
export const RemotePlayerDisconnected =
	{
		render:
			() => (
				<NetworkPreRound
					initialLocalReady
					remote={{
						...remotePlayer,
						connected: false,
					}}
				/>
			),
	};

// Click "Ready"; Bob becomes ready 1.5s later
export const InteractiveReadyFlow =
	{
		render:
			() => (
				<NetworkPreRound
					simulateRemoteReady
				/>
			),
	};

// Players status panel on its own, every combination of states
export const PlayersStatusPanel =
	{
		render:
			() => (
				<div className="max-w-md p-4">
					<NetworkPlayersStatus
						players={[
							{
								...localPlayer,
								ready: true,
							},
							remotePlayer,
							{
								id: "disconnected-ready",
								username:
									"Carol",
								connected: false,
								ready: true,
							},
							{
								id: "disconnected",
								username:
									"Dave",
								connected: false,
								ready: false,
							},
						]}
					/>
				</div>
			),
	};

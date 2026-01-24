import type { Bulbro } from "@/bulbro/BulbroCharacter";
import type { WaveStats } from "@/shop/PrevWaveStats";
import type { ShopItem } from "@/shop/Shop";
import type { Weapon } from "@/weapon";

/**
 * Represents a player's state in the pre-round screen.
 */
export interface PreRoundPlayer {
	id: string;
	bulbro: Bulbro;
	weapons: Weapon[];
	materials: number;
	level: number;
}

/**
 * State for the pre-round screen, separated from game state.
 */
export interface PreRoundState {
	currentWave: number;
	players: PreRoundPlayer[];
	shopItems: ShopItem[];
	prevWaveStats?: WaveStats;
}

/**
 * Adds a weapon to a player's inventory.
 * Returns a new state with the weapon added.
 */
export function addWeaponToPlayer(
	state: PreRoundState,
	playerId: string,
	weapon: Weapon,
): PreRoundState {
	return {
		...state,
		players:
			state.players.map(
				(
					player,
				) =>
					player.id ===
					playerId
						? {
								...player,
								weapons:
									[
										...player.weapons,
										weapon,
									],
							}
						: player,
			),
	};
}

/**
 * Removes a weapon from a player's inventory by index.
 * Returns a new state with the weapon removed.
 */
export function removeWeaponFromPlayer(
	state: PreRoundState,
	playerId: string,
	weaponIndex: number,
): PreRoundState {
	return {
		...state,
		players:
			state.players.map(
				(
					player,
				) =>
					player.id ===
					playerId
						? {
								...player,
								weapons:
									player.weapons.filter(
										(
											_,
											i,
										) =>
											i !==
											weaponIndex,
									),
							}
						: player,
			),
	};
}

/**
 * Purchases a weapon from the shop for a player.
 * Deducts materials and adds weapon to inventory.
 * Returns null if player cannot afford the item.
 */
export function purchaseWeapon(
	state: PreRoundState,
	playerId: string,
	item: ShopItem,
): PreRoundState | null {
	const player =
		state.players.find(
			(
				p,
			) =>
				p.id ===
				playerId,
		);
	if (
		!player ||
		player.materials <
			item.price
	) {
		return null;
	}

	return {
		...state,
		players:
			state.players.map(
				(
					p,
				) =>
					p.id ===
					playerId
						? {
								...p,
								weapons:
									[
										...p.weapons,
										item.weapon,
									],
								materials:
									p.materials -
									item.price,
							}
						: p,
			),
	};
}

/**
 * Updates the materials for a player.
 */
export function updatePlayerMaterials(
	state: PreRoundState,
	playerId: string,
	materials: number,
): PreRoundState {
	return {
		...state,
		players:
			state.players.map(
				(
					player,
				) =>
					player.id ===
					playerId
						? {
								...player,
								materials,
							}
						: player,
			),
	};
}

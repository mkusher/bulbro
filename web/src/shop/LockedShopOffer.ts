import { findItemById } from "@/items/Items";
import {
	isItemShopItem,
	type ShopItem,
} from "@/shop/Shop";
import {
	getWeaponByType,
	type WeaponType,
} from "@/weapon";
import type { WeaponTier } from "@/weapon/WeaponState";
import { weaponAtTier } from "@/weapon/WeaponTiers";

/** Serializable locked offer; definitions are restored on the receiving client. */
export type LockedShopOffer =
	{
		price: number;
	} & (
		| {
				itemId: string;
		  }
		| {
				weaponId: WeaponType;
				tier: WeaponTier;
		  }
	);

export function saveLockedOffer(
	offer: ShopItem,
): LockedShopOffer {
	return isItemShopItem(
		offer,
	)
		? {
				itemId:
					offer
						.item
						.id,
				price:
					offer.price,
			}
		: {
				weaponId:
					offer
						.weapon
						.id,
				tier:
					offer.tier ??
					1,
				price:
					offer.price,
			};
}

export function restoreLockedOffers(
	offers: readonly LockedShopOffer[],
): ShopItem[] {
	return offers.flatMap(
		(
			offer,
		): ShopItem[] => {
			if (
				"itemId" in
				offer
			) {
				const item =
					findItemById(
						offer.itemId,
					);
				return item
					? [
							{
								item,
								price:
									offer.price,
								locked: true,
							},
						]
					: [];
			}
			return [
				{
					weapon:
						weaponAtTier(
							getWeaponByType(
								offer.weaponId,
							),
							offer.tier,
						),
					tier: offer.tier,
					price:
						offer.price,
					locked: true,
				},
			];
		},
	);
}

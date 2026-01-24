import { useState } from "preact/hooks";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";
import type { Weapon } from "@/weapon";
import { WeaponDisplay } from "@/weapon/WeaponDisplay";
import { WeaponTitle } from "@/weapon/WeaponTitle";

export interface ShopItem {
	weapon: Weapon;
	price: number;
}

export interface ShopProps {
	items: ShopItem[];
	availableMaterials: number;
	onPurchase?: (
		item: ShopItem,
	) => void;
}

export function Shop({
	items,
	availableMaterials,
	onPurchase,
}: ShopProps) {
	const [
		purchasedItems,
		setPurchasedItems,
	] =
		useState<
			Set<string>
		>(
			new Set(),
		);

	const handlePurchase =
		(
			item: ShopItem,
		) => {
			if (
				availableMaterials >=
					item.price &&
				!purchasedItems.has(
					item
						.weapon
						.id,
				)
			) {
				setPurchasedItems(
					new Set(
						[
							...purchasedItems,
							item
								.weapon
								.id,
						],
					),
				);
				onPurchase?.(
					item,
				);
			}
		};

	const canAfford =
		(
			price: number,
		) =>
			availableMaterials >=
			price;
	const isPurchased =
		(
			weaponId: string,
		) =>
			purchasedItems.has(
				weaponId,
			);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">
						Shop
					</h3>
					<span className="text-xs text-muted-foreground">
						$
						{
							availableMaterials
						}
					</span>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="grid grid-cols-4 gap-1 justify-items-center">
					{items.map(
						(
							item,
						) => {
							const purchased =
								isPurchased(
									item
										.weapon
										.id,
								);
							const affordable =
								canAfford(
									item.price,
								);

							return (
								<Card
									key={
										item
											.weapon
											.id
									}
									className={`w-full ${
										purchased
											? "opacity-50 cursor-not-allowed"
											: affordable
												? "cursor-pointer hover:shadow-md transition-shadow"
												: "opacity-75 cursor-not-allowed"
									}`}
								>
									<CardContent className="p-1 flex flex-col gap-0.5 items-center">
										<div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
											<WeaponDisplay
												weapon={
													item.weapon
												}
												width={
													60
												}
												height={
													60
												}
												scale={
													0.35
												}
											/>
										</div>
										<p className="text-[7px] font-medium w-full text-center leading-tight whitespace-nowrap px-0.5 overflow-hidden text-ellipsis">
											{
												item
													.weapon
													.name
											}
										</p>
										<Button
											onClick={() =>
												handlePurchase(
													item,
												)
											}
											disabled={
												!affordable ||
												purchased
											}
											className="w-full h-5 text-[8px] px-1 py-0"
											size="sm"
										>
											{purchased
												? "Owned"
												: affordable
													? `$${item.price}`
													: `Locked $${item.price}`}
										</Button>
									</CardContent>
								</Card>
							);
						},
					)}
				</div>
			</CardContent>
		</Card>
	);
}

import type { Stats } from "@/bulbro/BulbroCharacter";
import { formatStatName } from "@/bulbro/BulbroStats";
import { percentageStats } from "@/game-formulas";
import { t } from "@/i18n";
import type {
	ItemDefinition,
	ItemTier,
} from "@/items/Items";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";
import type { Weapon } from "@/weapon";
import { WeaponDisplay } from "@/weapon/WeaponDisplay";

export type WeaponShopItem =
	{
		weapon: Weapon;
		price: number;
	};

export type ItemShopItem =
	{
		item: ItemDefinition;
		price: number;
	};

/** A weapon or an item offered in the shop */
export type ShopItem =
	| WeaponShopItem
	| ItemShopItem;

export function isItemShopItem(
	shopItem: ShopItem,
): shopItem is ItemShopItem {
	return (
		"item" in
		shopItem
	);
}

/** Unique key of what the shop item sells */
export function shopItemKey(
	shopItem: ShopItem,
) {
	return isItemShopItem(
		shopItem,
	)
		? `item:${shopItem.item.id}`
		: `weapon:${shopItem.weapon.id}`;
}

const itemTierNames: Record<
	ItemTier,
	string
> =
	{
		1: "I",
		2: "II",
		3: "III",
		4: "IV",
	};

const itemTierStyles: Record<
	ItemTier,
	string
> =
	{
		1: "border-slate-300",
		2: "border-sky-400 bg-sky-50",
		3: "border-purple-400 bg-purple-50",
		4: "border-red-400 bg-red-50",
	};

/**
 * Signed stat points of an item, e.g. "+8 Max HP" or "+4% Speed": points of
 * percentage stats (speed included) are percents.
 */
export function ItemBonuses({
	item,
	className = "",
}: {
	item: ItemDefinition;
	className?: string;
}) {
	return (
		<ul
			className={`w-full leading-tight ${className}`}
		>
			{Object.entries(
				item.bonuses,
			).map(
				([
					key,
					value = 0,
				]) => (
					<li
						key={
							key
						}
						className={
							value >=
							0
								? "text-green-700"
								: "text-red-600"
						}
					>
						{value >=
						0
							? "+"
							: ""}
						{
							value
						}
						{percentageStats.has(
							key as keyof Stats,
						)
							? "%"
							: ""}{" "}
						{formatStatName(
							key,
						)}
					</li>
				),
			)}
		</ul>
	);
}

/** Item name, tier and stat changes */
function ItemCardContent({
	item,
}: {
	item: ItemDefinition;
}) {
	return (
		<div className="w-full min-h-[60px] flex flex-col items-center gap-0.5">
			<p className="text-[7px] text-muted-foreground">
				{t(
					"levelUp.tier",
					{
						tier: itemTierNames[
							item
								.tier
						],
					},
				)}
			</p>
			<p className="text-[8px] font-semibold w-full text-center leading-tight">
				{t(
					item.nameKey,
				)}
			</p>
			<ItemBonuses
				item={
					item
				}
				className="text-[7px] text-center"
			/>
		</div>
	);
}

export interface ShopProps {
	items: ShopItem[];
	availableMaterials: number;
	onPurchase?: (
		item: ShopItem,
	) => void;
	onReroll?: () => void;
	rerollPrice?: number;
	/** Locks purchases and re-rolls, e.g. after the player is ready in an online game */
	disabled?: boolean;
	weaponsFull?: boolean;
}

export function Shop({
	items,
	availableMaterials,
	onPurchase,
	onReroll,
	rerollPrice,
	disabled = false,
	weaponsFull = false,
}: ShopProps) {
	const canAfford =
		(
			price: number,
		) =>
			availableMaterials >=
			price;

	const isBlockedByWeaponLimit =
		(
			item: ShopItem,
		) =>
			weaponsFull &&
			!isItemShopItem(
				item,
			);

	const handlePurchase =
		(
			item: ShopItem,
		) => {
			if (
				!disabled &&
				!isBlockedByWeaponLimit(
					item,
				) &&
				canAfford(
					item.price,
				)
			) {
				onPurchase?.(
					item,
				);
			}
		};

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">
						{t(
							"shop.title",
						)}
					</h3>
					<div className="flex items-center gap-2">
						{onReroll &&
							rerollPrice !==
								undefined && (
								<Button
									onClick={
										onReroll
									}
									disabled={
										disabled ||
										availableMaterials <
											rerollPrice
									}
									size="sm"
									variant="outline"
									className="h-7 text-xs px-3"
								>
									{t(
										"shop.reroll",
										{
											price:
												rerollPrice,
										},
									)}
								</Button>
							)}
						<span className="text-xs text-muted-foreground">
							$
							{
								availableMaterials
							}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="grid grid-cols-4 gap-1 justify-items-center">
					{items.map(
						(
							item,
						) => {
							const affordable =
								canAfford(
									item.price,
								);
							const blocked =
								isBlockedByWeaponLimit(
									item,
								);

							return (
								<Card
									key={shopItemKey(
										item,
									)}
									className={`w-full ${
										isItemShopItem(
											item,
										)
											? `border-2 ${itemTierStyles[item.item.tier]}`
											: ""
									} ${
										affordable
											? "cursor-pointer hover:shadow-md transition-shadow"
											: "opacity-75 cursor-not-allowed"
									}`}
								>
									<CardContent className="p-1 flex flex-col gap-0.5 items-center h-full">
										{isItemShopItem(
											item,
										) ? (
											<ItemCardContent
												item={
													item.item
												}
											/>
										) : (
											<>
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
													{t(
														`weapon.name.${item.weapon.id}`,
													)}
												</p>
											</>
										)}
										<Button
											onClick={() =>
												handlePurchase(
													item,
												)
											}
											disabled={
												disabled ||
												blocked ||
												!affordable
											}
											className="w-full h-5 text-[8px] px-1 py-0 mt-auto"
											size="sm"
										>
											{blocked
												? t(
														"shop.weaponLimitReached",
													)
												: affordable
													? t(
															"shop.price",
															{
																price:
																	item.price,
															},
														)
													: t(
															"shop.locked",
															{
																price:
																	item.price,
															},
														)}
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

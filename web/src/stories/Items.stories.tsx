import { itemPrice } from "@/game-formulas";
import { t } from "@/i18n";
import { ItemDisplay } from "@/items/ItemDisplay";
import { itemDefinitions } from "@/items/Items";
import { ItemSlots } from "@/shop/ItemSlots";
import {
	ItemBonuses,
	Shop,
} from "@/shop/Shop";

export default {
	title:
		"Items/Items",
};

export const ItemGallery =
	{
		render:
			() => (
				<div className="grid grid-cols-4 md:grid-cols-8 gap-3 p-4">
					{itemDefinitions.map(
						(
							item,
						) => (
							<div
								key={
									item.id
								}
								className="flex flex-col items-center gap-2 rounded border border-border bg-card p-2"
							>
								<ItemDisplay
									item={
										item
									}
									size={
										64
									}
								/>
								<strong className="text-xs text-center">
									{t(
										item.nameKey,
									)}
								</strong>
								<ItemBonuses
									item={
										item
									}
									className="text-[10px] text-center"
								/>
							</div>
						),
					)}
				</div>
			),
	};

export const ItemTiles =
	{
		render:
			() => (
				<div className="max-w-xl space-y-4 p-4">
					<Shop
						items={itemDefinitions
							.slice(
								0,
								4,
							)
							.map(
								(
									item,
								) => ({
									item,
									price:
										itemPrice(
											item.basePrice,
											1,
											1,
										),
								}),
							)}
						availableMaterials={
							200
						}
					/>
					<ItemSlots
						items={[
							...itemDefinitions.slice(
								0,
								6,
							),
							itemDefinitions[0]!,
						]}
					/>
				</div>
			),
	};

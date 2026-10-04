import { t } from "@/i18n";
import type { ItemDefinition } from "@/items/Items";
import { ItemBonuses } from "@/shop/Shop";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";

export interface ItemSlotsProps {
	items: ItemDefinition[];
}

/** Owned items, the same items grouped with a count. */
export function ItemSlots({
	items,
}: ItemSlotsProps) {
	const groups =
		new Map<
			string,
			{
				item: ItemDefinition;
				count: number;
			}
		>();
	for (const item of items) {
		const group =
			groups.get(
				item.id,
			);
		groups.set(
			item.id,
			{
				item,
				count:
					(group?.count ??
						0) +
					1,
			},
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">
						{t(
							"items.title",
						)}
					</h3>
					<span className="text-xs text-muted-foreground">
						{
							items.length
						}
					</span>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{groups.size ===
				0 ? (
					<p className="text-xs text-muted-foreground">
						{t(
							"items.empty",
						)}
					</p>
				) : (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
						{[
							...groups.values(),
						].map(
							({
								item,
								count,
							}) => (
								<div
									key={
										item.id
									}
									className="relative flex flex-col items-center gap-0.5 p-1 rounded border border-border bg-card"
								>
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
									{count >
										1 && (
										<span className="absolute top-0 right-1 text-[8px] font-bold">
											×
											{
												count
											}
										</span>
									)}
								</div>
							),
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

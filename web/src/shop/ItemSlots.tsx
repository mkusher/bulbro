import { useState } from "preact/hooks";
import { t } from "@/i18n";
import { ItemDisplay } from "@/items/ItemDisplay";
import type { ItemDefinition } from "@/items/Items";
import {
	ItemBonuses,
	itemTierNames,
	itemTierStyles,
} from "@/shop/Shop";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";

export interface ItemSlotsProps {
	items: ItemDefinition[];
}

type ItemGroup =
	{
		item: ItemDefinition;
		count: number;
	};

/** Owned items grouped by id with a count, in order of first purchase */
export function groupItems(
	items: ItemDefinition[],
): ItemGroup[] {
	const groups =
		new Map<
			string,
			ItemGroup
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
	return [
		...groups.values(),
	];
}

/** Name, tier and per-copy and total stat changes of an owned item */
function ItemDetails({
	group:
		{
			item,
			count,
		},
}: {
	group: ItemGroup;
}) {
	return (
		<section
			className={`flex gap-2 p-2 rounded border-2 ${itemTierStyles[item.tier]}`}
			aria-label={t(
				"items.details",
			)}
			aria-live="polite"
		>
			<ItemDisplay
				item={
					item
				}
				size={
					48
				}
			/>
			<div className="flex flex-col gap-1 min-w-0 flex-1">
				<div>
					<p className="text-xs font-semibold leading-tight">
						{t(
							item.nameKey,
						)}
						{count >
							1 &&
							` ×${count}`}
					</p>
					<p className="text-[10px] text-muted-foreground">
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
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<p className="text-[10px] font-medium">
							{t(
								"items.effect",
							)}
						</p>
						<ItemBonuses
							item={
								item
							}
							className="text-[10px]"
						/>
					</div>
					{count >
						1 && (
						<div>
							<p className="text-[10px] font-medium">
								{t(
									"items.totalEffect",
									{
										count,
									},
								)}
							</p>
							<ItemBonuses
								item={
									item
								}
								count={
									count
								}
								className="text-[10px]"
							/>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

/** Owned items as an icon grid; selecting one shows its effect. */
export function ItemSlots({
	items,
}: ItemSlotsProps) {
	const groups =
		groupItems(
			items,
		);
	const [
		selectedId,
		setSelectedId,
	] =
		useState<
			| string
			| null
		>(
			null,
		);
	const selected =
		groups.find(
			(
				group,
			) =>
				group
					.item
					.id ===
				selectedId,
		);

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
			<CardContent className="pt-0 flex flex-col gap-2">
				{groups.length ===
				0 ? (
					<p className="text-xs text-muted-foreground">
						{t(
							"items.empty",
						)}
					</p>
				) : (
					<>
						<div className="flex flex-wrap gap-1">
							{groups.map(
								({
									item,
									count,
								}) => {
									const isSelected =
										item.id ===
										selectedId;
									return (
										<button
											key={
												item.id
											}
											type="button"
											title={t(
												item.nameKey,
											)}
											aria-label={t(
												item.nameKey,
											)}
											aria-pressed={
												isSelected
											}
											onClick={() =>
												setSelectedId(
													isSelected
														? null
														: item.id,
												)
											}
											className={`relative w-11 h-11 flex items-center justify-center rounded border-2 bg-card cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${itemTierStyles[item.tier]} ${
												isSelected
													? "ring-2 ring-offset-1 ring-blue-500"
													: ""
											}`}
										>
											<ItemDisplay
												item={
													item
												}
												size={
													36
												}
											/>
											{count >
												1 && (
												<span className="absolute bottom-0 right-0.5 text-[9px] font-bold leading-none">
													×
													{
														count
													}
												</span>
											)}
										</button>
									);
								},
							)}
						</div>
						{selected ? (
							<ItemDetails
								group={
									selected
								}
							/>
						) : (
							<p className="text-[10px] text-muted-foreground">
								{t(
									"items.selectHint",
								)}
							</p>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}

import { useState } from "preact/hooks";
import { t } from "@/i18n";
import {
	itemTierNames,
	itemTierStyles,
} from "@/shop/Shop";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";
import { WeaponDisplay } from "@/weapon/WeaponDisplay";
import { WeaponStats } from "@/weapon/WeaponStats";
import {
	findCombinableOwnedWeapon,
	nextWeaponTier,
	type OwnedWeapon,
} from "@/weapon/WeaponTiers";

export interface WeaponSlotsProps {
	weapons: OwnedWeapon[];
	maxSlots?: number;
	/** Materials paid back for selling the weapon; selling is hidden without it */
	sellPrice?: (
		weapon: OwnedWeapon,
	) => number;
	onSell?: (
		weapon: OwnedWeapon,
	) => void;
	/** Combines the weapon with an equal one of the same tier */
	onCombine?: (
		weapon: OwnedWeapon,
		other: OwnedWeapon,
	) => void;
	/** Locks selling and combining, e.g. after the player is ready in an online game */
	disabled?: boolean;
}

/** Tier, stats, and sell and combine actions of an owned weapon */
function WeaponDetails({
	weapon,
	weapons,
	sellPrice,
	onSell,
	onCombine,
	disabled,
}: {
	weapon: OwnedWeapon;
} & Pick<
	WeaponSlotsProps,
	| "sellPrice"
	| "onSell"
	| "onCombine"
	| "disabled"
> & {
		weapons: OwnedWeapon[];
	}) {
	const nextTier =
		nextWeaponTier(
			weapon.tier,
		);
	const combinable =
		findCombinableOwnedWeapon(
			weapons,
			weapon,
		);
	const isLastWeapon =
		weapons.length <=
		1;
	return (
		<section
			className={`flex flex-col gap-2 p-2 rounded border-2 ${itemTierStyles[weapon.tier]}`}
			aria-label={t(
				"shop.weaponDetails",
			)}
			aria-live="polite"
		>
			<div className="flex gap-2 items-center">
				<WeaponDisplay
					weapon={
						weapon.weapon
					}
					width={
						48
					}
					height={
						48
					}
					scale={
						0.3
					}
				/>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-semibold leading-tight">
						{t(
							`weapon.name.${weapon.weapon.id}`,
						)}
					</p>
					<p className="text-[10px] text-muted-foreground">
						{t(
							"levelUp.tier",
							{
								tier: itemTierNames[
									weapon
										.tier
								],
							},
						)}
					</p>
				</div>
			</div>
			<WeaponStats
				weapon={
					weapon.weapon
				}
				className="p-2"
			/>
			<div className="flex flex-wrap items-center gap-2">
				{sellPrice &&
					onSell && (
						<Button
							size="sm"
							variant="outline"
							className="h-7 text-xs px-3"
							disabled={
								disabled ||
								isLastWeapon
							}
							title={
								isLastWeapon
									? t(
											"shop.lastWeapon",
										)
									: undefined
							}
							onClick={() =>
								onSell(
									weapon,
								)
							}
						>
							{t(
								"shop.sellWeapon",
								{
									price:
										sellPrice(
											weapon,
										),
								},
							)}
						</Button>
					)}
				{onCombine &&
					nextTier &&
					combinable && (
						<Button
							size="sm"
							className="h-7 text-xs px-3"
							disabled={
								disabled
							}
							onClick={() =>
								onCombine(
									weapon,
									combinable,
								)
							}
						>
							{t(
								"shop.combineWeapon",
								{
									tier: itemTierNames[
										nextTier
									],
								},
							)}
						</Button>
					)}
				{onCombine &&
					(nextTier ===
					undefined ? (
						<span className="text-[10px] text-muted-foreground">
							{t(
								"shop.maxWeaponTier",
							)}
						</span>
					) : (
						!combinable && (
							<span className="text-[10px] text-muted-foreground">
								{t(
									"shop.combineHint",
									{
										tier: itemTierNames[
											weapon
												.tier
										],
									},
								)}
							</span>
						)
					))}
			</div>
		</section>
	);
}

/** Owned weapon slots; selecting a weapon shows its stats and lets the player sell or combine it. */
export function WeaponSlots({
	weapons,
	maxSlots = 6,
	sellPrice,
	onSell,
	onCombine,
	disabled = false,
}: WeaponSlotsProps) {
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
		weapons.find(
			(
				weapon,
			) =>
				weapon.id ===
				selectedId,
		);
	const slots =
		Array.from(
			{
				length:
					Math.max(
						maxSlots,
						weapons.length,
					),
			},
			(
				_,
				i,
			) =>
				weapons[
					i
				] ||
				null,
		);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">
						{t(
							"shop.weapons",
						)}
					</h3>
					<span className="text-xs text-muted-foreground">
						{
							weapons.length
						}{" "}
						/{" "}
						{
							maxSlots
						}
					</span>
				</div>
			</CardHeader>
			<CardContent className="pt-0 flex flex-col gap-2">
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
					{slots.map(
						(
							weapon,
							index,
						) => {
							if (
								!weapon
							) {
								return (
									<div
										key={`empty-${index}`}
										className="flex flex-col items-center gap-0.5 p-1 rounded border border-dashed border-muted"
									>
										<div className="w-full aspect-square flex items-center justify-center text-muted-foreground">
											<span className="text-base">
												+
											</span>
										</div>
									</div>
								);
							}
							const isSelected =
								weapon.id ===
								selectedId;
							const name =
								t(
									`weapon.name.${weapon.weapon.id}`,
								);
							return (
								<button
									key={
										weapon.id
									}
									type="button"
									aria-label={t(
										"common.selectNamed",
										{
											name,
										},
									)}
									aria-pressed={
										isSelected
									}
									onClick={() =>
										setSelectedId(
											isSelected
												? null
												: weapon.id,
										)
									}
									className={`relative flex flex-col items-center gap-0.5 p-1 rounded border-2 bg-card cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${itemTierStyles[weapon.tier]} ${
										isSelected
											? "ring-2 ring-offset-1 ring-blue-500"
											: ""
									}`}
								>
									<div className="w-full aspect-square flex items-center justify-center">
										<WeaponDisplay
											weapon={
												weapon.weapon
											}
											width={
												80
											}
											height={
												80
											}
											scale={
												0.4
											}
										/>
									</div>
									<p className="text-[8px] text-center truncate w-full leading-tight">
										{
											name
										}
									</p>
									<span className="absolute top-0.5 left-1 text-[9px] font-bold leading-none">
										{
											itemTierNames[
												weapon
													.tier
											]
										}
									</span>
								</button>
							);
						},
					)}
				</div>
				{weapons.length >
					0 &&
					(selected ? (
						<WeaponDetails
							weapon={
								selected
							}
							weapons={
								weapons
							}
							sellPrice={
								sellPrice
							}
							onSell={
								onSell
							}
							onCombine={
								onCombine
							}
							disabled={
								disabled
							}
						/>
					) : (
						<p className="text-[10px] text-muted-foreground">
							{t(
								"shop.selectWeaponHint",
							)}
						</p>
					))}
			</CardContent>
		</Card>
	);
}

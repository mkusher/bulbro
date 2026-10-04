import { t } from "@/i18n";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";
import type { Weapon } from "@/weapon";
import { WeaponDisplay } from "@/weapon/WeaponDisplay";
import { WeaponTitle } from "@/weapon/WeaponTitle";

export interface WeaponSlotsProps {
	weapons: Weapon[];
	maxSlots?: number;
	onWeaponClick?: (
		weapon: Weapon,
		index: number,
	) => void;
}

export function WeaponSlots({
	weapons,
	maxSlots = 6,
	onWeaponClick,
}: WeaponSlotsProps) {
	const slots =
		Array.from(
			{
				length:
					maxSlots,
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
			<CardContent className="pt-0">
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
					{slots.map(
						(
							weapon,
							index,
						) => (
							<div
								key={
									index
								}
								className={`relative flex flex-col items-center gap-0.5 p-1 rounded border ${
									weapon
										? "cursor-pointer hover:shadow-md transition-shadow border-border bg-card"
										: "border-dashed border-muted"
								}`}
							>
								{weapon ? (
									<>
										<div className="w-full aspect-square flex items-center justify-center">
											<WeaponDisplay
												weapon={
													weapon
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
											{t(
												`weapon.name.${weapon.id}`,
											)}
										</p>
									</>
								) : (
									<div className="w-full aspect-square flex items-center justify-center text-muted-foreground">
										<span className="text-base">
											+
										</span>
									</div>
								)}
								{weapon &&
									onWeaponClick && (
										<button
											type="button"
											className="absolute inset-0 cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
											aria-label={t(
												"common.selectNamed",
												{
													name: t(
														`weapon.name.${weapon.id}`,
													),
												},
											)}
											onClick={() =>
												onWeaponClick(
													weapon,
													index,
												)
											}
										/>
									)}
							</div>
						),
					)}
				</div>
			</CardContent>
		</Card>
	);
}

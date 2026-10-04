import { t } from "@/i18n";
import { formatStatName } from "@/i18n/game";
import type { Weapon } from "../weapon";
import { fromWeaponState } from "../weapon";
import type { WeaponState } from "./WeaponState";

export type WeaponStatsProps =
	{
		weapon: Weapon;
		className?: string;
	};

export function WeaponStats({
	weapon,
	className,
}: WeaponStatsProps) {
	const stats =
		weapon.statsBonus;
	// Only numeric stats are rendered: passing nested objects (e.g. `scaling`)
	// as JSX children makes Preact mutate them into VNodes, which corrupts the
	// shared weapon definition and breaks JSON serialization.
	const statEntries =
		Object.entries(
			stats,
		).filter(
			(
				entry,
			): entry is [
				string,
				number,
			] =>
				typeof entry[1] ===
					"number" &&
				entry[1] !==
					0,
		);

	if (
		statEntries.length ===
		0
	) {
		return (
			<div
				className={`p-3 border rounded-md bg-muted/50 ${className || ""}`}
			>
				<div className="text-sm text-muted-foreground">
					{t(
						"weapon.noStatBonuses",
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`p-3 border rounded-md ${className || ""}`}
		>
			<div className="text-sm font-medium mb-2">
				{t(
					"weapon.statsBonuses",
				)}
			</div>
			<div className="grid grid-cols-2 gap-2 text-xs">
				{statEntries.map(
					([
						key,
						value,
					]) => (
						<div
							key={
								key
							}
							className="flex justify-between"
						>
							<span className="text-muted-foreground capitalize">
								{formatStatName(
									key,
								)}
								:
							</span>
							<span
								className={`font-medium ${value > 0 ? "text-green-600" : "text-red-600"}`}
							>
								{value >
								0
									? "+"
									: ""}
								{
									value
								}
							</span>
						</div>
					),
				)}
			</div>
			<div className="mt-2 pt-2 border-t text-xs">
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						{t(
							"weapon.shotSpeed",
						)}
					</span>
					<span className="font-medium">
						{
							weapon.shotSpeed
						}
					</span>
				</div>
			</div>
		</div>
	);
}

export type WeaponStateStatsProps =
	{
		weaponState: WeaponState;
		className?: string;
	};

export function WeaponStateStats({
	weaponState,
	className,
}: WeaponStateStatsProps) {
	const weapon =
		fromWeaponState(
			weaponState,
		);
	return (
		<WeaponStats
			weapon={
				weapon
			}
			className={
				className
			}
		/>
	);
}

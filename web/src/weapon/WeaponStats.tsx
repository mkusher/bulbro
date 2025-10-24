import type { Weapon } from "../weapon";
import type { WeaponState } from "./WeaponState";
import { fromWeaponState } from "../weapon";

export type WeaponStatsProps = {
	weapon: Weapon;
	className?: string;
};

export function WeaponStats({ weapon, className }: WeaponStatsProps) {
	const stats = weapon.statsBonus;
	const statEntries = Object.entries(stats).filter(
		([_, value]) => value !== undefined && value !== 0,
	);

	if (statEntries.length === 0) {
		return (
			<div className={`p-3 border rounded-md bg-muted/50 ${className || ""}`}>
				<div className="text-sm text-muted-foreground">No stat bonuses</div>
			</div>
		);
	}

	return (
		<div className={`p-3 border rounded-md ${className || ""}`}>
			<div className="text-sm font-medium mb-2">Stats Bonuses</div>
			<div className="grid grid-cols-2 gap-2 text-xs">
				{statEntries.map(([key, value]) => (
					<div key={key} className="flex justify-between">
						<span className="text-muted-foreground capitalize">
							{key.replace(/([A-Z])/g, " $1").trim()}:
						</span>
						<span
							className={`font-medium ${(value as number) > 0 ? "text-green-600" : "text-red-600"}`}
						>
							{(value as number) > 0 ? "+" : ""}
							{value}
						</span>
					</div>
				))}
			</div>
			<div className="mt-2 pt-2 border-t text-xs">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Shot Speed:</span>
					<span className="font-medium">{weapon.shotSpeed}</span>
				</div>
			</div>
		</div>
	);
}

export type WeaponStateStatsProps = {
	weaponState: WeaponState;
	className?: string;
};

export function WeaponStateStats({
	weaponState,
	className,
}: WeaponStateStatsProps) {
	const weapon = fromWeaponState(weaponState);
	return <WeaponStats weapon={weapon} className={className} />;
}

import type { Weapon } from "../weapon";
import type { WeaponState } from "./WeaponState";
import { fromWeaponState } from "../weapon";
import type { WeaponRarity } from "./WeaponDisplay";

const rarityStyles: Record<WeaponRarity, string> = {
	common:
		"bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
	uncommon:
		"bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-100",
	rare: "bg-green-100 border-green-300 text-green-900 dark:bg-green-900/30 dark:border-green-600 dark:text-green-100",
	exceptional:
		"bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-100",
	legendary:
		"bg-violet-100 border-violet-300 text-violet-900 dark:bg-violet-900/30 dark:border-violet-600 dark:text-violet-100",
};

export type WeaponTitleProps = {
	weapon: Weapon;
	rarity?: WeaponRarity;
	className?: string;
};

export function WeaponTitle({
	weapon,
	rarity = "common",
	className,
}: WeaponTitleProps) {
	const rarityStyle = rarityStyles[rarity];

	return (
		<div
			className={`flex items-center gap-2 p-2 rounded-md ${rarityStyle} ${className || ""}`}
		>
			<div className="flex-1">
				<div className="font-medium text-sm">{weapon.name}</div>
				<div className="text-xs opacity-75">{weapon.classes.join(", ")}</div>
			</div>
			<div className="text-xs font-medium capitalize opacity-75">{rarity}</div>
		</div>
	);
}

export type WeaponStateTitleProps = {
	weaponState: WeaponState;
	rarity?: WeaponRarity;
	className?: string;
};

export function WeaponStateTitle({
	weaponState,
	rarity = "common",
	className,
}: WeaponStateTitleProps) {
	const weapon = fromWeaponState(weaponState);
	return <WeaponTitle weapon={weapon} rarity={rarity} className={className} />;
}

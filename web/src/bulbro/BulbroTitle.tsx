import type { Bulbro } from "./BulbroCharacter";
import type { BulbroState } from "./BulbroState";
import { calculateStats } from "../game-formulas";

export type BulbroRarity =
	| "common"
	| "uncommon"
	| "rare"
	| "exceptional"
	| "legendary";

const rarityStyles: Record<BulbroRarity, string> = {
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

export type BulbroTitleProps = {
	bulbro: Bulbro;
	rarity?: BulbroRarity;
	className?: string;
};

export function BulbroTitle({
	bulbro,
	rarity = "common",
	className,
}: BulbroTitleProps) {
	const rarityStyle = rarityStyles[rarity];

	return (
		<div
			className={`flex items-center gap-2 p-2 rounded-md ${rarityStyle} ${className || ""}`}
		>
			<div className="flex-1">
				<div className="font-medium text-sm">{bulbro.name}</div>
				<div className="text-xs opacity-75">
					HP: {calculateStats(bulbro.statBonuses).maxHp} • Speed:{" "}
					{bulbro.statBonuses.speed
						? `${bulbro.statBonuses.speed > 0 ? "+" : ""}${bulbro.statBonuses.speed}%`
						: "Base"}
				</div>
			</div>
		</div>
	);
}

export type BulbroStateTitleProps = {
	bulbroState: BulbroState;
	bulbro: Bulbro;
	rarity?: BulbroRarity;
	className?: string;
};

export function BulbroStateTitle({
	bulbroState,
	bulbro,
	rarity = "common",
	className,
}: BulbroStateTitleProps) {
	const rarityStyle = rarityStyles[rarity];
	const isAlive = bulbroState.isAlive();

	return (
		<div
			className={`flex items-center gap-2 p-2 rounded-md ${rarityStyle} ${className || ""}`}
		>
			<div className="flex-1">
				<div className="font-medium text-sm flex items-center gap-2">
					{bulbro.name}
					{!isAlive && <span className="text-red-600 text-xs">💀 KO</span>}
					{isAlive &&
						bulbroState.healthPoints < bulbroState.stats.maxHp * 0.3 && (
							<span className="text-orange-600 text-xs">⚠️ Low HP</span>
						)}
				</div>
				<div className="text-xs opacity-75">
					Lvl {bulbroState.level} • HP: {bulbroState.healthPoints}/
					{bulbroState.stats.maxHp} • XP: {bulbroState.totalExperience}
				</div>
			</div>
		</div>
	);
}

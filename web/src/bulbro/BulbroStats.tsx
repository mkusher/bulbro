import { useState } from "preact/hooks";
import { t } from "@/i18n";
import { formatStatName } from "@/i18n/game";
import { cn } from "@/ui/shadcn/utils";

export { formatStatName } from "@/i18n/game";

import {
	calculateStats,
	percentageStats,
} from "../game-formulas";
import type {
	Bulbro,
	Stats,
} from "./BulbroCharacter";
import type { BulbroState } from "./BulbroState";

export type BulbroStatsProps =
	{
		bulbro: Bulbro;
		className?: string;
	};

export function BulbroStats({
	bulbro,
	className,
}: BulbroStatsProps) {
	const stats =
		calculateStats(
			bulbro.statBonuses,
		);
	const mainStatEntries =
		getMainStatEntries(
			stats,
		);
	const secondaryStatEntries =
		getSecondaryStatEntries(
			stats,
		);

	return (
		<div
			className={`p-3 border rounded-md ${className || ""}`}
		>
			<div className="text-sm font-medium mb-3">
				{t(
					"characterStats.title",
				)}
			</div>

			{/* Main Stats */}
			<div className="mb-3">
				<div className="text-xs font-medium mb-2 text-muted-foreground">
					{t(
						"characterStats.core",
					)}
				</div>
				<div className="grid grid-cols-2 gap-2 text-xs">
					{mainStatEntries.map(
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
								<span className="font-medium">
									{formatStatValue(
										key,
										value,
									)}
								</span>
							</div>
						),
					)}
				</div>
			</div>

			{/* Secondary Stats */}
			{secondaryStatEntries.length >
				0 && (
				<div className="pt-2 border-t">
					<div className="text-xs font-medium mb-2 text-muted-foreground">
						{t(
							"characterStats.secondary",
						)}
					</div>
					<div className="grid grid-cols-2 gap-2 text-xs">
						{secondaryStatEntries.map(
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
									<span className="font-medium">
										{formatStatValue(
											key,
											value,
										)}
									</span>
								</div>
							),
						)}
					</div>
				</div>
			)}

			{/* Weapons Count */}
			<div className="mt-3 pt-2 border-t text-xs">
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						{t(
							"shop.weapons",
						)}
						:
					</span>
					<span className="font-medium">
						{
							bulbro
								.weapons
								.length
						}
					</span>
				</div>
			</div>
		</div>
	);
}

export type BulbroStateStatsProps =
	{
		bulbroState: BulbroState;
		className?: string;
	};

export function BulbroStateStats({
	bulbroState,
	className,
}: BulbroStateStatsProps) {
	const [
		showAll,
		setShowAll,
	] =
		useState(
			false,
		);
	const stats =
		bulbroState.stats;
	const mainStatEntries =
		getMainStatEntries(
			stats,
			showAll,
		);
	const secondaryStatEntries =
		getSecondaryStatEntries(
			stats,
			showAll,
		);

	return (
		<div
			className={cn(
				"p-3 border rounded-md bg-card text-card-foreground",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2 mb-3">
				<div className="text-sm font-medium">
					{t(
						"characterStats.current",
					)}
				</div>
				<button
					type="button"
					className="text-xs text-muted-foreground underline hover:text-foreground"
					onClick={() =>
						setShowAll(
							!showAll,
						)
					}
				>
					{showAll
						? t(
								"characterStats.showChanged",
							)
						: t(
								"characterStats.showAll",
							)}
				</button>
			</div>

			{/* Health */}
			<div className="mb-3 p-2 bg-muted/50 rounded">
				<div className="flex justify-between text-sm">
					<span>
						{t(
							"characterStats.health",
						)}
						:
					</span>
					<span className="font-medium">
						{
							bulbroState.healthPoints
						}{" "}
						/{" "}
						{
							stats.maxHp
						}
					</span>
				</div>
			</div>

			{/* Main Stats */}
			<div className="mb-3">
				<div className="text-xs font-medium mb-2 text-muted-foreground">
					{t(
						"characterStats.core",
					)}
				</div>
				<div className="grid grid-cols-2 gap-2 text-xs">
					{mainStatEntries.map(
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
								<span className="font-medium">
									{formatStatValue(
										key,
										value,
									)}
								</span>
							</div>
						),
					)}
				</div>
			</div>

			{/* Secondary Stats */}
			{secondaryStatEntries.length >
				0 && (
				<div className="pt-2 border-t">
					<div className="text-xs font-medium mb-2 text-muted-foreground">
						{t(
							"characterStats.secondary",
						)}
					</div>
					<div className="grid grid-cols-2 gap-2 text-xs">
						{secondaryStatEntries.map(
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
									<span className="font-medium">
										{formatStatValue(
											key,
											value,
										)}
									</span>
								</div>
							),
						)}
					</div>
				</div>
			)}

			{/* Level and Experience */}
			<div className="mt-3 pt-2 border-t text-xs space-y-1">
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						{t(
							"characterStats.level",
						)}
						:
					</span>
					<span className="font-medium">
						{
							bulbroState.level
						}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						{t(
							"characterStats.experience",
						)}
						:
					</span>
					<span className="font-medium">
						{
							bulbroState.totalExperience
						}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						{t(
							"stats.materials",
						)}
						:
					</span>
					<span className="font-medium">
						{
							bulbroState.materialsAvailable
						}
					</span>
				</div>
			</div>
		</div>
	);
}

function getMainStatEntries(
	stats: Stats,
	showAll = false,
) {
	const mainStats: (keyof Stats)[] =
		[
			"maxHp",
			"hpRegeneration",
			"lifeSteal",
			"damage",
			"meleeDamage",
			"rangedDamage",
			"elementalDamage",
			"attackSpeed",
			"critChance",
			"engineering",
			"range",
			"armor",
			"dodge",
			"speed",
			"luck",
			"harvesting",
		];

	return mainStats
		.map(
			(
				key,
			) =>
				[
					key,
					stats[
						key
					],
				] as const,
		)
		.filter(
			([
				_,
				value,
			]) =>
				value !==
					undefined &&
				(showAll ||
					value !==
						0),
		);
}

function getSecondaryStatEntries(
	stats: Stats,
	showAll = false,
) {
	const secondaryStats: (keyof Stats)[] =
		[
			"pickupRange",
			"knockback",
			"explosionSize",
			"startingWeapons",
			"maxWeapons",
		];

	return secondaryStats
		.map(
			(
				key,
			) =>
				[
					key,
					stats[
						key
					],
				] as const,
		)
		.filter(
			([
				key,
				value,
			]) =>
				value !==
					undefined &&
				(showAll ||
					value !==
						0 ||
					key ===
						"startingWeapons" ||
					key ===
						"maxWeapons"),
		);
}

/** Stats shown as absolute values even though their points are percentages. */
const absoluteDisplayStats =
	new Set<
		keyof Stats
	>(
		[
			"speed",
			"pickupRange",
		],
	);

export function formatStatValue(
	key: keyof Stats,
	value: number,
): string {
	const rounded =
		Math.round(
			value *
				10,
		) /
		10;
	return percentageStats.has(
		key,
	) &&
		!absoluteDisplayStats.has(
			key,
		)
		? `${rounded}%`
		: `${rounded}`;
}

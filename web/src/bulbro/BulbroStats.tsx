import { calculateStats } from "../game-formulas";
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
				Character
				Stats
			</div>

			{/* Main Stats */}
			<div className="mb-3">
				<div className="text-xs font-medium mb-2 text-muted-foreground">
					Core
					Stats
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
									{
										value
									}
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
						Secondary
						Stats
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
										{
											value
										}
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
						Weapons:
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
	const stats =
		bulbroState.stats;
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
				Current
				Stats
			</div>

			{/* Health */}
			<div className="mb-3 p-2 bg-muted/50 rounded">
				<div className="flex justify-between text-sm">
					<span>
						Health:
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
					Core
					Stats
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
									{
										value
									}
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
						Secondary
						Stats
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
										{
											value
										}
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
						Level:
					</span>
					<span className="font-medium">
						{
							bulbroState.level
						}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						Experience:
					</span>
					<span className="font-medium">
						{
							bulbroState.totalExperience
						}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">
						Materials:
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
) {
	const mainStats: (keyof Stats)[] =
		[
			"maxHp",
			"hpRegeneration",
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
				value !==
					0,
		);
}

function getSecondaryStatEntries(
	stats: Stats,
) {
	const secondaryStats: (keyof Stats)[] =
		[
			"pickupRange",
			"knockback",
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
				_,
				value,
			]) =>
				value !==
					undefined &&
				value !==
					0,
		);
}

function formatStatName(
	key: string,
): string {
	return key
		.replace(
			/([A-Z])/g,
			" $1",
		)
		.replace(
			/^./,
			(
				str,
			) =>
				str.toUpperCase(),
		)
		.trim();
}

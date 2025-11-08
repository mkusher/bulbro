import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";
import type { StatBonus } from "../game-formulas";
import type { Bulbro } from "./BulbroCharacter";
import { BulbroDisplay } from "./BulbroDisplay";
import { BulbroTitle } from "./BulbroTitle";

export type BulbroCardProps =
	{
		bulbro: Bulbro;
		className?: string;
		onClick?: () => void;
		showDetails?: boolean;
		displayWidth?: number;
		displayHeight?: number;
		responsive?: boolean;
	};

// Helper component to display stat bonuses with colors
function StatBonusDisplay({
	bonuses,
}: {
	bonuses: StatBonus;
}) {
	const percentageStats =
		new Set(
			[
				"speed",
				"damage",
				"meleeDamage",
				"rangedDamage",
				"elementalDamage",
				"attackSpeed",
				"critChance",
				"engineering",
				"luck",
				"pickupRange",
			],
		);

	const statEntries =
		Object.entries(
			bonuses,
		).filter(
			([
				_,
				value,
			]) =>
				value !==
				0,
		);

	if (
		statEntries.length ===
		0
	) {
		return null;
	}

	return (
		<div className="space-y-0.5">
			<strong className="text-[9px]">
				Bonuses:
			</strong>
			{statEntries.map(
				([
					key,
					value,
				]) => {
					const isPositive =
						value >
						0;
					const isPercentage =
						percentageStats.has(
							key,
						);
					const colorClass =
						isPositive
							? "text-green-600 dark:text-green-400"
							: "text-red-600 dark:text-red-400";
					const sign =
						isPositive
							? "+"
							: "";
					const suffix =
						isPercentage
							? "%"
							: "";

					// Convert camelCase to readable format
					const readableKey =
						key
							.replace(
								/([A-Z])/g,
								" $1",
							)
							.toLowerCase();

					return (
						<div
							key={
								key
							}
							className={`text-[8px] ${colorClass}`}
						>
							{
								readableKey
							}
							:{" "}
							{
								sign
							}
							{
								value
							}
							{
								suffix
							}
						</div>
					);
				},
			)}
		</div>
	);
}

export function BulbroCard({
	bulbro,
	className = "",
	onClick,
	showDetails = true,
	displayWidth = 80,
	displayHeight = 80,
	responsive = true,
}: BulbroCardProps) {
	// Calculate responsive dimensions
	const getResponsiveDimensions =
		() => {
			if (
				!responsive
			) {
				return {
					width:
						Math.max(
							displayWidth,
							80,
						),
					height:
						Math.max(
							displayHeight,
							80,
						),
				};
			}

			// Responsive sizing based on screen breakpoints
			// iPhone Mini: 375px, iPhone Max: 428px, iPad Mini: 768px, iPad 10: 820px, iPad 13: 1024px
			return {
				width:
					displayWidth,
				height:
					displayHeight,
			};
		};

	const {
		width:
			actualWidth,
		height:
			actualHeight,
	} =
		getResponsiveDimensions();

	return (
		<Card
			className={`cursor-pointer hover:shadow-lg transition-shadow ${
				responsive
					? "w-full max-w-[220px] sm:max-w-[300px] md:max-w-[380px] lg:max-w-[460px] xl:max-w-[500px]"
					: ""
			} ${className}`}
			onClick={
				onClick
			}
		>
			<CardHeader className="pb-1 px-2 pt-2">
				<BulbroTitle
					bulbro={
						bulbro
					}
				/>
			</CardHeader>
			<CardContent className="flex flex-col gap-1 px-2 pb-2">
				<div
					className={
						responsive
							? "w-full aspect-square max-w-[120px] sm:max-w-[160px] md:max-w-[220px] lg:max-w-[280px] xl:max-w-[320px] mx-auto"
							: "mx-auto"
					}
					style={
						!responsive
							? {
									width: `${actualWidth}px`,
									height: `${actualHeight}px`,
								}
							: undefined
					}
				>
					<BulbroDisplay
						bulbro={
							bulbro
						}
					/>
				</div>
				{showDetails && (
					<div className="text-[8px] text-muted-foreground space-y-0.5">
						<StatBonusDisplay
							bonuses={
								bulbro.statBonuses
							}
						/>
						{bulbro
							.style
							.wearingItems
							.length >
							0 && (
							<div className="truncate">
								<strong className="text-[9px]">
									Items:
								</strong>{" "}
								{bulbro.style.wearingItems.join(
									", ",
								)}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

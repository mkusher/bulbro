import type { BulbroState } from "@/bulbro/BulbroState";
import {
	BulbroStateStats,
	formatStatName,
	formatStatValue,
} from "@/bulbro/BulbroStats";
import { t } from "@/i18n";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
} from "@/ui/shadcn/card";
import type {
	UpgradeChoice,
	UpgradeTier,
} from "@/upgrades/Upgrades";

const tierNames: Record<
	UpgradeTier,
	string
> =
	{
		1: "I",
		2: "II",
		3: "III",
		4: "IV",
	};

const tierStyles: Record<
	UpgradeTier,
	string
> =
	{
		1: "border-slate-300",
		2: "border-sky-400 bg-sky-50",
		3: "border-purple-400 bg-purple-50",
		4: "border-red-400 bg-red-50",
	};

export interface LevelUpLayoutProps {
	/** Level the upgrade is picked for */
	level: number;
	/** Pending level-ups including the current one */
	pendingLevelUps: number;
	choices: UpgradeChoice[];
	onSelect?: (
		choice: UpgradeChoice,
	) => void;
	/** Shows the player's live stats next to the choices */
	bulbroState?: BulbroState;
	/** Name of the picking player, shown in local co-op */
	playerName?: string;
	/** Materials available for re-rolls */
	materials?: number;
	/** Price of offering new choices */
	rerollPrice?: number;
	onReroll?: () => void;
}

/**
 * Pure layout of the level-up screen: one level at a time, choose one of
 * the offered upgrades.
 */
export function LevelUpLayout({
	level,
	pendingLevelUps,
	choices,
	onSelect,
	bulbroState,
	playerName,
	materials,
	rerollPrice,
	onReroll,
}: LevelUpLayoutProps) {
	return (
		<div className="p-4 max-w-6xl mx-auto">
			<div className="flex flex-col gap-3">
				<Card className="bg-white border p-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-1">
							{t(
								"levelUp.title",
								{
									level,
								},
							)}
						</h1>
						{playerName && (
							<p className="text-sm font-medium">
								{
									playerName
								}
							</p>
						)}
						<p className="text-sm text-muted-foreground">
							{pendingLevelUps >
							1
								? t(
										"levelUp.remaining",
										{
											count:
												pendingLevelUps -
												1,
										},
									)
								: t(
										"levelUp.choose",
									)}
						</p>
					</div>
					{onReroll &&
						rerollPrice !==
							undefined && (
							<div className="flex items-center justify-center gap-2 mt-2">
								<Button
									onClick={
										onReroll
									}
									disabled={
										materials ===
											undefined ||
										materials <
											rerollPrice
									}
									size="sm"
									variant="outline"
								>
									{t(
										"shop.reroll",
										{
											price:
												rerollPrice,
										},
									)}
								</Button>
								<span className="text-xs text-muted-foreground">
									$
									{
										materials
									}
								</span>
							</div>
						)}
				</Card>

				<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						{choices.map(
							(
								choice,
							) => (
								<Card
									key={
										choice
											.upgrade
											.id
									}
									className={`w-full border-2 ${tierStyles[choice.tier]}`}
								>
									<CardContent className="p-3 flex flex-col gap-2 items-center h-full">
										<p className="text-xs text-muted-foreground">
											{t(
												"levelUp.tier",
												{
													tier: tierNames[
														choice
															.tier
													],
												},
											)}
										</p>
										<p className="text-base font-bold text-center">
											{
												choice
													.upgrade
													.name
											}
										</p>
										<p className="text-sm text-center grow">
											+
											{formatStatValue(
												choice
													.upgrade
													.stat,
												choice
													.upgrade
													.values[
													choice
														.tier
												],
											)}{" "}
											{formatStatName(
												choice
													.upgrade
													.stat,
											)}
										</p>
										<Button
											className="w-full"
											size="sm"
											onClick={() =>
												onSelect?.(
													choice,
												)
											}
										>
											{t(
												"levelUp.select",
											)}
										</Button>
									</CardContent>
								</Card>
							),
						)}
					</div>
					{bulbroState && (
						<BulbroStateStats
							bulbroState={
								bulbroState
							}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

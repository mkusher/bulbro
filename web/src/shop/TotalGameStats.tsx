import type { TotalGameStats as TotalGameStatsType } from "@/gameStats";
import { t } from "@/i18n";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";

export interface TotalGameStatsProps {
	stats: TotalGameStatsType;
}

function formatTime(
	seconds: number,
): string {
	const mins =
		Math.floor(
			seconds /
				60,
		);
	const secs =
		seconds %
		60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TotalGameStats({
	stats,
}: TotalGameStatsProps) {
	return (
		<Card className="w-full">
			<CardHeader className="pb-2">
				<h3 className="text-sm font-semibold">
					{t(
						"stats.totalGame",
					)}
				</h3>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							{t(
								"stats.waves",
							)}
						</span>
						<span className="text-base font-bold text-primary">
							{
								stats.wavesCompleted
							}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							{t(
								"stats.enemies",
							)}
						</span>
						<span className="text-base font-bold text-primary">
							{
								stats.enemiesKilled
							}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							{t(
								"stats.damage",
							)}
						</span>
						<span className="text-base font-bold text-primary">
							{stats.damageDealt.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							{t(
								"stats.taken",
							)}
						</span>
						<span className="text-base font-bold text-destructive">
							{stats.damageTaken.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							{t(
								"stats.materials",
							)}
						</span>
						<span className="text-base font-bold text-primary">
							{
								stats.materialsCollected
							}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							{t(
								"stats.time",
							)}
						</span>
						<span className="text-base font-bold text-primary">
							{formatTime(
								stats.totalSurvivalTime,
							)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

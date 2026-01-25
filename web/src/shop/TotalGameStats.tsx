import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";
import type { TotalGameStats as TotalGameStatsType } from "@/gameStats";

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
					Total
					Game
					Stats
				</h3>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							Waves
						</span>
						<span className="text-base font-bold text-primary">
							{
								stats.wavesCompleted
							}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							Enemies
						</span>
						<span className="text-base font-bold text-primary">
							{
								stats.enemiesKilled
							}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							Damage
						</span>
						<span className="text-base font-bold text-primary">
							{stats.damageDealt.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							Taken
						</span>
						<span className="text-base font-bold text-destructive">
							{stats.damageTaken.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							Materials
						</span>
						<span className="text-base font-bold text-primary">
							{
								stats.materialsCollected
							}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-muted-foreground">
							Time
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

import {
	gameStats,
	lastWaveStats,
} from "@/gameStats";
import {
	PrevWaveStats,
	type WaveStats,
} from "@/shop/PrevWaveStats";
import { TotalGameStats } from "@/shop/TotalGameStats";
import { CentralCard } from "@/ui/Layout";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";

export function Failed() {
	const waveStats =
		lastWaveStats.value;
	const totalStats =
		gameStats.value;

	return (
		<CentralCard>
			<Card className="max-w-2xl w-full">
				<CardHeader className="text-center pb-2">
					<h1 className="text-6xl font-bold text-destructive">
						Game
						Over
					</h1>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{waveStats && (
						<PrevWaveStats
							stats={
								waveStats
							}
						/>
					)}
					<TotalGameStats
						stats={
							totalStats
						}
					/>
					<div className="flex justify-center pt-4">
						<Button
							asChild
							variant="default"
							size="lg"
						>
							<a href="/">
								Return
								to
								Main
								Menu
							</a>
						</Button>
					</div>
				</CardContent>
			</Card>
		</CentralCard>
	);
}

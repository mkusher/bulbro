import { dismissWaveSummary } from "@/currentGameProcess";
import { waveStats } from "@/gameStats";
import { t } from "@/i18n";
import { Button } from "@/ui/shadcn/button";
import { waveState } from "@/waveState";

type StatProps =
	{
		label: string;
		value: string;
		tone?:
			| "primary"
			| "destructive";
	};

function Stat({
	label,
	value,
	tone = "primary",
}: StatProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-xs uppercase tracking-wide text-white/70">
				{
					label
				}
			</span>
			<span
				className={`text-3xl font-bold ${tone === "destructive" ? "text-destructive" : "text-primary"}`}
			>
				{
					value
				}
			</span>
		</div>
	);
}

/**
 * Overlay shown on top of the frozen game canvas when a wave is won.
 * Displays the stats of the finished wave and lets the player proceed to the shop.
 */
export function WaveEndSummary() {
	// Wave stats are reset only when the next wave starts, so they still
	// describe the wave that just ended (also on network clients).
	const stats =
		waveStats.value;
	const wave =
		waveState
			.value
			.round
			.wave;

	return (
		<div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
			<div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-white/10 bg-black/50 p-6 text-white shadow-2xl backdrop-blur-[2px]">
				<h1 className="text-center text-4xl font-bold">
					{t(
						"waveEnd.title",
						{
							wave,
						},
					)}
				</h1>
				<div className="grid w-full grid-cols-2 gap-4">
					<Stat
						label={t(
							"stats.enemies",
						)}
						value={stats.enemiesKilled.toLocaleString()}
					/>
					<Stat
						label={t(
							"stats.materials",
						)}
						value={stats.materialsCollected.toLocaleString()}
					/>
					<Stat
						label={t(
							"stats.damage",
						)}
						value={stats.damageDealt.toLocaleString()}
					/>
					<Stat
						label={t(
							"stats.taken",
						)}
						value={stats.damageTaken.toLocaleString()}
						tone="destructive"
					/>
				</div>
				<Button
					size="lg"
					className="w-full max-w-48"
					autoFocus
					onClick={
						dismissWaveSummary
					}
				>
					{t(
						"waveEnd.next",
					)}
				</Button>
			</div>
		</div>
	);
}

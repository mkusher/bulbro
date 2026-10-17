import { useState } from "preact/hooks";
import { dismissWaveSummary } from "@/currentGameProcess";
import { waveStats } from "@/gameStats";
import { t } from "@/i18n";
import { Button } from "@/ui/shadcn/button";
import { TypingText } from "@/ui/TypingText";
import { waveState } from "@/waveState";

type StatProps =
	{
		label: string;
		value: string;
		tone?:
			| "primary"
			| "destructive";
		/** Whether the stat shows up, it is hidden until the title is typed */
		isShown: boolean;
		index: number;
	};

/** Time between two stats showing up */
const statStaggerMs = 90;

function Stat({
	label,
	value,
	tone = "primary",
	isShown,
	index,
}: StatProps) {
	return (
		<div
			className={`flex flex-col items-center gap-1 ${isShown ? "animate-in fade-in slide-in-from-bottom-3 zoom-in-90 duration-300" : "invisible"}`}
			style={{
				animationDelay: `${index * statStaggerMs}ms`,
				animationFillMode:
					"both",
			}}
		>
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
 * It pops in, types its title letter by letter and then reveals the stats of
 * the finished wave. The player proceeds to the shop with the Next button.
 */
export function WaveEndSummary() {
	const [
		isTitleTyped,
		setTitleTyped,
	] =
		useState(
			false,
		);
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
		<div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
			<div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-white/10 bg-black/50 p-6 text-white shadow-2xl backdrop-blur-[2px] animate-in fade-in zoom-in-75 slide-in-from-top-8 duration-500 ease-out">
				<h1 className="text-center text-4xl font-bold">
					<TypingText
						text={t(
							"waveEnd.title",
							{
								wave,
							},
						)}
						startDelayMs={
							450
						}
						onDone={() =>
							setTitleTyped(
								true,
							)
						}
					/>
				</h1>
				<div className="grid w-full grid-cols-2 gap-4">
					<Stat
						isShown={
							isTitleTyped
						}
						index={
							0
						}
						label={t(
							"stats.enemies",
						)}
						value={stats.enemiesKilled.toLocaleString()}
					/>
					<Stat
						isShown={
							isTitleTyped
						}
						index={
							1
						}
						label={t(
							"stats.materials",
						)}
						value={stats.materialsCollected.toLocaleString()}
					/>
					<Stat
						isShown={
							isTitleTyped
						}
						index={
							2
						}
						label={t(
							"stats.damage",
						)}
						value={stats.damageDealt.toLocaleString()}
					/>
					<Stat
						isShown={
							isTitleTyped
						}
						index={
							3
						}
						label={t(
							"stats.taken",
						)}
						value={stats.damageTaken.toLocaleString()}
						tone="destructive"
					/>
				</div>
				<Button
					size="lg"
					className={`w-full max-w-48 ${isTitleTyped ? "animate-in fade-in zoom-in-90 duration-300" : "opacity-0"}`}
					style={{
						animationDelay: `${4 * statStaggerMs}ms`,
						animationFillMode:
							"both",
					}}
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

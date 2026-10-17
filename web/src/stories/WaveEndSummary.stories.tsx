import { useMemo } from "preact/hooks";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions/well-rounded";
import { waveSummaryDismissed } from "@/currentGameProcess";
import {
	aphidEnemy,
	babyEnemy,
	beetleWarrior,
} from "@/enemies-definitions";
import { spawnEnemy } from "@/enemy";
import { waveStats } from "@/gameStats";
import { WaveEndSummary } from "@/screens/WaveEndSummary";
import type { WaveStats } from "@/shop/PrevWaveStats";
import { Button } from "@/ui/shadcn/button";
import {
	type WaveState,
	waveState,
} from "@/waveState";
import { StorybookGameScene } from "./StorybookGameScene";
import { createGameState } from "./storyHelpers";

export default {
	title:
		"Screens/Wave end summary",
	component:
		WaveEndSummary,
};

function createFinishedWaveState(
	wave: number,
): WaveState {
	const bulbro =
		spawnBulbro(
			"player-1",
			"normal",
			{
				x: 1000,
				y: 750,
			},
			0,
			0,
			{
				...wellRoundedBulbro,
				weapons:
					[
						...wellRoundedBulbro.defaultWeapons,
					],
			},
		);
	const enemies =
		[
			spawnEnemy(
				"enemy-1",
				{
					x: 1250,
					y: 700,
				},
				babyEnemy,
			),
			spawnEnemy(
				"enemy-2",
				{
					x: 800,
					y: 950,
				},
				aphidEnemy,
			),
			spawnEnemy(
				"enemy-3",
				{
					x: 1300,
					y: 950,
				},
				beetleWarrior,
			),
		];
	const objects =
		[
			{
				x: 900,
				y: 650,
			},
			{
				x: 1100,
				y: 850,
			},
			{
				x: 1180,
				y: 620,
			},
		].map(
			(
				position,
				i,
			) => ({
				type: "material" as const,
				id: `material-${i}`,
				position,
				value: 1,
			}),
		);

	return createGameState(
		{
			players:
				[
					bulbro,
				],
			enemies,
			objects,
			round:
				{
					isRunning: false,
					duration: 60,
					wave,
					difficulty: 0,
					startedAt:
						Date.now(),
				},
		},
	);
}

function WaveEndOverGame({
	stats,
}: {
	stats: WaveStats;
}) {
	const state =
		useMemo(() => {
			const finishedState =
				createFinishedWaveState(
					stats.wave,
				);
			waveState.value =
				finishedState;
			waveStats.value =
				stats;
			waveSummaryDismissed.value = false;
			return finishedState;
		}, [
			stats,
		]);

	return (
		<div
			style={{
				height:
					"100vh",
				width:
					"100%",
			}}
		>
			<StorybookGameScene
				initialState={
					state
				}
				showGameStats={
					false
				}
				showTouchControls={
					false
				}
				enableKeyboard={
					false
				}
			/>
			{waveSummaryDismissed.value ? (
				<div className="fixed inset-x-0 bottom-4 z-30 flex justify-center">
					<Button
						onClick={() => {
							waveSummaryDismissed.value = false;
						}}
					>
						Next
						clicked
						—
						show
						summary
						again
					</Button>
				</div>
			) : (
				<WaveEndSummary />
			)}
		</div>
	);
}

export const FirstWave =
	{
		render:
			() => (
				<WaveEndOverGame
					stats={{
						wave: 1,
						enemiesKilled: 24,
						damageDealt: 1840,
						damageTaken: 12,
						materialsCollected: 19,
						survivalTime: 60,
					}}
				/>
			),
	};

export const LateWave =
	{
		render:
			() => (
				<WaveEndOverGame
					stats={{
						wave: 18,
						enemiesKilled: 1342,
						damageDealt: 284650,
						damageTaken: 3870,
						materialsCollected: 1105,
						survivalTime: 90,
					}}
				/>
			),
	};

export const NoKills =
	{
		render:
			() => (
				<WaveEndOverGame
					stats={{
						wave: 3,
						enemiesKilled: 0,
						damageDealt: 0,
						damageTaken: 0,
						materialsCollected: 0,
						survivalTime: 60,
					}}
				/>
			),
	};

import type { TotalGameStats as TotalGameStatsType } from "@/gameStats";
import { TotalGameStats } from "@/shop/TotalGameStats";

export default {
	title:
		"Shop/TotalGameStats",
	component:
		TotalGameStats,
};

// Default total game stats
export const DefaultStats =
	{
		render:
			(
				args: any,
			) => (
				<TotalGameStats
					{...args}
				/>
			),
		args: {
			stats:
				{
					wavesCompleted: 5,
					enemiesKilled: 187,
					damageDealt: 68420,
					damageTaken: 3250,
					materialsCollected: 156,
					totalSurvivalTime: 300,
				} as TotalGameStatsType,
		},
	};

// High performance game
export const HighPerformance =
	{
		render:
			(
				args: any,
			) => (
				<TotalGameStats
					{...args}
				/>
			),
		args: {
			stats:
				{
					wavesCompleted: 15,
					enemiesKilled: 850,
					damageDealt: 425000,
					damageTaken: 5200,
					materialsCollected: 720,
					totalSurvivalTime: 900,
				} as TotalGameStatsType,
		},
	};

// Early game over (failed on first wave)
export const EarlyGameOver =
	{
		render:
			(
				args: any,
			) => (
				<TotalGameStats
					{...args}
				/>
			),
		args: {
			stats:
				{
					wavesCompleted: 1,
					enemiesKilled: 8,
					damageDealt: 2450,
					damageTaken: 100,
					materialsCollected: 5,
					totalSurvivalTime: 35,
				} as TotalGameStatsType,
		},
	};

// Perfect run (no damage taken)
export const PerfectRun =
	{
		render:
			(
				args: any,
			) => (
				<TotalGameStats
					{...args}
				/>
			),
		args: {
			stats:
				{
					wavesCompleted: 10,
					enemiesKilled: 520,
					damageDealt: 195000,
					damageTaken: 0,
					materialsCollected: 480,
					totalSurvivalTime: 600,
				} as TotalGameStatsType,
		},
	};

// Empty stats (edge case)
export const EmptyStats =
	{
		render:
			(
				args: any,
			) => (
				<TotalGameStats
					{...args}
				/>
			),
		args: {
			stats:
				{
					wavesCompleted: 0,
					enemiesKilled: 0,
					damageDealt: 0,
					damageTaken: 0,
					materialsCollected: 0,
					totalSurvivalTime: 0,
				} as TotalGameStatsType,
		},
	};

import {
	gameStats,
	lastWaveStats,
} from "@/gameStats";
import { Failed as FailedScreen } from "@/screens/Failed";

export default {
	title:
		"Screens/Failed screen",
	component:
		FailedScreen,
};

export const Failed =
	{
		render:
			() => {
				// Set up mock stats for the story
				lastWaveStats.value =
					{
						wave: 5,
						enemiesKilled: 42,
						damageDealt: 15680,
						damageTaken: 890,
						materialsCollected: 38,
						survivalTime: 124,
					};
				gameStats.value =
					{
						wavesCompleted: 5,
						enemiesKilled: 187,
						damageDealt: 68420,
						damageTaken: 3250,
						materialsCollected: 156,
						totalSurvivalTime: 542,
					};
				return (
					<FailedScreen />
				);
			},
	};

export const FirstWaveFailed =
	{
		render:
			() => {
				// Failed on first wave
				lastWaveStats.value =
					{
						wave: 1,
						enemiesKilled: 8,
						damageDealt: 2450,
						damageTaken: 100,
						materialsCollected: 5,
						survivalTime: 35,
					};
				gameStats.value =
					{
						wavesCompleted: 1,
						enemiesKilled: 8,
						damageDealt: 2450,
						damageTaken: 100,
						materialsCollected: 5,
						totalSurvivalTime: 35,
					};
				return (
					<FailedScreen />
				);
			},
	};

export const NoWaveStats =
	{
		render:
			() => {
				// No wave stats available (edge case)
				lastWaveStats.value =
					undefined;
				gameStats.value =
					{
						wavesCompleted: 0,
						enemiesKilled: 0,
						damageDealt: 0,
						damageTaken: 0,
						materialsCollected: 0,
						totalSurvivalTime: 0,
					};
				return (
					<FailedScreen />
				);
			},
	};

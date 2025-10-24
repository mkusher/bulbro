import type { EnemyEvent } from "@/game-events/GameEvents";
import type { EnemyState } from "./EnemyState";
import type { WaveState } from "@/waveState";
import type { DeltaTime, NowTime } from "@/time";

export interface EnemyBehaviors {
	/**
	 * Handles movement logic for an enemy
	 * @param currentEnemy - The current state of the enemy
	 * @param waveState - The current wave state containing all game entities
	 * @param now - Number of ms passed since wave start
	 * @param deltaTime - Time elapsed since last update in seconds
	 * @returns New enemy state after movement
	 */
	move(
		currentEnemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[];

	/**
	 * Handles attacking logic for an enemy
	 * @param currentEnemy - The current state of the enemy
	 * @param waveState - The current wave state containing all game entities
	 * @param now - Number of ms passed since wave start
	 * @param deltaTime - Time elapsed since last update in seconds
	 * @returns New enemy state after potential attack
	 */
	attack(
		currentEnemy: EnemyState,
		waveState: WaveState,
		now: NowTime,
		deltaTime: DeltaTime,
	): EnemyEvent[];
}

import type { Size } from "../geometry";

export {
	buildEnemyCharacterForWave,
	buildWaveStats,
	ENDLESS_START_WAVE,
	getEndlessFactor,
} from "./buildEnemyCharacterForWave";
export type { EnemyCharacter } from "./EnemyCharacter";
export type { EnemyStats } from "./EnemyState";
export {
	EnemyState,
	spawnEnemy,
} from "./EnemyState";
export type { EnemySprite } from "./Sprite";

export const ENEMY_SIZE: Size =
	{
		width: 120,
		height: 90,
	};

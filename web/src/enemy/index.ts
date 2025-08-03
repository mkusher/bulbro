import type { Size } from "../geometry";
export type { EnemyCharacter } from "./EnemyCharacter";
export type { EnemyStats } from "./EnemyState";
export { EnemyState, spawnEnemy } from "./EnemyState";
export type { EnemySprite } from "./Sprite";

export const ENEMY_SIZE: Size = { width: 40, height: 30 };

import type { Size } from "../geometry";
export type { EnemyCharacter } from "./EnemyCharacter";
export type { EnemyStats } from "./EnemyState";
export { EnemyState, spawnEnemy } from "./EnemyState";
export type { EnemySprite } from "./Sprite";

export const ENEMY_SIZE: Size = { width: 16, height: 16 };

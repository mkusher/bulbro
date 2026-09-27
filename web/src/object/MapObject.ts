import type { Consumable } from "./ConsumableState";
import type { Material } from "./MaterialState";
import type { SpawningEnemy } from "./SpawningEnemyState";

export type MapObject =
	| Consumable
	| Material
	| SpawningEnemy;

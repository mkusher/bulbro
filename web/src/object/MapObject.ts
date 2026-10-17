import type { Structure } from "@/engineering/structures";
import type { Consumable } from "./ConsumableState";
import type { Material } from "./MaterialState";
import type { SpawningEnemy } from "./SpawningEnemyState";
export type MapObject =
	| Structure
	| Consumable
	| Material
	| SpawningEnemy;

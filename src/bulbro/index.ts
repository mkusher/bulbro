import type { Size } from "../geometry";
import type { Stats, Bulbro, Player } from "./BulbroCharacter";
import { BulbroState, spawnBulbro } from "./BulbroState";
import { BulbroSprite } from "./Sprite";

export type { Stats, Bulbro, Player };
export { BulbroState, spawnBulbro, BulbroSprite as PlayerSprite };
export const BULBRO_SIZE: Size = { width: 18, height: 20 };

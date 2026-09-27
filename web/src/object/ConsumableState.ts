import type { Position } from "../geometry";

/** HP restored when a consumable is picked up */
export const CONSUMABLE_HEAL_AMOUNT = 3;

export type Consumable =
	{
		type: "consumable";
		id: string;
		position: Position;
		/** HP restored on pickup */
		hp: number;
	};

export function consumableIdFor(
	enemyId: string,
): string {
	return `${enemyId}-consumable`;
}

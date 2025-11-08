import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * An explorer Bulbro character specialized in speed and exploration.
 */
export const grandpa: Bulbro =
	{
		...baseBulbro,
		id: "grandpa",
		name: "Grandpa",
		statBonuses:
			{
				speed:
					-20, // -20% speed
				pickupRange: 50, // +50% pickup range
			},
		style:
			{
				faceType:
					"old",
				wearingItems:
					[],
			},
	};

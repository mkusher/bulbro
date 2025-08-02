export const potatoBeetleBaby = [
	{
		position: {
			x: 96,
			y: 218,
		},
		size: {
			width: 187,
			height: 130,
		},
	},
] as const;

export const enemyTypes = ["potatoBeetleBaby"] as const;
export type EnemyType = (typeof enemyTypes)[number];

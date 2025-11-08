export const potatoBeetleBaby =
	{
		position:
			{
				x: 96,
				y: 218,
			},
		size: {
			width: 187,
			height: 130,
		},
		gameSize:
			{
				width: 40,
				height: 30,
			},
	} as const;

export const potatoBeetleWarrior =
	{
		position:
			{
				x: 84,
				y: 543,
			},
		size: {
			width: 210,
			height: 185,
		},
		gameSize:
			{
				width: 50,
				height: 50,
			},
	} as const;

export const aphid =
	{
		position:
			{
				x: 104,
				y: 375,
			},
		size: {
			width: 172,
			height: 156,
		},
		gameSize:
			{
				width: 40,
				height: 30,
			},
	} as const;

export const coloradoPotatoBeetleWarrior =
	{
		position:
			{
				x: 375,
				y: 45,
			},
		size: {
			width: 320,
			height: 160,
		},
		gameSize:
			{
				width: 60,
				height: 30,
			},
	};

export const hedghehog =
	{
		position:
			{
				x: 365,
				y: 550,
			},
		size: {
			width: 200,
			height: 200,
		},
		gameSize:
			{
				width: 45,
				height: 45,
			},
	};

export const tree =
	{
		position:
			{
				x: 365,
				y: 550,
			},
		size: {
			width: 200,
			height: 200,
		},
		gameSize:
			{
				width: 45,
				height: 45,
			},
	};

export const enemyTypes =
	[
		"potatoBeetleBaby",
		"potatoBeetleWarrior",
		"aphid",
		"coloradoPotatoBeetleWarrior",
		"hedghehog",
		"tree",
	] as const;
export type EnemyType =
	(typeof enemyTypes)[number];

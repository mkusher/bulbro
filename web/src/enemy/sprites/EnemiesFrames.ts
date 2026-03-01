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
				width: 30,
				height: 20,
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
				width: 30,
				height: 30,
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

export const coloradoBeetle =
	{
		position:
			{
				x: 70,
				y: 23,
			},
		size: {
			width: 256,
			height: 190,
		},
		gameSize:
			{
				width: 50,
				height: 30,
			},
	};

export const hedghehog =
	{
		position:
			{
				x: 84,
				y: 730,
			},
		size: {
			width: 210,
			height: 210,
		},
		gameSize:
			{
				width: 50,
				height: 50,
			},
	};

export const wildBoar =
	{
		position:
			{
				x: 360,
				y: 20,
			},
		size: {
			width: 285,
			height: 200,
		},
		gameSize:
			{
				width: 50,
				height: 40,
			},
	};

export const badger =
	{
		position:
			{
				x: 360,
				y: 220,
			},
		size: {
			width: 285,
			height: 200,
		},
		gameSize:
			{
				width: 50,
				height: 40,
			},
	};

export const roach =
	{
		position:
			{
				x: 350,
				y: 425,
			},
		size: {
			width: 275,
			height: 210,
		},
		gameSize:
			{
				width: 50,
				height: 40,
			},
	};

export const beetleArcher =
	{
		position:
			{
				x: 359,
				y: 655,
			},
		size: {
			width: 251,
			height: 170,
		},
		gameSize:
			{
				width: 50,
				height: 30,
			},
	};

export const tree =
	{
		position:
			{
				x: 350,
				y: 840,
			},
		size: {
			width: 260,
			height: 320,
		},
		gameSize:
			{
				width: 50,
				height: 75,
			},
	};

export const enemyTypes =
	[
		"aphid",
		"potatoBeetleBaby",
		"potatoBeetleWarrior",
		"coloradoBeetle",
		"beetleArcher",
		"hedghehog",
		"wildBoar",
		"badger",
		"roach",
		"tree",
	] as const;
export type EnemyType =
	(typeof enemyTypes)[number];

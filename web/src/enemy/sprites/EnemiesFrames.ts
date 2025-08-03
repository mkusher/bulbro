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
		gameSize: {
			width: 40,
			height: 30,
		},
	},
	{
		position: {
			x: 920,
			y: 218,
		},
		size: {
			width: 187,
			height: 130,
		},
		gameSize: {
			width: 40,
			height: 30,
		},
	},
] as const;

export const potatoBeetleWarrior = [
	{
		position: {
			x: 84,
			y: 543,
		},
		size: {
			width: 210,
			height: 185,
		},
		gameSize: {
			width: 50,
			height: 50,
		},
	},
	{
		position: {
			x: 920,
			y: 543,
		},
		size: {
			width: 210,
			height: 185,
		},
		gameSize: {
			width: 50,
			height: 50,
		},
	},
] as const;

export const aphid = [
	{
		position: {
			x: 104,
			y: 375,
		},
		size: {
			width: 172,
			height: 156,
		},
		gameSize: {
			width: 40,
			height: 30,
		},
	},
	{
		position: {
			x: 930,
			y: 375,
		},
		size: {
			width: 172,
			height: 156,
		},
		gameSize: {
			width: 40,
			height: 30,
		},
	},
] as const;

export const enemyTypes = [
	"potatoBeetleBaby",
	"potatoBeetleWarrior",
	"aphid",
] as const;
export type EnemyType = (typeof enemyTypes)[number];

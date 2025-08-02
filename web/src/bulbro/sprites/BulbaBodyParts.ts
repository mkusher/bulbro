export const faces = {
	normal: {
		position: {
			x: 24,
			y: 483,
		},
		size: {
			width: 131,
			height: 72,
		},
	},
	evil: {
		position: {
			x: 190,
			y: 483,
		},
		size: {
			width: 131,
			height: 72,
		},
	},
	vampire: {
		position: {
			x: 345,
			y: 483,
		},
		size: {
			width: 131,
			height: 72,
		},
	},
	old: {
		position: {
			x: 535,
			y: 483,
		},
		size: {
			width: 131,
			height: 122,
		},
	},
	crazy: {
		position: {
			x: 700,
			y: 483,
		},
		size: {
			width: 131,
			height: 122,
		},
	},
	cyborg: {
		position: {
			x: 900,
			y: 483,
		},
		size: {
			width: 176,
			height: 72,
		},
	},
	king: {
		position: {
			x: 1140,
			y: 382,
		},
		size: {
			width: 131,
			height: 240,
		},
		offset: {
			x: 0,
			y: -40,
		},
	},
} as const;

export type FaceType = keyof typeof faces;
export const faceTypes = Object.keys(faces) as FaceType[];

export const legs = [
	{
		position: {
			x: 24,
			y: 221,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 210,
			y: 221,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 400,
			y: 221,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 585,
			y: 221,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 768,
			y: 221,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 24,
			y: 320,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 237,
			y: 320,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 445,
			y: 320,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
	{
		position: {
			x: 650,
			y: 320,
		},
		size: {
			width: 120,
			height: 74,
		},
	},
] as const;

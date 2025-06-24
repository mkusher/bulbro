import type { Position } from "../geometry";

export type Material = {
	type: "material";
	id: string;
	position: Position;
	value: number;
};

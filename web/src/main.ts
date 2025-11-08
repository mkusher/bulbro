import {
	h,
	render,
} from "preact";
import { Game } from "./Game";

render(
	h(
		Game,
		{},
	),
	document.body,
);

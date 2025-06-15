import { render, h } from "preact";
import { GameProcess } from "./GameProcess";
import { Game } from "./Game";

// Bootstrap the game
const gameProcess = new GameProcess();

render(h(Game, { gameProcess }), document.body);

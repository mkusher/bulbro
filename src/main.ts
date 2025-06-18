import { render, h } from "preact";
import { GameProcess } from "./GameProcess";
import { Game } from "./Game";

// Bootstrap the game
const gameProcess = new GameProcess(localStorage.getItem("__enable_debug") === "1");

render(h(Game, { gameProcess }), document.body);

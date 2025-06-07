import { wellRoundedBulbro } from "./characters-definitions";
import { GameProcess } from "./GameProcess";

// Bootstrap the game
const game = new GameProcess(wellRoundedBulbro);
await game.start();

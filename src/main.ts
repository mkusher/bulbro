import { wellRoundedBulbro } from "./characters-definitions";
import { GameProcess } from "./GameProcess";
import { fist, pistol, smg } from "./weapons-definitions";

// Bootstrap the game
const game = new GameProcess({
	...wellRoundedBulbro,
	weapons: [fist, pistol, smg],
});
await game.start();

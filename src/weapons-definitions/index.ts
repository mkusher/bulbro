import { brick } from "./brick";
import { fist } from "./fist";
import { hand } from "./hand";
import { knife } from "./knife";
import { doubleBarrelShotgun } from "./double-barrel-shotgun";
import { laserGun } from "./laser-gun";
import { pistol } from "./pistol";
import { smg } from "./smg";

export { brick, fist, hand, knife, doubleBarrelShotgun, laserGun, pistol, smg };

export const weapons = [
	brick,
	fist,
	hand,
	knife,
	doubleBarrelShotgun,
	laserGun,
	pistol,
	smg,
] as const;

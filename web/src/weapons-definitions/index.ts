import { ak47 } from "./ak47";
import { brick } from "./brick";
import { doubleBarrelShotgun } from "./double-barrel-shotgun";
import { fist } from "./fist";
import { hand } from "./hand";
import { knife } from "./knife";
import { laserGun } from "./laser-gun";
import { pistol } from "./pistol";
import { smg } from "./smg";
import { sword } from "./sword";

export {
	ak47,
	brick,
	doubleBarrelShotgun,
	fist,
	hand,
	knife,
	laserGun,
	pistol,
	smg,
	sword,
};

export const weapons =
	[
		ak47,
		brick,
		doubleBarrelShotgun,
		fist,
		hand,
		knife,
		laserGun,
		pistol,
		smg,
		sword,
	] as const;

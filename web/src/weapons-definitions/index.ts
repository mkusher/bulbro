import { ak47 } from "./ak47";
import { aphidGun } from "./aphid-gun";
import { brick } from "./brick";
import { doubleBarrelShotgun } from "./double-barrel-shotgun";
import { fist } from "./fist";
import { hand } from "./hand";
import { knife } from "./knife";
import { laserGun } from "./laser-gun";
import { orcFist } from "./orc-fist";
import { orcSlowGun } from "./orc-gun";
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
	// Enemy weapons
	aphidGun,
	orcFist,
	orcSlowGun,
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

export const enemyWeapons =
	[
		aphidGun,
		orcFist,
		orcSlowGun,
	] as const;

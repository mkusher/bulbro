import { ak47 } from "./ak47";
import { aphidGun } from "./aphid-gun";
import { bazooka } from "./bazooka";
import { brick } from "./brick";
import { doubleBarrelShotgun } from "./double-barrel-shotgun";
import { fist } from "./fist";
import { flareGun } from "./flare-gun";
import { grenade } from "./grenade";
import { hand } from "./hand";
import { knife } from "./knife";
import { laserGun } from "./laser-gun";
import { machineGun } from "./machine-gun";
import { orcFist } from "./orc-fist";
import { orcSlowGun } from "./orc-gun";
import { pistol } from "./pistol";
import { smg } from "./smg";
import { sword } from "./sword";

export {
	ak47,
	// Enemy weapons
	aphidGun,
	bazooka,
	brick,
	doubleBarrelShotgun,
	fist,
	flareGun,
	grenade,
	hand,
	knife,
	laserGun,
	machineGun,
	orcFist,
	orcSlowGun,
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
		flareGun,
		grenade,
		machineGun,
		bazooka,
	] as const;

export const enemyWeapons =
	[
		aphidGun,
		orcFist,
		orcSlowGun,
	] as const;

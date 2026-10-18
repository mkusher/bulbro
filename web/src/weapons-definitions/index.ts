import { ak47 } from "./ak47";
import { aphidGun } from "./aphid-gun";
import { bazooka } from "./bazooka";
import { boomerang } from "./boomerang";
import { brick } from "./brick";
import { doubleBarrelShotgun } from "./double-barrel-shotgun";
import {
	pruner,
	screwdriver,
	wrench,
} from "./engineering-tools";
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
import { revolver } from "./revolver";
import { smg } from "./smg";
import { spear } from "./spear";
import { sword } from "./sword";

export {
	ak47,
	// Enemy weapons
	aphidGun,
	bazooka,
	boomerang,
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
	pruner,
	revolver,
	screwdriver,
	smg,
	spear,
	sword,
	wrench,
};

export const weapons =
	[
		pruner,
		screwdriver,
		wrench,
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
		spear,
		revolver,
		boomerang,
	] as const;

export const enemyWeapons =
	[
		aphidGun,
		orcFist,
		orcSlowGun,
	] as const;

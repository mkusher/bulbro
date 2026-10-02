import { aphidEnemy } from "./aphid";
import { babyEnemy } from "./baby";
import { badger } from "./badger";
import { beetleArcher } from "./beetleArcher";
import { beetleWarrior } from "./beetleWarrior";
import { coloradoBeetle } from "./coloradoBeetle";
import { hedghehog } from "./hedghehog";
import { roach } from "./roach";
import { tree } from "./tree";
import { wildBoar } from "./wildBoar";

export {
	aphidEnemy,
	babyEnemy,
	badger,
	beetleArcher,
	beetleWarrior,
	coloradoBeetle,
	hedghehog,
	roach,
	tree,
	wildBoar,
};

export const allEnemies =
	[
		babyEnemy,
		aphidEnemy,
		beetleWarrior,
		coloradoBeetle,
		hedghehog,
		wildBoar,
		badger,
		roach,
		beetleArcher,
		tree,
	] as const;
export const allTypes =
	allEnemies.map(
		(
			e,
		) =>
			e.id,
	);

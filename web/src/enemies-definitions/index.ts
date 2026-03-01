import { aphidEnemy } from "./aphid";
import { babyEnemy } from "./baby";
import { beetleWarrior } from "./beetleWarrior";
import { coloradoBeetle } from "./coloradoBeetle";
import { beetleArcher } from "./beetleArcher";
import { hedghehog } from "./hedghehog";
import { wildBoar } from "./wildBoar";
import { badger } from "./badger";
import { roach } from "./roach";
import { tree } from "./tree";

export {
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

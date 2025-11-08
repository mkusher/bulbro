import { aphidEnemy } from "./aphid";
import { babyEnemy } from "./baby";
import { beetleWarrior } from "./beetle-warrior";

export {
	babyEnemy,
	aphidEnemy,
	beetleWarrior,
};

export const allEnemies =
	[
		babyEnemy,
		aphidEnemy,
		beetleWarrior,
	] as const;
export const allTypes =
	allEnemies.map(
		(
			e,
		) =>
			e.id,
	);

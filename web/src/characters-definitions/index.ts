import { berserker } from "./berserker";
import { cyborg } from "./cyborg";
import { evil } from "./evil";
import { grandpa } from "./grandpa";
import { king } from "./king";
import { medic } from "./medic";
import { vampire } from "./vampire";
import { wellRoundedBulbro } from "./well-rounded";

export {
	berserker,
	cyborg,
	evil,
	grandpa,
	king,
	medic,
	vampire,
	wellRoundedBulbro,
};

export const bulbros =
	[
		wellRoundedBulbro,
		vampire,
		grandpa,
		medic,
		berserker,
		king,
		cyborg,
		evil,
	];

export const findBulbroById =
	(
		id:
			| string
			| undefined,
	) => {
		return (
			bulbros.find(
				(
					bulbro,
				) =>
					bulbro.id ===
					id,
			) ??
			wellRoundedBulbro
		);
	};

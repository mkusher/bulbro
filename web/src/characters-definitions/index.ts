import { grandpa } from "./grandpa";
import { vampire } from "./vampire";
import { wellRoundedBulbro } from "./well-rounded";
import { medic } from "./medic";
import { berserker } from "./berserker";
import { king } from "./king";
import { cyborg } from "./cyborg";
import { evil } from "./evil";

export {
	wellRoundedBulbro,
	grandpa,
	vampire,
	medic,
	berserker,
	king,
	cyborg,
	evil,
};

export const bulbros = [
	wellRoundedBulbro,
	vampire,
	grandpa,
	medic,
	berserker,
	king,
	cyborg,
	evil,
];

export const findBulbroById = (id: string) => {
	return bulbros.find((bulbro) => bulbro.id === id) ?? wellRoundedBulbro;
};

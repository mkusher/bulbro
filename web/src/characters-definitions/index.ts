import { explorer } from "./explorer";
import { ranger } from "./ranger";
import { wellRoundedBulbro } from "./well-rounded";

export { wellRoundedBulbro, ranger, explorer };

export const bulbros = [wellRoundedBulbro, ranger, explorer];

export const findBulbroById = (id: string) => {
	return bulbros.find((bulbro) => bulbro.id === id) ?? wellRoundedBulbro;
};

import { useState, type FormEvent } from "preact/compat";
import type { Weapon } from "../weapon";
import { WeaponsSelect } from "./WeaponsSelect";

type Props = {
	startRound: (weapons: Weapon[]) => void;
};
export function PreRound({ startRound }: Props) {
	const [selectedWeapons, selectWeapons] = useState<Weapon[]>([]);
	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		startRound(selectedWeapons);
	};
	return (
		<form onSubmit={onSubmit}>
			<WeaponsSelect
				selectedWeapons={selectedWeapons}
				selectWeapons={selectWeapons}
			/>
			<button type="submit">Next wave</button>
		</form>
	);
}

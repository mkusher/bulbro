import { useState, type FormEvent } from "preact/compat";
import { WeaponsSelect } from "./WeaponsSelect";
import type { CurrentState } from "../currentState";
import { selectWeapons as selectWeaponsInState } from "../currentState";
import { fromWeaponState, toWeaponState } from "../weapon";

type Props = {
	startRound: (state: CurrentState) => void;
	state: CurrentState;
};

export function PreRound({ startRound, state }: Props) {
	const [currentState, setCurrentState] = useState(state);
	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		startRound(currentState);
	};
	return (
		<form onSubmit={onSubmit}>
			<div class="characters">
				{currentState.players.map((p) => (
					<div key={p.id} class="character">
						<h3>{p.type}</h3>
						<WeaponsSelect
							selectedWeapons={p.weapons.map(fromWeaponState)}
							selectWeapons={(weapons) =>
								setCurrentState(
									selectWeaponsInState(currentState, {
										type: "select-weapons",
										playerId: p.id,
										weapons: weapons.map(toWeaponState),
										now: Date.now(),
									}),
								)
							}
						/>
					</div>
				))}
			</div>
			<button type="submit">Start next wave</button>
		</form>
	);
}

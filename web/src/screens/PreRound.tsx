import { useState, type FormEvent } from "preact/compat";
import { WeaponsSelect } from "@/ui/WeaponsSelect";
import type { CurrentState } from "@/currentState";
import { selectWeapons as selectWeaponsInState } from "@/currentState";
import { fromWeaponState, toWeaponState } from "@/weapon";
import { CentralCard } from "@/ui/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";

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
		<CentralCard>
			<Card>
				<form className="flex flex-col gap-3" onSubmit={onSubmit}>
					<CardHeader>
						<h2>Next wave is: {currentState.round.wave + 1}</h2>
					</CardHeader>
					<CardContent>
						<div class="characters">
							{currentState.players.map((p) => (
								<div key={p.id} class="character">
									<h3>{p.type}</h3>
									<p>Materials: {p.materialsAvailable}</p>
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
					</CardContent>
					<CardFooter>
						<Button type="submit">Start next wave</Button>
					</CardFooter>
				</form>
			</Card>
		</CentralCard>
	);
}

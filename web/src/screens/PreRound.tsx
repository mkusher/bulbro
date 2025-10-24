import { useState, type FormEvent } from "preact/compat";
import { WeaponSelector } from "@/ui/WeaponSelector";
import type { WaveState } from "@/waveState";
import { selectWeapons as selectWeaponsInState } from "@/waveState";
import { fromWeaponState, toWeaponState, type Weapon } from "@/weapon";
import { CentralCard } from "@/ui/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { startWave } from "@/currentGameProcess";

type Props = {
	state: WaveState;
};

export function PreRound({ state }: Props) {
	const [currentState, setCurrentState] = useState(state);
	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		startWave(currentState);
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
									<WeaponSelector
										selectedWeapon={
											p.weapons.length > 0 && p.weapons[0]
												? fromWeaponState(p.weapons[0])
												: null
										}
										availableWeapons={[]}
										onChange={(weapon: Weapon | null) => {
											if (weapon) {
												setCurrentState(
													selectWeaponsInState(currentState, {
														type: "select-weapons",
														playerId: p.id,
														weapons: [toWeaponState(weapon)],
														now: Date.now(),
													}),
												);
											}
										}}
										allowDeselect={false}
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

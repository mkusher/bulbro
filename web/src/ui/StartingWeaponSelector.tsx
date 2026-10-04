import type { Bulbro } from "@/bulbro";
import { calculateStats } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { WeaponSelector } from "./WeaponSelector";

export function StartingWeaponSelector({
	bulbro,
	selections,
	onChange,
}: {
	bulbro: Bulbro;
	selections: (Weapon | null)[];
	onChange: (
		index: number,
		weapon: Weapon | null,
	) => void;
}) {
	const {
		startingWeapons,
		maxWeapons,
	} =
		calculateStats(
			bulbro.statBonuses,
		);
	const selectedCount =
		bulbro
			.weapons
			.length +
		selections.filter(
			Boolean,
		)
			.length;
	return (
		<div className="space-y-4">
			<p>
				Starting
				weapons:{" "}
				{
					selectedCount
				}{" "}
				/{" "}
				{
					startingWeapons
				}
				.
				Maximum
				weapons:{" "}
				{
					maxWeapons
				}
				.
			</p>
			{selections.map(
				(
					weapon,
					index,
				) => (
					<div
						key={
							index
						}
					>
						{selections.length >
							1 && (
							<h4>
								Weapon{" "}
								{index +
									1}
							</h4>
						)}
						<WeaponSelector
							availableWeapons={
								bulbro.availableWeapons
							}
							selectedWeapon={
								weapon
							}
							onChange={(
								next,
							) =>
								onChange(
									index,
									next,
								)
							}
						/>
					</div>
				),
			)}
		</div>
	);
}

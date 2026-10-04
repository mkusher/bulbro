import type { Bulbro } from "@/bulbro";
import { calculateStats } from "@/game-formulas";
import { t } from "@/i18n";
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
				{t(
					"character.startingWeaponsCount",
					{
						selected:
							selectedCount,
						total:
							startingWeapons,
						max: maxWeapons,
					},
				)}
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
								{t(
									"character.weaponNumber",
									{
										number:
											index +
											1,
									},
								)}
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

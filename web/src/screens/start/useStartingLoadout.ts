import { hasValidStartingWeapons } from "@bulbro/network-protocol";
import { useState } from "preact/hooks";
import type { Bulbro } from "@/bulbro";
import { calculateStats } from "@/game-formulas";
import type { Weapon } from "@/weapon";

export function useStartingLoadout(
	initialBulbro: Bulbro,
	preferredWeapon?: Weapon,
) {
	function initialSelections(
		bulbro: Bulbro,
	): (Weapon | null)[] {
		const stats =
			calculateStats(
				bulbro.statBonuses,
			);
		if (
			!Number.isSafeInteger(
				stats.startingWeapons,
			) ||
			stats.startingWeapons <
				0 ||
			!Number.isSafeInteger(
				stats.maxWeapons,
			) ||
			stats.startingWeapons >
				stats.maxWeapons
		)
			return [];
		return Array.from(
			{
				length:
					Math.max(
						0,
						stats.startingWeapons -
							bulbro
								.weapons
								.length,
					),
			},
			(
				_,
				index,
			) => {
				const candidate =
					bulbro
						.defaultWeapons[
						index
					] ??
					preferredWeapon;
				return (
					bulbro.availableWeapons.find(
						(
							weapon,
						) =>
							weapon.id ===
							candidate?.id,
					) ??
					null
				);
			},
		);
	}
	const [
		bulbro,
		changeBulbro,
	] =
		useState(
			initialBulbro,
		);
	const [
		selections,
		setSelections,
	] =
		useState(
			() =>
				initialSelections(
					initialBulbro,
				),
		);
	const weapons =
		selections.filter(
			(
				weapon,
			): weapon is Weapon =>
				weapon !==
				null,
		);
	return {
		bulbro,
		selections,
		weapons,
		isValid:
			hasValidStartingWeapons(
				{
					...bulbro,
					weapons:
						[
							...bulbro.weapons,
							...weapons,
						],
				},
			) &&
			weapons.every(
				(
					weapon,
				) =>
					bulbro.availableWeapons.some(
						(
							available,
						) =>
							available.id ===
							weapon.id,
					),
			),
		selectBulbro(
			next: Bulbro,
		) {
			changeBulbro(
				next,
			);
			setSelections(
				initialSelections(
					next,
				),
			);
		},
		selectWeapon(
			index: number,
			weapon: Weapon | null,
		) {
			setSelections(
				(
					previous,
				) =>
					previous.map(
						(
							current,
							slot,
						) =>
							slot ===
							index
								? weapon
								: current,
					),
			);
		},
	};
}

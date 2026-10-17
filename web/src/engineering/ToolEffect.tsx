import { t } from "@/i18n";
import type { WeaponType } from "@/weapon";
import type { WeaponTier } from "@/weapon/WeaponState";
import {
	gardenIntervals,
	mineIntervals,
	wrenchTurrets,
} from "./structures";

export function ToolEffect({
	type,
	tier = 1,
}: {
	type: WeaponType;
	tier?: WeaponTier;
}) {
	let text: string;
	if (
		type ===
		"pruner"
	)
		text =
			t(
				"weapon.effect.pruner",
				{
					interval:
						gardenIntervals[
							tier -
								1
						]! /
						1000,
				},
			);
	else if (
		type ===
		"screwdriver"
	)
		text =
			t(
				"weapon.effect.screwdriver",
				{
					interval:
						mineIntervals[
							tier -
								1
						]! /
						1000,
				},
			);
	else if (
		type ===
		"wrench"
	)
		text =
			t(
				"weapon.effect.wrench",
				{
					turret:
						t(
							`item.name.${wrenchTurrets[tier - 1]!}`,
						),
				},
			);
	else
		return null;
	return (
		<p className="text-xs text-green-700 leading-tight">
			{
				text
			}
		</p>
	);
}

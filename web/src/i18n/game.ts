import type { Stats } from "@/bulbro/BulbroCharacter";
import type { WeaponStats } from "@/weapon/WeaponState";
import {
	t,
	type MessageKey,
} from "./index";

const statNames =
	{
		maxHp:
			"stat.maxHp",
		hpRegeneration:
			"stat.hpRegeneration",
		lifeSteal:
			"stat.lifeSteal",
		damage:
			"stat.damage",
		meleeDamage:
			"stat.meleeDamage",
		rangedDamage:
			"stat.rangedDamage",
		elementalDamage:
			"stat.elementalDamage",
		attackSpeed:
			"stat.attackSpeed",
		critChance:
			"stat.critChance",
		engineering:
			"stat.engineering",
		range:
			"stat.range",
		armor:
			"stat.armor",
		dodge:
			"stat.dodge",
		speed:
			"stat.speed",
		luck: "stat.luck",
		harvesting:
			"stat.harvesting",
		pickupRange:
			"stat.pickupRange",
		knockback:
			"stat.knockback",
		cooldown:
			"stat.cooldown",
		critMultiplier:
			"stat.critMultiplier",
	} satisfies Record<
		| keyof Stats
		| Exclude<
				keyof WeaponStats,
				"scaling"
		  >,
		MessageKey
	>;

export function formatStatName(
	key: string,
): string {
	if (
		Object.hasOwn(
			statNames,
			key,
		)
	)
		return t(
			statNames[
				key as keyof typeof statNames
			],
		);
	return key
		.replace(
			/([A-Z])/g,
			" $1",
		)
		.replace(
			/^./,
			(
				str,
			) =>
				str.toUpperCase(),
		)
		.trim();
}

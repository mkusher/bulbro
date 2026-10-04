import type { StatBonus } from "@/game-formulas";
import type { MessageKey } from "@/i18n";
import {
	type UpgradeTier,
	upgradeTierChance,
	upgradeTiers,
} from "@/upgrades/Upgrades";

/** Item tiers I–IV, as in Brotato. */
export type ItemTier =
	UpgradeTier;

/** A shop item: permanently changes stats while owned. */
export type ItemDefinition =
	{
		id: string;
		/** Localized display name, resolved when rendered. */
		nameKey: MessageKey;
		tier: ItemTier;
		/** Price on wave 1, before wave scaling and inflation */
		basePrice: number;
		bonuses: StatBonus;
	};

/**
 * Brotato items that only change stats
 * (https://brotato.wiki.spellsandguns.com/Items).
 */
export const itemDefinitions: ItemDefinition[] =
	[
		{
			id: "acid",
			nameKey:
				"item.name.acid",
			tier: 2,
			basePrice: 65,
			bonuses:
				{
					maxHp: 8,
					dodge:
						-2,
					knockback:
						-2,
				},
		},
		{
			id: "alienMagic",
			nameKey:
				"item.name.alienMagic",
			tier: 3,
			basePrice: 85,
			bonuses:
				{
					maxHp: 8,
					hpRegeneration: 3,
					luck:
						-8,
				},
		},
		{
			id: "alienTongue",
			nameKey:
				"item.name.alienTongue",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					pickupRange: 30,
					knockback: 1,
				},
		},
		{
			id: "alloy",
			nameKey:
				"item.name.alloy",
			tier: 3,
			basePrice: 80,
			bonuses:
				{
					meleeDamage: 3,
					rangedDamage: 3,
					elementalDamage: 3,
					engineering: 3,
					critChance: 5,
					dodge:
						-6,
				},
		},
		{
			id: "banner",
			nameKey:
				"item.name.banner",
			tier: 2,
			basePrice: 55,
			bonuses:
				{
					range: 20,
					attackSpeed: 10,
					knockback:
						-5,
				},
		},
		{
			id: "bat",
			nameKey:
				"item.name.bat",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					lifeSteal: 2,
					harvesting:
						-2,
				},
		},
		{
			id: "beanie",
			nameKey:
				"item.name.beanie",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					speed: 4,
					range:
						-6,
				},
		},
		{
			id: "bigArms",
			nameKey:
				"item.name.bigArms",
			tier: 4,
			basePrice: 105,
			bonuses:
				{
					meleeDamage: 12,
					rangedDamage: 6,
					knockback: 3,
					attackSpeed:
						-3,
					speed:
						-3,
				},
		},
		{
			id: "blindfold",
			nameKey:
				"item.name.blindfold",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					critChance: 5,
					dodge: 5,
					range:
						-15,
				},
		},
		{
			id: "bloodLeech",
			nameKey:
				"item.name.bloodLeech",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					lifeSteal: 2,
					hpRegeneration: 2,
					harvesting:
						-3,
				},
		},
		{
			id: "boilingWater",
			nameKey:
				"item.name.boilingWater",
			tier: 1,
			basePrice: 30,
			bonuses:
				{
					elementalDamage: 2,
					maxHp:
						-1,
				},
		},
		{
			id: "book",
			nameKey:
				"item.name.book",
			tier: 1,
			basePrice: 15,
			bonuses:
				{
					engineering: 2,
					elementalDamage: 1,
					luck:
						-1,
				},
		},
		{
			id: "bowlerHat",
			nameKey:
				"item.name.bowlerHat",
			tier: 3,
			basePrice: 75,
			bonuses:
				{
					luck: 15,
					harvesting: 18,
					attackSpeed:
						-5,
					critChance:
						-3,
				},
		},
		{
			id: "boxingGlove",
			nameKey:
				"item.name.boxingGlove",
			tier: 1,
			basePrice: 18,
			bonuses:
				{
					meleeDamage: 1,
					knockback: 3,
				},
		},
		{
			id: "brokenMouth",
			nameKey:
				"item.name.brokenMouth",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					maxHp: 5,
					hpRegeneration:
						-1,
				},
		},
		{
			id: "butterfly",
			nameKey:
				"item.name.butterfly",
			tier: 1,
			basePrice: 30,
			bonuses:
				{
					lifeSteal: 2,
					elementalDamage:
						-1,
				},
		},
		{
			id: "cake",
			nameKey:
				"item.name.cake",
			tier: 1,
			basePrice: 15,
			bonuses:
				{
					maxHp: 3,
					damage:
						-1,
				},
		},
		{
			id: "cape",
			nameKey:
				"item.name.cape",
			tier: 4,
			basePrice: 110,
			bonuses:
				{
					lifeSteal: 5,
					dodge: 20,
					meleeDamage:
						-2,
					rangedDamage:
						-2,
					elementalDamage:
						-2,
				},
		},
		{
			id: "charcoal",
			nameKey:
				"item.name.charcoal",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					elementalDamage: 1,
					meleeDamage: 2,
					harvesting:
						-2,
				},
		},
		{
			id: "clawTree",
			nameKey:
				"item.name.clawTree",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					meleeDamage: 1,
					critChance: 3,
					maxHp:
						-1,
				},
		},
		{
			id: "clover",
			nameKey:
				"item.name.clover",
			tier: 3,
			basePrice: 65,
			bonuses:
				{
					luck: 20,
					dodge: 6,
					lifeSteal:
						-2,
				},
		},
		{
			id: "coffee",
			nameKey:
				"item.name.coffee",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					attackSpeed: 10,
					damage:
						-2,
				},
		},
		{
			id: "cog",
			nameKey:
				"item.name.cog",
			tier: 2,
			basePrice: 35,
			bonuses:
				{
					engineering: 4,
					knockback: 1,
					damage:
						-4,
				},
		},
		{
			id: "compass",
			nameKey:
				"item.name.compass",
			tier: 2,
			basePrice: 40,
			bonuses:
				{
					speed: 5,
					engineering: 3,
					critChance:
						-3,
				},
		},
		{
			id: "cyclopsWorm",
			nameKey:
				"item.name.cyclopsWorm",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					damage: 12,
					range:
						-12,
				},
		},
		{
			id: "defectiveSteroids",
			nameKey:
				"item.name.defectiveSteroids",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					maxHp: 2,
					meleeDamage: 2,
					attackSpeed:
						-3,
				},
		},
		{
			id: "ductTape",
			nameKey:
				"item.name.ductTape",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					armor: 1,
					engineering: 1,
					maxHp:
						-2,
				},
		},
		{
			id: "energyBracelet",
			nameKey:
				"item.name.energyBracelet",
			tier: 2,
			basePrice: 55,
			bonuses:
				{
					critChance: 4,
					elementalDamage: 2,
					rangedDamage:
						-2,
				},
		},
		{
			id: "exoskeleton",
			nameKey:
				"item.name.exoskeleton",
			tier: 4,
			basePrice: 90,
			bonuses:
				{
					armor: 3,
					critChance: 5,
					engineering: 5,
					speed: 5,
					hpRegeneration:
						-2,
					lifeSteal:
						-2,
				},
		},
		{
			id: "fertilizer",
			nameKey:
				"item.name.fertilizer",
			tier: 1,
			basePrice: 15,
			bonuses:
				{
					harvesting: 8,
					meleeDamage:
						-1,
				},
		},
		{
			id: "fin",
			nameKey:
				"item.name.fin",
			tier: 3,
			basePrice: 65,
			bonuses:
				{
					speed: 10,
					lifeSteal: 3,
					luck:
						-8,
				},
		},
		{
			id: "freshMeat",
			nameKey:
				"item.name.freshMeat",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					lifeSteal: 2,
					hpRegeneration:
						-1,
				},
		},
		{
			id: "fuelTank",
			nameKey:
				"item.name.fuelTank",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					elementalDamage: 4,
					meleeDamage:
						-1,
					rangedDamage:
						-1,
				},
		},
		{
			id: "gamblingToken",
			nameKey:
				"item.name.gamblingToken",
			tier: 2,
			basePrice: 50,
			bonuses:
				{
					dodge: 8,
					armor:
						-1,
				},
		},
		{
			id: "glassCannon",
			nameKey:
				"item.name.glassCannon",
			tier: 3,
			basePrice: 75,
			bonuses:
				{
					damage: 25,
					armor:
						-3,
				},
		},
		{
			id: "glasses",
			nameKey:
				"item.name.glasses",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					range: 20,
				},
		},
		{
			id: "gnome",
			nameKey:
				"item.name.gnome",
			tier: 4,
			basePrice: 100,
			bonuses:
				{
					meleeDamage: 10,
					elementalDamage: 10,
					range:
						-20,
					pickupRange:
						-20,
				},
		},
		{
			id: "goatSkull",
			nameKey:
				"item.name.goatSkull",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					meleeDamage: 3,
					critChance:
						-2,
				},
		},
		{
			id: "gummyBerserker",
			nameKey:
				"item.name.gummyBerserker",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					attackSpeed: 5,
					range: 25,
					armor:
						-1,
				},
		},
		{
			id: "headInjury",
			nameKey:
				"item.name.headInjury",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					damage: 6,
					range:
						-8,
				},
		},
		{
			id: "heavyBullets",
			nameKey:
				"item.name.heavyBullets",
			tier: 4,
			basePrice: 100,
			bonuses:
				{
					rangedDamage: 5,
					damage: 10,
					range: 10,
					attackSpeed:
						-5,
					critChance:
						-5,
				},
		},
		{
			id: "hedgehog",
			nameKey:
				"item.name.hedgehog",
			tier: 1,
			basePrice: 30,
			bonuses:
				{
					meleeDamage: 2,
					rangedDamage: 1,
					hpRegeneration:
						-1,
				},
		},
		{
			id: "helmet",
			nameKey:
				"item.name.helmet",
			tier: 1,
			basePrice: 15,
			bonuses:
				{
					armor: 1,
					speed:
						-2,
				},
		},
		{
			id: "injection",
			nameKey:
				"item.name.injection",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					damage: 7,
					maxHp:
						-2,
				},
		},
		{
			id: "insanity",
			nameKey:
				"item.name.insanity",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					critChance: 6,
					damage:
						-3,
				},
		},
		{
			id: "jetPack",
			nameKey:
				"item.name.jetPack",
			tier: 4,
			basePrice: 100,
			bonuses:
				{
					speed: 15,
					dodge: 10,
					maxHp:
						-5,
					armor:
						-1,
				},
		},
		{
			id: "leatherVest",
			nameKey:
				"item.name.leatherVest",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					armor: 2,
					dodge: 6,
					maxHp:
						-3,
				},
		},
		{
			id: "lens",
			nameKey:
				"item.name.lens",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					rangedDamage: 1,
					range:
						-5,
				},
		},
		{
			id: "littleFrog",
			nameKey:
				"item.name.littleFrog",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					pickupRange: 20,
					harvesting: 10,
					dodge:
						-3,
				},
		},
		{
			id: "littleMuscleyDude",
			nameKey:
				"item.name.littleMuscleyDude",
			tier: 2,
			basePrice: 50,
			bonuses:
				{
					meleeDamage: 3,
					maxHp: 5,
					range:
						-15,
				},
		},
		{
			id: "lostDuck",
			nameKey:
				"item.name.lostDuck",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					luck: 8,
					elementalDamage:
						-1,
				},
		},
		{
			id: "luckyCharm",
			nameKey:
				"item.name.luckyCharm",
			tier: 3,
			basePrice: 75,
			bonuses:
				{
					luck: 30,
					meleeDamage:
						-2,
					rangedDamage:
						-1,
				},
		},
		{
			id: "mammoth",
			nameKey:
				"item.name.mammoth",
			tier: 4,
			basePrice: 110,
			bonuses:
				{
					meleeDamage: 20,
					hpRegeneration: 5,
					knockback: 5,
					damage:
						-8,
					speed:
						-3,
				},
		},
		{
			id: "mastery",
			nameKey:
				"item.name.mastery",
			tier: 2,
			basePrice: 55,
			bonuses:
				{
					meleeDamage: 6,
					rangedDamage:
						-3,
				},
		},
		{
			id: "medal",
			nameKey:
				"item.name.medal",
			tier: 2,
			basePrice: 55,
			bonuses:
				{
					maxHp: 3,
					damage: 3,
					armor: 1,
					speed: 3,
					critChance:
						-4,
				},
		},
		{
			id: "metalPlate",
			nameKey:
				"item.name.metalPlate",
			tier: 2,
			basePrice: 40,
			bonuses:
				{
					armor: 2,
					damage:
						-3,
				},
		},
		{
			id: "missile",
			nameKey:
				"item.name.missile",
			tier: 2,
			basePrice: 45,
			bonuses:
				{
					damage: 10,
					attackSpeed:
						-4,
				},
		},
		{
			id: "mushroom",
			nameKey:
				"item.name.mushroom",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					hpRegeneration: 3,
					luck:
						-2,
				},
		},
		{
			id: "mutation",
			nameKey:
				"item.name.mutation",
			tier: 1,
			basePrice: 25,
			bonuses:
				{
					rangedDamage: 1,
					elementalDamage: 1,
					knockback:
						-3,
				},
		},
		{
			id: "nightGoggles",
			nameKey:
				"item.name.nightGoggles",
			tier: 4,
			basePrice: 95,
			bonuses:
				{
					critChance: 15,
					range: 50,
					maxHp:
						-3,
					armor:
						-1,
				},
		},
		{
			id: "octopus",
			nameKey:
				"item.name.octopus",
			tier: 4,
			basePrice: 105,
			bonuses:
				{
					maxHp: 12,
					hpRegeneration: 5,
					lifeSteal: 3,
					critChance:
						-8,
				},
		},
		{
			id: "panda",
			nameKey:
				"item.name.panda",
			tier: 4,
			basePrice: 100,
			bonuses:
				{
					maxHp: 12,
					luck: 25,
					damage:
						-5,
				},
		},
		{
			id: "peacefulBee",
			nameKey:
				"item.name.peacefulBee",
			tier: 1,
			basePrice: 18,
			bonuses:
				{
					dodge: 4,
					harvesting: 4,
					meleeDamage:
						-1,
					rangedDamage:
						-1,
				},
		},
		{
			id: "pencil",
			nameKey:
				"item.name.pencil",
			tier: 1,
			basePrice: 8,
			bonuses:
				{
					engineering: 1,
				},
		},
		{
			id: "plant",
			nameKey:
				"item.name.plant",
			tier: 1,
			basePrice: 15,
			bonuses:
				{
					hpRegeneration: 3,
					lifeSteal:
						-1,
				},
		},
		{
			id: "plasticExplosive",
			nameKey:
				"item.name.plasticExplosive",
			tier: 3,
			basePrice: 60,
			bonuses:
				{
					explosionSize: 25,
				},
		},
		{
			id: "poisonousTonic",
			nameKey:
				"item.name.poisonousTonic",
			tier: 3,
			basePrice: 80,
			bonuses:
				{
					attackSpeed: 10,
					critChance: 5,
					range: 15,
					hpRegeneration:
						-2,
				},
		},
		{
			id: "potato",
			nameKey:
				"item.name.potato",
			tier: 4,
			basePrice: 95,
			bonuses:
				{
					maxHp: 3,
					hpRegeneration: 2,
					lifeSteal: 1,
					damage: 5,
					attackSpeed: 5,
					speed: 3,
					dodge: 3,
					armor: 1,
					luck: 5,
				},
		},
		{
			id: "propellerHat",
			nameKey:
				"item.name.propellerHat",
			tier: 1,
			basePrice: 28,
			bonuses:
				{
					luck: 10,
					damage:
						-2,
				},
		},
		{
			id: "reinforcedSteel",
			nameKey:
				"item.name.reinforcedSteel",
			tier: 2,
			basePrice: 50,
			bonuses:
				{
					rangedDamage: 2,
					engineering: 3,
					speed:
						-3,
				},
		},
		{
			id: "ritual",
			nameKey:
				"item.name.ritual",
			tier: 2,
			basePrice: 60,
			bonuses:
				{
					damage: 6,
					lifeSteal: 2,
					engineering:
						-2,
				},
		},
		{
			id: "scope",
			nameKey:
				"item.name.scope",
			tier: 2,
			basePrice: 48,
			bonuses:
				{
					rangedDamage: 2,
					range: 25,
					attackSpeed:
						-7,
				},
		},
		{
			id: "shadyPotion",
			nameKey:
				"item.name.shadyPotion",
			tier: 2,
			basePrice: 48,
			bonuses:
				{
					luck: 20,
					hpRegeneration:
						-2,
				},
		},
		{
			id: "shmoop",
			nameKey:
				"item.name.shmoop",
			tier: 3,
			basePrice: 60,
			bonuses:
				{
					maxHp: 6,
					hpRegeneration: 2,
					meleeDamage:
						-2,
					rangedDamage:
						-1,
				},
		},
		{
			id: "smallMagazine",
			nameKey:
				"item.name.smallMagazine",
			tier: 2,
			basePrice: 60,
			bonuses:
				{
					rangedDamage: 2,
					attackSpeed: 10,
					damage:
						-6,
				},
		},
		{
			id: "sunglasses",
			nameKey:
				"item.name.sunglasses",
			tier: 2,
			basePrice: 50,
			bonuses:
				{
					critChance: 10,
					armor:
						-1,
				},
		},
		{
			id: "terrifiedOnion",
			nameKey:
				"item.name.terrifiedOnion",
			tier: 1,
			basePrice: 15,
			bonuses:
				{
					speed: 4,
					luck:
						-5,
				},
		},
		{
			id: "toolbox",
			nameKey:
				"item.name.toolbox",
			tier: 3,
			basePrice: 55,
			bonuses:
				{
					engineering: 6,
					attackSpeed:
						-8,
				},
		},
		{
			id: "toxicSludge",
			nameKey:
				"item.name.toxicSludge",
			tier: 1,
			basePrice: 20,
			bonuses:
				{
					elementalDamage: 2,
					dodge:
						-2,
				},
		},
		{
			id: "tractor",
			nameKey:
				"item.name.tractor",
			tier: 3,
			basePrice: 70,
			bonuses:
				{
					harvesting: 40,
					damage:
						-8,
				},
		},
		{
			id: "warriorHelmet",
			nameKey:
				"item.name.warriorHelmet",
			tier: 3,
			basePrice: 80,
			bonuses:
				{
					armor: 3,
					maxHp: 5,
					speed:
						-5,
				},
		},
		{
			id: "wheat",
			nameKey:
				"item.name.wheat",
			tier: 3,
			basePrice: 85,
			bonuses:
				{
					meleeDamage: 4,
					rangedDamage: 2,
					harvesting: 10,
					elementalDamage:
						-2,
				},
		},
		{
			id: "wheelbarrow",
			nameKey:
				"item.name.wheelbarrow",
			tier: 2,
			basePrice: 40,
			bonuses:
				{
					harvesting: 16,
					armor:
						-1,
				},
		},
		{
			id: "whetstone",
			nameKey:
				"item.name.whetstone",
			tier: 2,
			basePrice: 40,
			bonuses:
				{
					lifeSteal: 4,
					knockback:
						-3,
				},
		},
		{
			id: "wings",
			nameKey:
				"item.name.wings",
			tier: 3,
			basePrice: 85,
			bonuses:
				{
					speed: 10,
					range: 30,
					elementalDamage:
						-2,
				},
		},
		{
			id: "wolfHelmet",
			nameKey:
				"item.name.wolfHelmet",
			tier: 4,
			basePrice: 90,
			bonuses:
				{
					elementalDamage: 10,
					luck: 20,
					engineering:
						-5,
				},
		},
	];

export function findItemById(
	id: string,
):
	| ItemDefinition
	| undefined {
	return itemDefinitions.find(
		(
			item,
		) =>
			item.id ===
			id,
	);
}

const itemStatSourcePrefix =
	"item:";

/** Stat source id of the `index`-th item a Bulbro bought. */
export function itemStatSourceId(
	itemId: string,
	index: number,
) {
	return `${itemStatSourcePrefix}${index}:${itemId}`;
}

/** Item id of an item stat source id, or undefined for other sources. */
export function itemIdFromStatSourceId(
	sourceId: string,
):
	| string
	| undefined {
	if (
		!sourceId.startsWith(
			itemStatSourcePrefix,
		)
	)
		return undefined;
	const rest =
		sourceId.slice(
			itemStatSourcePrefix.length,
		);
	const separator =
		rest.indexOf(
			":",
		);
	return separator >=
		0
		? rest.slice(
				separator +
					1,
			)
		: undefined;
}

/**
 * Rolls a shop item tier for `wave`: higher tiers get more likely with
 * every wave, scaled by luck (Brotato's shop tier chances).
 */
export function rollItemTier(
	wave: number,
	luck: number,
	random: () => number = Math.random,
): ItemTier {
	for (const tier of [
		...upgradeTiers,
	].reverse()) {
		if (
			tier ===
			1
		)
			return 1;
		if (
			random() <
			upgradeTierChance(
				tier,
				wave,
				luck,
			)
		)
			return tier;
	}
	return 1;
}

# Game Balance

This document reviews Bulbro's balance: stats, level-ups, weapons, enemies,
economy and characters. Bulbro is compared with Brotato throughout.

The [item reference](../web/docs/items.md) lists all 83 items, their tiers,
prices, bonuses, stacking rules, and sprite frames. The
[weapon reference](../web/docs/weapons.md) covers weapon values and attacks.

Bulbro follows Brotato's core formulas. Nine weapons now use its individual
stat and price progressions, and six enemies use the numerical stats of
matching roles. Custom weapons, custom enemies, behavior and wave design
still have differences. The [weapon reference](../web/docs/weapons.md) and
[enemy reference](../web/docs/enemies.md) document the mappings and effect gaps.

Balance recommendations remain qualitative; the updated values have not
been validated through playtesting.

Wave estimates below are calculated from the spawner configs for a solo game
at difficulty 0. They are not measured in play.

## What matches Brotato

| System | Bulbro | Source |
|---|---|---|
| Level-up upgrades | All 15 upgrades and their tier I–IV values match | [Upgrades.ts](../web/src/upgrades/Upgrades.ts) |
| Upgrade tiers | Fixed tiers on levels 1/5/10/15/20/25+; luck raises the chance of higher tiers | [Upgrades.ts](../web/src/upgrades/Upgrades.ts) |
| Experience | `(level + 3)²` per level; +1 max HP per level | [Levels.ts](../web/src/bulbro/Levels.ts) |
| Armor | 15 armor halves damage taken; negative armor increases it | [game-formulas.ts](../web/src/game-formulas.ts) |
| HP regeneration | 1 HP every `5 / (1 + (R − 1) / 2.25)` s | [game-formulas.ts](../web/src/game-formulas.ts) |
| Dodge | Capped at 60% | [game-formulas.ts](../web/src/game-formulas.ts) |
| Life steal | Chance per hit to heal 1 HP; at most 10 heals per second | [game-formulas.ts](../web/src/game-formulas.ts) |
| Harvesting | Paid out at the end of the wave; grows by 5% each wave | [BulbroState.ts](../web/src/bulbro/BulbroState.ts) |
| Item and reroll prices | Same formulas as Brotato | [game-formulas.ts](../web/src/game-formulas.ts) |
| Weapon tiers | Tiers I–IV; two equal weapons of a tier combine into the next tier; selling pays back 25% | [WeaponTiers.ts](../web/src/weapon/WeaponTiers.ts) |
| Wave length | 20s, +5s per wave, max 60s | [waveDuration.ts](../web/src/waveDuration.ts) |
| Melee range | Melee weapons get half of the range stat | [game-formulas.ts](../web/src/game-formulas.ts) |
| Matched enemy stats | Six role analogues use Brotato HP/damage growth, speed, knockback resistance and rewards | [Enemy reference](../web/docs/enemies.md) |

## Current economy

- **Pickups respect their value.** Collection events carry the material’s
  `value`; every player receives that amount in materials and XP, including
  dead players. Wave and run statistics count value rather than pickup objects.
  Harvesting remains a separate end-of-wave payout.
- **Bagged materials retain their value.** Surviving a wave bags the sum of
  leftover material values without immediately awarding materials or XP.
  A later pickup pays `value + min(value, bag balance)` in both materials
  and XP, deducting that bonus from the bag. Co-op players redeem their
  own bags against the same shared pickup value. The bag animation counter
  also advances by value.
- **Matching weapons use Brotato’s price tables.** Pistol, Hand, Fist and
  Knife use 10/22/45/91; Laser Gun 15/31/61/122; SMG and Double Barrel
  Shotgun 20/39/74/149; Brick 6/14/22/40. Sword begins at tier II
  and uses Brotato’s 51/95/190 prices.
  AK-47, Bazooka, Flare Gun, Grenade and Machine Gun retain their custom
  base prices and ×1/×2/×4/×8 progression. Prices apply the existing
  Brotato wave formula, and recycling returns 25% of the current tier price.
- **Higher weapon tiers can be bought.** Both weapons and items use the shop
  rarity curve, with tier II/III/IV first available after waves 2/4/8.
  Chances grow by 6%/2%/0.23% per wave, scaled by luck and capped at
  60%/25%/8%. The shop shows weapon tiers and purchases equip their tier stats.
  At capacity, buying a matching type and tier below IV combines automatically.
- **Items share the shop with weapons.** Each slot offers a weapon with a
  35% chance, otherwise a stat item. Character weapon restrictions still apply.
  Engineering items stay excluded until structures exist.

The following table estimates enemy counts:
actual income now sums each killed enemy’s material value, including wave
scaling, and depends on kills and collection. Trees and harvesting add income.

Estimated enemies per wave, solo, difficulty 0:

| Wave | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Enemies | 77 | 105 | 166 | 207 | 321 | 304 | 337 | 279 | 60 | 374 | 268 | 171 | ~285 |

## Matched combat values

Nine weapons use Brotato's per-tier stats and prices: Pistol, SMG, Laser Gun,
Hand, Fist, Knife, Sword, Shotgun and Brick. Sword starts at tier II.
Hand grants harvesting while equipped, Shotgun fires 4/4/4/6 pellets, and
Brick scales with both Melee Damage and Engineering.
See the [weapon reference](../web/docs/weapons.md#tier-growth-and-prices).

Six enemy roles use Brotato's numerical stats and rewards: Baby → Baby Alien,
Colorado Beetle → Chaser, Aphid → Spitter, Wild Boar → Charger, Beetle Warrior →
Bruiser, and Tree → Tree. See the [enemy reference](../web/docs/enemies.md).
Aphid uses Spitter's +0.75 projectile damage growth per wave; the reference
value 0.95 is knockback resistance. Enemy base attack speed is neutral at 0.

## Problems

### 1. Weapon effects and custom weapon balance

- **Missing effects:** Pistol, Laser Gun and Shotgun still lack piercing.
  Brick has no chance to break and drop materials.
- **Custom weapons need playtesting:** AK-47, Bazooka, Flare Gun, Grenade and
  Machine Gun keep their existing stats, scaling and premium pricing.
  Machine Gun still reaches the 100ms cooldown floor at +40% attack speed.
  Flare Gun still has no burning effect.
- **Engineering is partially useful:** Brick now scales 50%/65%/80%/100%
  with both Melee Damage and Engineering. Structures are absent, and the
  current shop exclusion of positive Engineering items remains.
- **Class bonuses are missing:** classes now match the nine weapon analogues,
  but equipping a class set does not grant Brotato's bonuses.

### Starting and shop availability

Starting choices are filtered from each character’s shop pool using
`excludedStartingWeapons` in [base.ts](../web/src/characters-definitions/base.ts)
and [grandpa.ts](../web/src/characters-definitions/grandpa.ts). The selector,
character preview and loadout validation use the same
[filter](../web/src/bulbro/startingWeapons.ts).

- **AK-47:** Grandpa can select it at setup; every other character is excluded.
  It remains a shop option for all characters except Medic.
- **Bazooka:** no character can select it at setup. It can appear in any
  post-wave shop for characters other than Medic; there is no minimum-wave gate.
- **Medic:** Pistol, Hand and Fist remain the complete starting and shop pool.
- **Other weapons:** existing starting choices are retained, including Sword
  (now tier II) and Machine Gun. Premium pricing does not imply a higher numbered tier:
  shops roll tiers I–IV by wave and luck, alongside combining.

### 2. Enemy behavior and damage protection

- **Hit protection:** taking damage grants 200 ms of invulnerability with a
  flashing sprite. Only the first damaging hit per player per tick is accepted,
  across melee, projectiles and explosions. Dodges do not start protection.
  Positive armor reduces damage; negative armor increases it.
- **Behavior differences remain:** Bulbro keeps its own charge timing, body
  sizes, attack cooldowns and projectile speeds. Aphid has no separate contact
  attack corresponding to Spitter's +0.6 contact damage per wave.
- **No crates:** consumable and material rewards match for these six enemies,
  but loot crates and their drop rates are not implemented.

### 3. Custom enemy progression needs playtesting

Roach, Beetle Archer, Hedgehog and Badger have no established direct analogue.
Their base stats and wave growth remain custom. Hedgehog and Badger still
gain only +1 HP per wave despite appearing on waves 10–11; Beetle Archer
still gains +5 HP and +1 material value per wave. Validate their difficulty
and income contribution alongside the newly matched enemies.

### 4. Waves have no shape after wave 12, and the run never ends

- **Waves 13 and up repeat one pattern.** Only Baby spawners run, reusing the
  wave-4 config, while enemy HP keeps rising in a straight line.
- **Uneven difficulty.** Wave 9 is a lull (about 60 enemies, Babies switched
  off) between wave 8 (about 279) and wave 10 (about 374).
- **No end.** There is no wave-20 boss, no win condition, and no elites or
  hordes.

### 5. Difficulty only adds enemies

- **Flat extra enemies.** Difficulty only adds `+difficulty` enemies to every
  spawn group, on top of `baseAmount + playerCount` ([spawnCluster.ts](../web/src/Spawner/spawnCluster.ts)). At
  difficulty 5 that more than doubles early groups but adds proportionally
  less later.
- **Brotato does more.** It raises enemy HP and damage (+12%, +26%, +40% at
  Danger 3/4/5) and adds elites, hordes and a second boss.

### 6. Characters

| Character | Bonuses | Verdict |
|---|---|---|
| King | +30 HP, +30% damage, +10 armor, +50 luck, +30% pickup range | No downside; strongest |
| Evil | +60% damage, +6 melee, +15% crit, +25% attack speed, +10% speed, −5 HP, −3 armor | Very strong |
| Berserker | +5 melee, +20% damage, +30% attack speed, +5 HP, −5 armor | Strong melee |
| Cyborg | +10 HP, +4 ranged, +5 engineering, +10% attack speed, +25 range, +1 armor | Solid; engineering only scales Brick |
| Vampire | +50 range, +10% life steal, +3 ranged | Fine |
| Medic | +5 HP regen, +20 HP, +3 engineering; only Pistol, Hand, Fist | Limited weapons; Engineering unused in this weapon pool |
| Well Rounded | +5 HP, +5% speed, +8 harvesting | Harvesting gives a meaningful early spending advantage |
| Grandpa | −20% speed, +50% pickup range; exclusive AK-47 starting choice | Stronger starting option; speed trade needs playtesting |

Brotato characters always trade something away. Engineering now contributes
to Brick damage, but structures are still absent. The Skull upgrade,
Engineering-only items and positive Engineering shop items remain excluded
until structures exist.

## Suggested priority

1. **Economy validation:** playtest income from valued pickups against shop
   spending, especially the custom premium weapon prices.
2. **Weapons:** implement missing piercing and Brick's break/material effect;
   playtest the five custom weapons against the matched stat tables.
3. **Enemies:** playtest the 200 ms hit protection, validate the four custom enemies,
   and review behavior differences from the matched roles.
4. **Waves:** write wave configs for 13–20, end the run at wave 20 with a
   boss, and make difficulty scale enemy HP and damage by percentage.
5. **Characters:** give King a real downside, and playtest whether Grandpa’s
   exclusive AK-47 start offsets his speed penalty. Compare the other free
   starting options, especially Sword and Machine Gun.

## Sources

- [Brotato Wiki – Items](https://brotato.wiki.spellsandguns.com/Items)
- [Brotato Wiki – Enemies](https://brotato.wiki.spellsandguns.com/Enemies)
- [Brotato Wiki – Weapons](https://brotato.wiki.spellsandguns.com/Weapons)
- [Brotato Wiki – Pistol](https://brotato.wiki.spellsandguns.com/Pistol)
- [Brotato Wiki – SMG](https://brotato.wiki.spellsandguns.com/SMG)
- [Brotato Wiki – Laser Gun](https://brotato.wiki.spellsandguns.com/Laser_Gun)
- [Brotato Wiki – Dangers](https://brotato.wiki.spellsandguns.com/Dangers)
- [Brotato Wiki – Iframes](https://brotato.wiki.spellsandguns.com/Iframes)

# Game Balance

This document reviews Bulbro's balance: stats, level-ups, weapons, enemies,
economy and characters. Bulbro is compared with Brotato throughout.

Bulbro copies Brotato's **formulas** almost exactly. The **content numbers**
on top of them (weapons, enemies, economy, characters) have drifted far from
Brotato. Most balance problems come from that mix: Brotato's scaling rules
applied to non-Brotato base values.

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
| Wave length | 20s, +5s per wave, max 60s | [waveDuration.ts](../web/src/waveDuration.ts) |
| Melee range | Melee weapons get half of the range stat | [game-formulas.ts](../web/src/game-formulas.ts) |
| Early enemy HP | Baby (3, +2/wave), Colorado beetle (2, +1/wave), Aphid (8, +1/wave) are close to Brotato's Baby Alien, Chaser and Spitter | [enemies-definitions](../web/src/enemies-definitions) |

## Problems

### 1. Materials stop mattering after about wave 2

- **Every pickup is worth 1.** `materialCollected` always calls
  `gainMaterials(1)` in [BulbroState.ts](../web/src/bulbro/BulbroState.ts).
  The enemy's `materialsDropped` value, carried by the material as `value`,
  is ignored. So the Wild Boar's 5 (+3/wave), the Tree's 3, the Archer's
  +1/wave and similar values have no effect.
- **Weapons are very cheap.** Most weapons have `basePrice: 5`, which is
  6 materials on wave 1. In Brotato, tier-I weapons cost around 10–20 and the
  Sword costs 51. Wave 1 drops roughly 77 materials, so you can buy the whole
  4-item shop right away.
- **Items are the only other sink.** The shop also sells 83 Brotato items
  that only change stats ([Items.ts](../web/src/items/Items.ts)): each slot
  offers a weapon 35% of the time, otherwise an item of a tier rolled from
  the wave and luck. Items keep Brotato's prices, so they cost 3–20× more
  than a weapon (wave 1: tier I 17–34, tier IV 100–122, a 5-price weapon 6).
  There are still no weapon tiers or merging, and items with conditional
  effects are not in yet.

Estimated materials (and XP) per wave, solo, difficulty 0:

| Wave | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Enemies / materials | 77 | 105 | 166 | 207 | 321 | 304 | 337 | 279 | 60 | 374 | 268 | 171 | ~285 |
| Total enemy HP | 231 | 381 | 1054 | 1947 | 3186 | 5437 | 6769 | 4725 | 3213 | 7769 | 5695 | 4275 | grows linearly |

### 2. Weapon numbers don't fit the scaling formulas

Brotato's weapons use high base damage with slow cooldowns. Bulbro mostly
uses low base damage with fast cooldowns, but keeps the same "add flat damage
per hit" scaling. A point of Ranged or Melee Damage is therefore worth much
more on fast weapons.

Damage per second (DPS), before crits. The "+5" column adds 5 points of the
scaling stat:

| Weapon | Bulbro DPS (base → +5) | Brotato tier I DPS (base → +5) | Bulbro price |
|---|---|---|---|
| Machine Gun | **21 → 43** (3 dmg / 0.14s) | — | 10 |
| Sword | **28** (25 dmg / 0.9s, 10% crit) | 23 (30 / 1.28s) | **5** (Brotato: 51) |
| Brick | 22 (30 / 1.39s) | 22 | 5 |
| AK-47 | 6.7 → 20 | — | 5 |
| Bazooka | 14 → 17, area damage | — | 14 |
| Grenade | 12, area damage | — | 9 |
| Fist | 10 | 10 | 5 |
| Double Barrel Shotgun | 8.8 → 12 (single shot) | 4 pellets, pierce 2 | 5 |
| Knife | 5.9 (6 dmg) | 8.9 (9 dmg) | 5 |
| Flare Gun | 5.7 | — | 7 |
| SMG | 5 → 17.5 (1 / 0.2s) | 17.6 → 32 (3 / 0.17s) | 5 |
| Pistol | 4 → 14 (2 / 0.5s) | 10 → 14 (12 / 1.2s) | 5 |
| Laser Gun | **2 → 4.5** (4 / 1.98s) | 20 → 30 (40 dmg, 400% scaling) | 5 |
| Hand | ~1 | ~1 (support weapon, +3 harvesting) | 5 |

- **Sword** (cheapest price) and **Machine Gun** clearly beat everything else.
- **Laser Gun, SMG, Hand and Flare Gun** are not worth buying.
- **Attack speed hits a floor.** The Machine Gun reaches the 100ms minimum
  cooldown at only +40% attack speed, so further attack speed is wasted on it.
- **Missing weapon effects.** There is no pierce: Brotato's Pistol pierces one
  enemy, and its Double Barrel Shotgun fires 4 pellets that pierce 2. Bulbro's
  shotgun is a single 12-damage shot.
- **Scaling differences.** Brotato's Brick scales 50% melee + 50%
  engineering; Bulbro's scales 100% melee.
- **Flat damage items make this worse.** Items such as Mammoth (+20 melee),
  Gnome (+10 melee) or Big Arms (+12 melee, +6 ranged) add flat damage to every
  hit, so they help the fast weapons most. Attack speed items are wasted on a
  Machine Gun at the cooldown floor.

### 3. Enemy damage scaling is uneven, and there are no i-frames

- **Most enemies never get stronger hits.** In Brotato every enemy gains
  +0.6 to +1.2 damage per wave. In Bulbro only Baby and Aphid scale, and at
  +1/wave (Brotato's Baby Alien is +0.6). Beetle Warrior, Wild Boar, Roach,
  Beetle Archer, Hedgehog and Badger hit for a flat 3 forever, and the
  Colorado beetle for 1.
- **Babies take over the damage curve.** By wave 20 a Baby hits for 20
  (Brotato: about 12.4), while bigger enemies still hit for 3.
- **No invulnerability after a hit.** Brotato gives 0.2–0.4s of i-frames,
  scaled by the share of max HP lost. In Bulbro a swarm can land every hit in
  the same instant.
- **Enemy `attackSpeed: 2` does almost nothing.** It is read as attack speed
  points by `getAttackCooldown`, so it means +2% (1.0s → 0.98s). It was
  probably meant to be 2× speed.

| Enemy | Bulbro HP (+/wave) | Bulbro damage (+/wave) | Closest Brotato enemy |
|---|---|---|---|
| Baby | 3 (+2) | 1 (+1) | Baby Alien: 3 (+2), 1 (+0.6) |
| Colorado beetle | 2 (+1) | 1 (+0) | Chaser: 1 (+1), 1 (+0.6) |
| Aphid | 8 (+1) | 1 (+1) | Spitter: 8 (+1), 1 (+0.95) |
| Wild Boar | 10 (**+10**) | 3 (+0) | Charger: 4 (+2.5), 1 (+0.85) |
| Beetle Warrior | 6 (+6) | 3 (+0) | — |
| Roach | 10 (+4) | 3 (+0) | — |
| Beetle Archer | 2 (+5) | 3 (+0) | — |
| Hedgehog | 6 (**+1**) | 3 (+0) | — |
| Badger | 10 (**+1**) | 3 (+0) | — |
| Tree | 12 (+6) | — | Tree: 10 (+5) |

### 4. Enemy HP is out of line

- **Too tanky:** Wild Boar (+10 HP/wave), Beetle Warrior (+6) and Beetle
  Archer (+5) grow much faster than comparable Brotato enemies.
- **Too fragile:** Hedgehog and Badger gain only +1 HP/wave and appear on
  waves 10–11 with 15–20 HP. That is less than the Babies around them (about
  21 HP at that point).

### 5. Waves have no shape after wave 12, and the run never ends

- **Waves 13 and up repeat one pattern.** Only Baby spawners run, reusing the
  wave-4 config, while enemy HP keeps rising in a straight line.
- **Uneven difficulty.** Wave 9 is a lull (about 60 enemies, Babies switched
  off) between wave 8 (about 279) and wave 10 (about 374).
- **No end.** There is no wave-20 boss, no win condition, and no elites or
  hordes.

### 6. Difficulty only adds enemies

- **Flat extra enemies.** Difficulty only adds `+difficulty` enemies to every
  spawn group ([spawnCluster.ts](../web/src/Spawner/spawnCluster.ts)). At
  difficulty 5 that more than doubles early groups but adds proportionally
  less later.
- **Brotato does more.** It raises enemy HP and damage (+12%, +26%, +40% at
  Danger 3/4/5) and adds elites, hordes and a second boss.
- **Dead code.** `spawnIntervalForRound` and `shouldSpawnEnemy` in
  [game-formulas.ts](../web/src/game-formulas.ts) are never used.

### 7. Characters

| Character | Bonuses | Verdict |
|---|---|---|
| King | +30 HP, +30% damage, +10 armor, +50 luck, +30% pickup range | No downside; strongest |
| Evil | +60% damage, +6 melee, +15% crit, +25% attack speed, +10% speed, −5 HP, −3 armor | Very strong |
| Berserker | +5 melee, +20% damage, +30% attack speed, +5 HP, −5 armor | Strong melee |
| Cyborg | +10 HP, +4 ranged, +5 engineering, +10% attack speed, +25 range, +1 armor | Solid; engineering unused |
| Vampire | +50 range, +10% life steal, +3 ranged | Fine |
| Medic | +5 HP regen, +20 HP, +3 engineering; only Pistol, Hand, Fist | Limited weapons; engineering unused |
| Well Rounded | +5 HP, +5% speed, +8 harvesting | Matches Brotato, but harvesting is weak while materials don't matter |
| Grandpa | −20% speed, +50% pickup range | Weakest; bad trade |

Brotato characters always trade something away. Engineering does nothing yet,
because there are no structures. For the same reason the Skull upgrade and
the Pencil, Toolbox and Cog items are left out, and the Engineering on other
items is a wasted bonus.

## Suggested priority

1. **Economy:** use the material's real value on pickup, raise weapon prices
   to Brotato levels (tier I around 10–20, Sword and Machine Gun around
   30–50+), and add weapon merging as a second sink next to stat items.
2. **Weapons:** rebase them on Brotato's numbers (Pistol 12 dmg / 1.2s,
   SMG 3 / 0.17s, Laser 40 with 4× scaling). Alternatively, keep the fast feel
   but lower each weapon's scaling in proportion to its cooldown. Fix the
   Sword's price and nerf the Machine Gun either way.
3. **Enemies:** give every enemy damage growth per wave (Brotato uses +0.6 to
   +1.2), drop Baby to +0.6, add 0.2–0.4s i-frames, and fix what enemy
   `attackSpeed` means.
4. **Waves:** write wave configs for 13–20, end the run at wave 20 with a
   boss, and make difficulty scale enemy HP and damage by percentage.
5. **Characters:** give King a real downside, and give Grandpa something
   better than pickup range.

## Sources

- [Brotato Wiki – Items](https://brotato.wiki.spellsandguns.com/Items)
- [Brotato Wiki – Enemies](https://brotato.wiki.spellsandguns.com/Enemies)
- [Brotato Wiki – Weapons](https://brotato.wiki.spellsandguns.com/Weapons)
- [Brotato Wiki – Pistol](https://brotato.wiki.spellsandguns.com/Pistol)
- [Brotato Wiki – SMG](https://brotato.wiki.spellsandguns.com/SMG)
- [Brotato Wiki – Laser Gun](https://brotato.wiki.spellsandguns.com/Laser_Gun)
- [Brotato Wiki – Dangers](https://brotato.wiki.spellsandguns.com/Dangers)
- [Brotato Wiki – Iframes](https://brotato.wiki.spellsandguns.com/Iframes)

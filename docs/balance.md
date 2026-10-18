# Game Balance

This document reviews Bulbro's balance: stats, level-ups, weapons, enemies,
economy and characters. Bulbro is compared with Brotato throughout.

The [item reference](../web/docs/items.md) lists all 83 items, their tiers,
prices, bonuses, stacking rules, and sprite frames. The
[weapon reference](../web/docs/weapons.md) covers weapon values and attacks.
The [character reference](../web/docs/characters.md) links the roster review
and records proposed additions; both references separate suggestions from
implemented content.

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
| Enemy cap | At most 100 enemies alive; spawns over the cap remove a random enemy without loot | [enemyCap.ts](../web/src/Spawner/enemyCap.ts) |

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

| Wave | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Enemies | 77 | 105 | 166 | 207 | 321 | 304 | 337 | 279 | 60 | 374 | 268 | 171 | 335 | 310 | 374 |

| Wave | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Enemies | 341 | 343 | 330 | 359 | 513 | 347 | 318 | 322 | 311 | 566 | 311 | 405 | 403 | 402 | 638 |

Waves 31–40 range from 391 to 792 and waves 41+ from 460 to 946; see
[Waves after 30](#waves-after-30).

For comparison, Brotato's Crash Zone spawns about 27 enemies on wave 1, where
Bulbro spawns 77. Every Bulbro group adds `difficulty + players` enemies per
cluster, and Baby, Colorado Beetle and Aphid clusters are mirrored to the
opposite side. Bulbro is therefore about 2–3× denser than Brotato
at the same matched enemy stats.

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
- **New pattern weapons need tuning:** Spear, Revolver and Boomerang use
  provisional stats and prices chosen against Knife, Pistol and SMG; their
  sustained damage, coverage and reload downtime are untested.
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
Their base stats remain custom. Their wave growth was raised so they stay
relevant on waves 13–30 (see the [enemy reference](../web/docs/enemies.md)):
all four now gain damage per wave, Hedgehog and Badger gain +3/+4 HP, and
Beetle Archer no longer gains +1 material value per wave. Validate their
difficulty and income contribution alongside the matched enemies.

### 4. Wave design and the missing end

Every wave is a list of spawn groups in [waves.ts](../web/src/Spawner/waves.ts),
like Brotato's wave groups. A group has an enemy, its first spawn second,
its repeat interval, an optional last spawn second, the cluster size,
distance and angle, and whether it mirrors to the opposite side.

- **Waves 1–12** are unchanged and introduce one enemy at a time.
- **Waves 13–19** follow the themes of Brotato's waves 13–19 with Bulbro's
  roster: tanky chasers (Badger for Helmet Alien), fast fodder (Hedgehog for
  Fin Alien), hunters (Roach for Pursuer), a charger stampede and a mix of
  every heavy enemy on wave 19.
- **Waves 20, 25 and 30 are hordes** of 500–640 enemies. Waves 21–29 mix
  the late roster: chaser swarm, ranged siege, bruiser wall, stampede, hunt.
- **Uneven difficulty remains.** Wave 9 is a lull (about 60 enemies, Babies
  switched off) between wave 8 (about 279) and wave 10 (about 374).
- **No end.** There is no wave-20 boss, no win condition and no elites.
  Brotato ends on wave 20 (90 s, one boss or two on Danger 5) and has
  elite or horde waves on 11/12 (Danger 2+), 14/15 and 17/18 (Danger 4+).

#### Waves after 30

Waves after 30 repeat waves 21–30 with +1 enemy per cluster, +2 from wave 41.
The increase stops at +2 so later waves stay playable.

#### Enemy cap

Like Brotato, at most 100 enemies can be alive or appearing at once
([enemyCap.ts](../web/src/Spawner/enemyCap.ts)). Each spawn over the cap
removes a random alive enemy without materials, consumables or a kill, and
it plays the death animation. Spawns are skipped only when no alive enemy
can be removed. Trees are neutral and are not counted. Spawn counts above
are therefore upper bounds when players do not kill fast enough.

Up to wave 30, enemies grow linearly: `base + growth × (wave − 1)`. After that,
[buildEnemyCharacterForWave](../web/src/enemy/buildEnemyCharacterForWave.ts)
applies Brotato's endless formula, starting at wave 30 instead of 20:

- `n = wave − 30`, `F = n(n + 1) / 200 × (2 + max(0, (n − 15) × 0.2))`
- HP × `(1 + 2.25F)`, damage × `(1 + F)`, speed × `(1 + min(1.75, F / 13.33))`

| Wave | 31 | 35 | 40 | 45 | 50 |
|---|---|---|---|---|---|
| Endless factor | 0.02 | 0.3 | 1.1 | 2.4 | 6.3 |
| HP multiplier | ×1.05 | ×1.68 | ×3.48 | ×6.4 | ×15.2 |

Brotato also raises shop prices, shortens iframes and lowers material and
consumable drop chances in endless mode; Bulbro does not.

### 5. Difficulty only adds enemies

- **Flat extra enemies.** Difficulty only adds `+difficulty` enemies to every
  spawn group, on top of `baseAmount + playerCount` ([spawnCluster.ts](../web/src/Spawner/spawnCluster.ts)). At
  difficulty 5 that more than doubles early groups but adds proportionally
  less later.
- **Brotato does more.** It raises enemy HP and damage (+12%, +26%, +40% at
  Danger 3/4/5) and adds elites, hordes and a second boss.

### 6. Characters

Reviewed against the character definitions and combat formulas on 2026-10-17.
Brotato values below come from the linked PC character wiki pages as retrieved
on that date, including its newer Vampire. These are mechanical comparisons,
not measured win-rate rankings; shared names do not imply matching mechanics.

#### Current roster

Bonuses are relative to [base stats](../web/src/game-formulas.ts): 10 HP,
0 armor, 0 damage stats and a movement speed of 450. Every character starts
with one selected weapon and can equip six. No character grants an extra
weapon. Except for Medic, all share the full 14-weapon shop pool; 12 are
selectable at setup, or 13 for Grandpa. See
[definitions](../web/src/characters-definitions/index.ts),
[starting restrictions](../web/src/characters-definitions/base.ts) and
[weapon limits](../packages/network-protocol/src/weapon-limits.ts).

| Character / definition | Current bonuses and restrictions | Balance assessment |
|---|---|---|
| [Well Rounded](../web/src/characters-definitions/well-rounded.ts) | +5 HP, +5% speed, +8 harvesting | Baseline; matches Brotato's starting stat bonuses. Preserve as the control character. |
| [King](../web/src/characters-definitions/king.ts) | +30 HP, +30% damage, +10 armor, +50 luck, +30% pickup range | Highest-priority excess of unconditional power: huge durability, universal damage and better rarity rolls with no penalty or build requirement. |
| [Evil](../web/src/characters-definitions/evil.ts) | +60% damage, +6 melee, +15% crit, +25% attack speed, +10% speed, −5 HP, −3 armor | Extreme early offense, especially Knife. Very fragile initially; buying HP and armor can repair the penalties while retaining every offensive bonus. Needs separate early-survival and later-scaling tests. |
| [Berserker](../web/src/characters-definitions/berserker.ts) | +5 melee, +20% damage, +30% attack speed, +5 HP, −5 armor | Strong offense; the extra HP largely offsets the starting armor penalty. Damage and attack speed also benefit guns, so this is not mechanically restricted to melee. |
| [Cyborg](../web/src/characters-definitions/cyborg.ts) | +10 HP, +4 ranged, +5 engineering, +10% attack speed, +25 range, +1 armor | Strong early gun specialist with over twice base effective HP and no penalty. Engineering adds damage to Brick, but provides no turret/support play. |
| [Vampire](../web/src/characters-definitions/vampire.ts) | +50 range, +10% life steal, +3 ranged | Strong early gun damage and sustain with no penalty. The former “Fine” verdict understated its synergy with fast guns. Healing depends on successful hits, not damage dealt. |
| [Medic](../web/src/characters-definitions/medic.ts) | +5 HP regeneration, +20 HP, +3 engineering; only Pistol, Hand and Fist at setup and in shops | Durable survival option, but restricted damage progression. Engineering has no effect in this pool. It has no character-specific ally healing or medical-weapon mechanic. |
| [Grandpa](../web/src/characters-definitions/grandpa.ts) | −20% speed, +50% pickup range; exclusive access to AK-47 at setup | Likely weakest with a shared starting weapon: pickup reach cannot replace escape speed, damage or income. AK-47 access is a separate loadout advantage, not proof the character is balanced. |

#### Comparison with Brotato

Brotato often pays for specialization with restrictions, scaling penalties or
conditional power. It does **not** require every character to have a downside:
[Well Rounded](https://brotato.wiki.spellsandguns.com/Well_Rounded) has the same
three positive bonuses as Bulbro. Retain that exception rather than adding
penalties merely for parity.

| Bulbro | Brotato comparison | Implication for Bulbro |
|---|---|---|
| Well Rounded | [Well Rounded](https://brotato.wiki.spellsandguns.com/Well_Rounded): +5 HP, +5% speed, +8 harvesting. | Stat parity only; Bulbro's broader starting choices, waves and shared co-op income still change its value. |
| King | [King](https://brotato.wiki.spellsandguns.com/King): +50 luck; each tier IV weapon adds +25% damage and attack speed, each tier I weapon subtracts 15% of both. Different tier IV/I items add 5/subtract 2 HP respectively. Starts with a tier II weapon. | Bulbro keeps luck but replaces the tier-management tradeoff with unconditional HP, armor and damage. Its shared Sword start is not a King-specific tier upgrade. |
| Evil | No direct counterpart. [Crazy](https://brotato.wiki.spellsandguns.com/Crazy) has +25% attack speed, +100 range with Precise weapons and an extra Knife, but −30% dodge, −10 engineering and −10 ranged damage. [Demon](https://brotato.wiki.spellsandguns.com/Demon) instead buys with HP and converts materials to HP. | Treat Evil as a custom glass cannon. Neither its appearance nor name makes it a Demon equivalent; its universal +60% damage is additional to Crazy-like attack speed. |
| Berserker | No direct counterpart. [Brawler](https://brotato.wiki.spellsandguns.com/Brawler) grants +50% attack speed only with Unarmed weapons, an extra Fist and +15% dodge, at −50 range and −50 ranged damage. | Bulbro's smaller attack-speed bonus works on every weapon and stacks with flat melee and percentage damage. A negative armor stat alone does not establish equivalent specialization. |
| Cyborg | [Cyborg](https://brotato.wiki.spellsandguns.com/Cyborg) starts with an extra Minigun, triples ranged-damage modifications and converts ranged damage to twice as much engineering halfway through each wave. Engineering modifications are reduced 75%; melee and elemental modifications are reduced 100%. | Bulbro is a static ranged bonus package without conversion, scaling modifiers or the extra gun. Do not copy the conversion until structures provide its intended second-half payoff. |
| Vampire | [Vampire](https://brotato.wiki.spellsandguns.com/Vampire) gains damage, life steal and armor as health is missing, with −60% damage, −100 regeneration, −100 consumable healing and 25% lower HP modifications. [Sick](https://brotato.wiki.spellsandguns.com/Sick) has +25% life steal and +12 HP, but loses 1 HP/s and has −100 regeneration. [Ranger](https://brotato.wiki.spellsandguns.com/Ranger) shares +50 range, adds an extra Pistol and 50% stronger ranged modifications, but forbids melee and reduces HP modifications 25%. | Bulbro combines safe ranged reach, immediate flat damage and life steal; it has none of those health, healing or weapon tradeoffs. It is a custom ranged sustain character rather than a copy of Brotato Vampire. |
| Medic | [Doctor](https://brotato.wiki.spellsandguns.com/Doctor) grants +200% attack speed with Medical weapons, −100% global attack speed, +5 regeneration with doubled regeneration modifications, +5 harvesting and halved armor modifications. | Bulbro trades weapon access for a large HP reserve and ordinary regeneration. Pistol, Hand and Fist do not reproduce Doctor's medical attack speed or innate medical-weapon life steal. |
| Grandpa | [Old](https://brotato.wiki.spellsandguns.com/Old) has −10% player speed, −25% enemy speed, +10 harvesting, a 33% smaller map and 10% fewer enemies. | Bulbro doubles the player-speed penalty and omits the enemy slowdown, map change and harvesting compensation. AK-47 must be evaluated against freely available Sword II and Machine Gun starts. |

#### Quantitative checks

These are level-0, character-only calculations using
[combat formulas](../web/src/game-formulas.ts) and the current
[Fist](../web/src/weapons-definitions/fist.ts),
[Knife](../web/src/weapons-definitions/knife.ts) and
[SMG](../web/src/weapons-definitions/smg.ts) definitions at tier I. Expected DPS
weights the rounded normal and critical hit damage by the combined weapon and
character critical chance, then divides by `getAttackCooldown / 1000`.
Assume continuous attacks against one target, all hits connecting, no enemy
mitigation, items, upgrades or class bonuses. This excludes target acquisition,
melee animation/coverage, overkill, knockback and movement; it is not observed
combat DPS. “Unavailable” means outside Medic's weapon pool.

Effective HP is `HP / armor damage multiplier`, before per-hit rounding and
the minimum-1-damage floor; healing and dodge are excluded. Actual starting
levels add their usual HP on top of this isolated comparison.

| Character | HP | Effective HP | Fist DPS | Knife DPS | SMG DPS |
|---|---:|---:|---:|---:|---:|
| Well Rounded | 15 | 15.00 | 10.31 | 11.68 | 17.76 |
| King | 40 | 66.67 | 12.90 | 15.25 | 23.65 |
| Evil | 5 | 4.17 | 38.33 | 41.52 | 39.12 |
| Berserker | 15 | 11.25 | 26.78 | 26.51 | 30.66 |
| Cyborg | 20 | 21.33 | 11.34 | 12.85 | 32.55 |
| Vampire | 10 | 10.00 | 10.31 | 11.68 | 29.53 |
| Medic | 30 | 30.00 | 10.31 | Unavailable | Unavailable |
| Grandpa | 10 | 10.00 | 10.31 | 11.68 | 17.76 |

- **King:** 4.44× Well Rounded's effective HP before its damage, luck and
  pickup bonuses. +10 armor reduces damage 40%; HP and armor multiply in value.
  This is the clearest numerical outlier, not evidence of a measured win rate.
- **Evil:** 3.56× Well Rounded's Knife DPS at only 28% of its effective HP.
  This is a real early risk. Percentage damage, critical chance and attack speed
  remain useful after HP/armor purchases, so test whether that risk fades too
  cheaply. Berserker retains 75% of Well Rounded's effective HP and 2.27× its
  Knife DPS, making its starting defense penalty less severe than it looks.
- **Cyborg / Vampire:** SMG DPS is 1.83× / 1.66× the baseline. Vampire's
  +3 ranged becomes +1.5 unrounded damage per SMG bullet, and its 10% life steal
  nominally yields about 0.59 HP/s from one continuously hitting SMG before
  healing cooldown collisions. Medic's regeneration is about 0.56 HP/s, but
  works without landing hits. Multiple guns favor Vampire's sustain; the shared
  100 ms life-steal cooldown prevents simply multiplying healing indefinitely.
- **Well Rounded:** with no other harvesting changes, 8 harvesting pays 50
  materials and XP in waves 1–5 and 125 in waves 1–10, because each positive
  growth step rounds up. This economy advantage must be included in longer-run
  comparisons; raw starting DPS alone undervalues it.
- **Grandpa:** speed falls from 450 to 360; pickup radius rises from 100 to
  150. Enemy speed is unchanged. In co-op, collected materials/XP are shared,
  so a teammate collecting them can reduce the marginal benefit of Grandpa's
  pickup reach without removing his personal escape-speed penalty.

#### Proposed tuning and validation

The following are **unimplemented playtest candidates**, not established
balanced values. Apply one change at a time and compare against the current
version; do not treat every row as a single required patch.

| Priority | Character | First candidate to test | Reason / follow-up |
|---|---|---|---|
| 1 | King | Reduce +30 HP to +10 and +10 armor to +3. | Cuts character-only effective HP to 24 while retaining its damage/luck identity. If still dominant, test a tier-dependent bonus/penalty design separately, following Brotato King. |
| 2 | Evil | Reduce +60% damage to +30%; keep its current penalties initially. | Tests the largest universal offensive bonus without simultaneously making an already fragile start more lethal. Track early deaths and later recovery separately. |
| 2 | Grandpa | Reduce −20% speed to −10%; test +10 harvesting separately if still weak. | Restores some escape capacity. Compare both AK-47 and a shared start before deciding whether additional economy is necessary. |
| 3 | Vampire | Reduce +3 ranged to +1, keeping range and life steal. | Tests sustain identity with less free early gun damage. Avoid copying Brotato Vampire's healing penalties without its missing-health rewards. |
| 3 | Cyborg | Remove +10 HP while retaining +1 armor and offensive stats. | Tests the ranged specialist's offensive advantage with a smaller defensive reserve. Keep engineering clearly described as Brick-only until structures exist. |
| 3 | Berserker | Test −5 ranged damage alongside its existing bonuses. | Discourages gun builds using its universal attack speed/damage; verify that melee survival remains reasonable. Longer term, class-specific attack speed would express the role more directly. |
| 4 | Medic | Replace the unused +3 engineering with +5 harvesting. | Makes the displayed bonus useful and helps fund its restricted pool. Measure survival before adding medical weapons or stronger healing. |
| Control | Well Rounded | Keep current bonuses. | Provides a stable comparison for income, survival and weapon progression. |

Use the same starting weapon, difficulty, player count and wave horizon for
each paired comparison, with repeated runs rather than a single favorable
shop. Use Pistol or Fist when including Medic; test Knife and SMG separately
for the other characters. Record deaths/damage taken in waves 1–5 and 6–12,
healing actually received, kills, collected material value, harvesting income,
spending and weapon tiers. Run a separate best-start comparison for Sword II,
Machine Gun and Grandpa's AK-47 so loadout strength is not mistaken for a stat
advantage. Repeat solo and in co-op; shared pickup income and XP do not imply
shared regeneration or life steal. The current absence of a wave-20 boss/end
condition prevents a standard Brotato Danger-5 win-rate comparison.

Engineering contributes to Brick damage, but structures are still absent.
The Skull upgrade, Engineering-only items and positive Engineering shop items
remain excluded until structures exist.

#### Suggested character additions

Prioritize Sniper (precision), Demolitionist (explosives) and Farmer
(harvesting economy). Tank, Runner, Brawler and Gambler are further candidates;
Engineer/Summoner depend on future structures or companions. See the
[character proposals](../web/docs/characters.md#suggested-additions) for
strengths, tradeoffs, weapon affinities and implementation needs, and the
[weapon proposals](../web/docs/weapons.md#suggested-additions) for their
potential loadouts. All are unimplemented and require tuning against the
current roster.

## Suggested priority

1. **Economy validation:** playtest income from valued pickups against shop
   spending, especially the custom premium weapon prices.
2. **Weapons:** implement missing piercing and Brick's break/material effect;
   playtest the five custom weapons against the matched stat tables, and tune
   Spear, Revolver and Boomerang.
3. **Enemies:** playtest the 200 ms hit protection, validate the four custom enemies,
   and review behavior differences from the matched roles.
4. **Waves:** playtest waves 13–30 and the endless scaling, fill the wave 9
   lull, add elites/bosses and a win condition,
   and make difficulty scale enemy HP and damage by percentage.
5. **Characters:** first reduce King's unconditional durability, then test
   Evil's offense and Grandpa's speed penalty. Use Well Rounded as a control,
   include Vampire/Cyborg gun scaling, and separate shared-weapon trials from
   the free Sword II, Machine Gun and Grandpa AK-47 starts. See the character
   review above for proposed values and validation criteria.

## Sources

- [Brotato Wiki – Items](https://brotato.wiki.spellsandguns.com/Items)
- [Brotato Wiki – Enemies](https://brotato.wiki.spellsandguns.com/Enemies)
- [Brotato Wiki – Weapons](https://brotato.wiki.spellsandguns.com/Weapons)
- [Brotato Wiki – Pistol](https://brotato.wiki.spellsandguns.com/Pistol)
- [Brotato Wiki – SMG](https://brotato.wiki.spellsandguns.com/SMG)
- [Brotato Wiki – Laser Gun](https://brotato.wiki.spellsandguns.com/Laser_Gun)
- [Brotato Wiki – Dangers](https://brotato.wiki.spellsandguns.com/Dangers)
- [Brotato Wiki – Waves](https://brotato.wiki.spellsandguns.com/Waves)
- [Brotato Wiki – Endless Mode](https://brotato.wiki.spellsandguns.com/Endless_Mode)
- [Brotato – Ultimate Guide to Enemies and Waves](https://gameplay.tips/guides/brotato-ultimate-guide-to-enemies-and-waves.html)
- [Brotato Wiki – Iframes](https://brotato.wiki.spellsandguns.com/Iframes)

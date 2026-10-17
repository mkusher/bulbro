# Characters

See [Weapons](weapons.md), [Items](items.md), and the
[character balance review](../../docs/balance.md#6-characters).

## Current roster

The game registers eight characters in
[characters-definitions/index.ts](../src/characters-definitions/index.ts):
Well Rounded, Vampire, Grandpa, Medic, Berserker, King, Cyborg and Evil.
Their current bonuses, weapon restrictions, Brotato comparisons, calculated
combat benchmarks and proposed balance adjustments are documented in the
[balance review](../../docs/balance.md#6-characters).

Characters normally select one starting weapon and can equip six. Medic has
only Pistol, Hand and Fist in both the starting and shop pools. Grandpa alone
can select AK-47 at setup; Bazooka is shop-only. Sword begins at tier II.
See [starting choices](../src/bulbro/startingWeapons.ts) and the
[weapon reference](weapons.md#tiers-selling-and-combining).

## Suggested additions

These are **unimplemented design proposals**, recorded on 2026-10-17.
Names, bonuses, penalties and weapon affinities below describe intended play
styles; they do not change the current roster or weapon pools. Numerical
values need prototype testing against Well Rounded before adoption.

| Character | Intended strengths | Tradeoff | Weapon affinities and implementation needs |
|---|---|---|---|
| Sniper | High range, ranged damage and critical chance; deliberate long-range attacks. | Slower attacks and weaker melee damage. | Start by testing Pistol and Laser Gun; the proposed Crossbow would add piercing precision. The initial character can use existing stat bonuses. |
| Demolitionist | Larger explosions and increased damage; specializes in clearing groups. | Fewer weapon slots. | Grenade and Bazooka provide an existing explosive pool. Prototype with the current explosion-size, damage and weapon-limit stats. If damage bonuses should apply only to explosives, add that conditional rule explicitly. Preserve Bazooka's shop-only availability unless separately changed. |
| Farmer | Strong harvesting and increasing purchasing power over the run. | Reduced starting damage makes the opening harder. | Hand supports the economy theme through equipped harvesting. Existing harvesting and damage stats support a first prototype. |
| Tank | High armor and regeneration; survives close combat. | Reduced movement speed and damage. | Test Fist and Hand, then the proposed armor-scaling Shield. Existing stats support a first prototype, but distinguish it from Medic's HP reserve and healing. |
| Runner | High movement speed and pickup range; collects materials while avoiding contact. | Low HP and armor. | Broad weapon choices preserve mobility as its defining feature. Existing stats support a first prototype. Test its collector role separately in solo and co-op, where pickup materials and XP are shared. |
| Brawler | Strong attack-speed bonuses specifically for Hand and Fist. | Severe ranged-damage penalties. | Requires weapon-specific bonuses to deliver the intended identity. A global attack-speed bonus would overlap with Berserker; weapon class set bonuses are also currently absent. |
| Gambler | High luck and critical chance; pursues better equipment and critical hits. | Lower reliable damage and durability. | Knife already supports critical builds. Existing stats support a first prototype; verify that critical damage does not erase the intended damage penalty too cheaply. |

### Priorities and validation

Prioritize **Sniper, Demolitionist and Farmer**: they add precision, explosive
specialization and an economy-first play style. Their first versions can use
existing weapons and stats. Resolve the current roster's largest balance
issues alongside this work; new characters should not inherit King's surplus
of unconditional power.

Tank and Brawler are lower priorities because they overlap with Medic and
Berserker. Runner and Gambler offer further options once their mobility and
critical-hit tradeoffs are distinguishable from Grandpa, Vampire and Evil.

Keep **Engineer/Summoner** as future concepts until structures or companions
exist. Brick's engineering scaling alone does not provide the turret or
companion play style those names imply. The proposed Wrench and Mine Layer
are possible foundations; see [weapon proposals](weapons.md#suggested-additions).

Use the [paired character trials](../../docs/balance.md#proposed-tuning-and-validation)
to compare survival, damage, income and equipment progression. Test shared
starts before best-loadout runs, and solo before comparing co-op benefits.
Choose numerical bonuses, starting pools and shop restrictions only after
checking that each character's advantage pays for its tradeoff.

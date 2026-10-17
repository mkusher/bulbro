# Engineering

Reference: [Engineering](https://brotato.wiki.spellsandguns.com/Engineering),
[Structures](https://brotato.wiki.spellsandguns.com/Structures), and individual
weapon/item pages, checked on 2026-10-17.

Every owned structure item and structure-producing weapon supplies its own
structure each wave. Their positions and timers are host-generated events;
plain structure objects and projectile metadata survive network snapshots.
Starting the next wave clears them and creates new structures. Structures are
stationary and cannot be damaged by enemies.

Turrets use Engineering for damage or healing, ignoring player damage, damage
type bonuses, attack speed, crit chance, range, and life steal. Existing secondary
knockback and explosion size bonuses apply. Cooldowns vary randomly from 70% to
130% of the base value per shot. Medical turrets heal their owner with colliding
projectiles; they do not reset HP regeneration or revive dead players.

| Item | Tier | Base price | Effect |
| --- | --- | --- | --- |
| Landmines | I | 15 | One mine immediately and every 12s, 10 + 100% Engineering damage |
| Turret | I | 15 | 10 + 80% Engineering damage, 300 range, 0.73s |
| Medical Turret | II | 40 | 3 + 5% Engineering healing, 400 range, 2.2s |
| Laser Turret | III | 65 | 20 + 125% Engineering damage, 400 range, 0.87s, three pierces |
| Explosive Turret | IV | 80 | 25 + 150% Engineering area damage, 500 range, 0.87s |
| Garden | II | 50 | Fruit immediately and every 15s |
| Incendiary Turret | II | 40 | 1 direct damage, 8 ticks of 5 + 33% Engineering burn, 300 range, 0.28s |

Laser/Explosive Turret use the current Engineering table and item tooltip
coefficients (125%/150%); their individual wiki prose still lists 150%/175%.
Engineering results round down, with a minimum of 1. Gardens create ordinary
3-HP consumables, independent of Engineering. Flames refresh a single burn on
an enemy rather than stacking independent burns.

Mines arm when an enemy enters their trigger and explode when all enemies leave
it. The wiki does not provide trigger sizes, blast radii, or projectile speeds;
Bulbro uses a 20-unit mine trigger, 100-unit mine/turret blast radius, and projectile
speeds of 700 (450 for flames). Laser bullets hit up to four distinct enemies
without repeated hits across ticks. Mines and explosions use enemy hitboxes.

## Tools

The three tools are melee weapons with explicit Brotato stats/prices at every
tier. Buying, combining and selling use the existing weapon tier system.

- Pruner (Support): a garden producing fruit every 15/14/12/10 seconds.
- Screwdriver (Tool): a mine immediately and every 12/9/6/3 seconds. Its melee
  attacks scale with 50% Melee Damage and 50/60/70/80% Engineering.
- Wrench (Tool): a basic/incendiary/laser/explosive turret at tiers I/II/III/IV.
  The melee weapon itself scales with Melee Damage, not Engineering.

Two through six equipped Tool weapons grant +1 through +5 Engineering. The
bonus is derived from inventory and is never written into permanent stats.

Pencil (+1 Engineering), Toolbox (+6 Engineering, -8% Attack Speed), and Cog
(+4 Engineering, +1 Knockback, -4% Damage) are available in the shop, along with
previously filtered mixed-stat Engineering items. Skull upgrades grant
2/3/4/5 Engineering at tiers I/II/III/IV.

Structure attack speed, explosion damage, bonus piercing/bouncing and other
structure-specific item effects are not player stats in Bulbro yet. Their
corresponding Brotato items are outside this implementation.

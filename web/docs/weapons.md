# Weapons

See [Items](items.md) for shop item bonuses and artwork, and
[Game Balance](../../docs/balance.md) for the economy and combat review.

The game registers 14 player weapons and 3 enemy weapons in [weapons-definitions/index.ts](../src/weapons-definitions/index.ts). Each definition supplies an ID, display name, classes, weapon stats, base price, projectile speed, and attack configuration. The [Weapon model](../src/weapon.ts) and [WeaponStats type](../src/weapon/WeaponState.ts) define these fields.

## Player weapons

Bulbros must start with exactly `startingWeapons` weapons (default **1**) and may carry at most `maxWeapons` (default **6**). Both are secondary stats configured through additive `statBonuses`: `{ startingWeapons: 1, maxWeapons: 2 }` requires two starting weapons and allows eight in total. Counts must be nonnegative integers, and the starting count cannot exceed capacity.

Built-in `weapons` count toward the starting requirement. Setup offers the remaining slots, using `defaultWeapons` as initial selections when they are allowed starting choices; duplicate weapons can occupy different slots. Single-player, local co-op, and online readiness require the exact count. Shop purchases stop at capacity without spending materials, unless the offered weapon is already owned at tier I: then the new copy combines with it into tier II (see [Tiers, selling, and combining](#tiers-selling-and-combining)). Rerolls remain available.

These are tier I weapon values before character bonuses, damage scaling, attack speed, critical hits, or shop price adjustments. Cooldowns are in seconds. Range is the weapon’s contribution to attack reach, and knockback is added to the wielder’s knockback. Omitted damage, range, knockback, and critical-chance bonuses contribute zero. Projectile speed is unused for melee attacks and is shown as “—”.

| Weapon | ID | Damage | Cooldown (s) | Range | Knockback | Projectile speed | Base price | Wave-1 price |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Laser Gun | `laserGun` | 4 | 1.98 | 500 | 0 | 1500 | 8 | 9 |
| Hand | `hand` | 1 | 1.01 | 150 | 30 | — | 10 | 12 |
| Fist | `fist` | 8 | 0.78 | 150 | 0 | — | 12 | 14 |
| Knife | `knife` | 6 | 1.01 | 150 | 2 | — | 12 | 14 |
| Flare Gun | `flareGun` | 8 | 1.4 | 420 | 2 | 900 | 15 | 17 |
| Pistol | `pistol` | 2 | 0.5 | 400 | 5 | 1500 | 15 | 17 |
| SMG | `smg` | 1 | 0.2 | 400 | 0 | 1400 | 15 | 17 |
| Double Barrel Shotgun | `doubleBarrelShotgun` | 12 | 1.37 | 350 | 16 | 1500 | 18 | 20 |
| AK-47 | `ak47` | 5 | 0.22 | 500 | 5 | 1800 | 65 | 72 |
| Brick | `brick` | 30 | 1.39 | 150 | 5 | — | 25 | 28 |
| Grenade | `grenade` | 24 | 2 | 300 | 12 | 600 | 28 | 31 |
| Bazooka | `bazooka` | 60 | 2.8 | 650 | 18 | 1000 | 80 | 89 |
| Sword | `sword` | 25 | 0.9 | 80 | 8 | — | 60 | 67 |
| Machine Gun | `machineGun` | 3 | 0.14 | 600 | 2 | 1900 | 70 | 78 |

### Classes, attacks, and damage scaling

Critical chance below is the weapon’s bonus in percentage points; the wielder’s chance is added. Critical hits default to 2× damage, except the knife’s explicit 2.5× multiplier. Scaling percentages describe how much of each corresponding wielder damage stat is added to the weapon’s base damage.

| Weapon | Classes | Attack | Crit chance (%) | Crit multiplier | Damage scaling |
| --- | --- | --- | --- | --- | --- |
| AK-47 | gun, heavy | Projectile | 5 | 2× | 80% ranged |
| Brick | blunt, heavy | Swing 110°, 320 ms | 5 | 2× | 100% melee |
| Double Barrel Shotgun | gun, heavy, explosive | Projectile | 3 | 2× | 80% ranged |
| Fist | unarmed | Thrust 180 ms | 0 | 2× | 100% melee |
| Hand | support | Thrust 220 ms | 0 | 2× | 50% melee |
| Knife | blade, precise | Thrust 200 ms | 20 | 2.5× | 80% melee |
| Laser Gun | gun | Projectile | 3 | 2× | 100% ranged + 50% elemental |
| Pistol | gun, precise | Projectile | 5 | 2× | 100% ranged |
| SMG | gun, support | Projectile | 1 | 2× | 50% ranged |
| Sword | blade, precise | Swing 140°, 260 ms → Thrust 220 ms | 10 | 2× | 100% melee |
| Flare Gun | gun, elemental | Projectile | 3 | 2× | 50% ranged + 100% elemental |
| Grenade | explosive, heavy | Explosion (radius 110) | 3 | 2× | 100% ranged + 50% elemental |
| Machine Gun | gun, heavy | Projectile | 3 | 2× | 60% ranged |
| Bazooka | explosive, heavy, gun | Explosion (radius 140) | 3 | 2× | 150% ranged |

[Combat formulas](../src/game-formulas.ts) apply the wielder’s overall damage percentage after adding scaled damage, then apply critical hits and round the result. Player melee attacks receive half of the wielder’s range stat; projectile attacks receive the full range stat. Attack speed modifies cooldowns, with a 100 ms minimum. Swing/thrust durations above describe strike animation timing, not the interval between attacks.

Grenade and bazooka use the `explosion` attack: the projectile explodes on the first enemy it touches, at the end of its range, or at the map edge, whichever comes first. Every alive enemy whose hitbox overlaps the explosion circle receives the shot’s full damage (the crit roll is shared) and is knocked back away from the explosion center. The radius is the weapon’s `explosionRadius` × (1 + the wielder’s `explosionSize`%), at least 10; enemies have no explosion size. Life steal triggers at most once per explosion. The generator emits a `shotExploded` event, which drives the [explosion animation](../src/graphics/ExplosionEffects.ts) and the explosion sound; firing plays the gunshot (bazooka) or throw (grenade) sound instead.

Every other projectile weapon uses the single-target shot attack. The shotgun’s damage is defined as `3 * 4 = 12`, but its attack does not spawn a pellet spread or two separate shots. The laser gun uses the same projectile attack rather than a continuous beam. The explosive class alone (e.g. the shotgun) does not add splash damage, and elemental weapons do not add burning effects. Flare gun, grenade, machine gun, and bazooka values are initial balance settings.

### Tiers, selling, and combining

Every owned weapon has a tier from I to IV, stored as `tier` on its [WeaponState](../src/weapon/WeaponState.ts) (missing means I, so older snapshots stay valid). The shop sells tier I weapons only; higher tiers come from combining. [WeaponTiers.ts](../src/weapon/WeaponTiers.ts) holds the rules:

- **Stats.** Each tier multiplies the weapon’s damage by 1 / 1.6 / 2.4 / 3.6 (rounded, and at least +1 per tier, so 1-damage weapons still improve), multiplies the cooldown by 1 / 0.93 / 0.85 / 0.75 (rounded to 0.01 s), and adds 3 percentage points of crit chance per tier above I. Range, knockback, explosion radius, crit multiplier, and damage scaling do not change. Brotato’s Pistol, for comparison, goes 12 / 20 / 30 / 50 damage at 1.2 / 1.12 / 1.03 / 0.87 s.
- **Combining.** Two owned weapons of the same type and the same tier combine into one weapon of the next tier. The selected weapon keeps its slot and moves up; the other one is removed, freeing a slot. Tier IV weapons cannot be combined.
- **Value.** A tier is worth the two weapons it is made of: the base price is multiplied by 1 / 2 / 4 / 8, then the usual wave price formula applies.
- **Selling.** Selling pays back 25% of the weapon’s current price at its tier (Brotato’s recycling rate), rounded down and at least 1. The last weapon cannot be sold, so a bulbro is never unarmed.

Selecting a weapon in the pre-round [weapon slots](../src/shop/WeaponSlots.tsx) shows its tier stats with **Sell** and **Combine** buttons. Both actions are `weaponSold` and `weaponsCombined` game events applied by [BulbroState](../src/bulbro/BulbroState.ts), which ignores selling unknown weapons, the last weapon, or for a negative price, and ignores combining weapons that do not match. They are locked once an online player is ready.

| Weapon | Damage I / II / III / IV | Cooldown (s) | Crit (%) | DPS before stats | Wave-1 value | Wave-1 sell price |
| --- | --- | --- | --- | --- | --- | --- |
| Laser Gun | 4 / 6 / 10 / 14 | 1.98 / 1.84 / 1.68 / 1.49 | 3 / 6 / 9 / 12 | 2.0 / 3.3 / 6.0 / 9.4 | 9 / 18 / 36 / 71 | 2 / 4 / 9 / 17 |
| Hand | 1 / 2 / 3 / 4 | 1.01 / 0.94 / 0.86 / 0.76 | 0 / 3 / 6 / 9 | 1.0 / 2.1 / 3.5 / 5.3 | 12 / 23 / 45 / 89 | 3 / 5 / 11 / 22 |
| Fist | 8 / 13 / 19 / 29 | 0.78 / 0.73 / 0.66 / 0.59 | 0 / 3 / 6 / 9 | 10.3 / 17.8 / 28.8 / 49.2 | 14 / 27 / 53 / 106 | 3 / 6 / 13 / 26 |
| Knife | 6 / 10 / 14 / 22 | 1.01 / 0.94 / 0.86 / 0.76 | 20 / 23 / 26 / 29 | 5.9 / 10.6 / 16.3 / 28.9 | 14 / 27 / 53 / 106 | 3 / 6 / 13 / 26 |
| Pistol | 2 / 3 / 5 / 7 | 0.5 / 0.47 / 0.43 / 0.38 | 5 / 8 / 11 / 14 | 4.0 / 6.4 / 11.6 / 18.4 | 17 / 34 / 67 / 133 | 4 / 8 / 16 / 33 |
| SMG | 1 / 2 / 3 / 4 | 0.2 / 0.19 / 0.17 / 0.15 | 1 / 4 / 7 / 10 | 5.0 / 10.5 / 17.6 / 26.7 | 17 / 34 / 67 / 133 | 4 / 8 / 16 / 33 |
| Flare Gun | 8 / 13 / 19 / 29 | 1.4 / 1.3 / 1.19 / 1.05 | 3 / 6 / 9 / 12 | 5.7 / 10.0 / 16.0 / 27.6 | 17 / 34 / 67 / 133 | 4 / 8 / 16 / 33 |
| Double Barrel Shotgun | 12 / 19 / 29 / 43 | 1.37 / 1.27 / 1.16 / 1.03 | 3 / 6 / 9 / 12 | 8.8 / 15.0 / 25.0 / 41.7 | 20 / 40 / 80 / 159 | 5 / 10 / 20 / 39 |
| AK-47 | 5 / 8 / 12 / 18 | 0.22 / 0.2 / 0.19 / 0.17 | 5 / 8 / 11 / 14 | 22.7 / 40.0 / 63.2 / 105.9 | 72 / 144 / 287 / 573 | 18 / 36 / 71 / 143 |
| Brick | 30 / 48 / 72 / 108 | 1.39 / 1.29 / 1.18 / 1.04 | 5 / 8 / 11 / 14 | 21.6 / 37.2 / 61.0 / 103.8 | 28 / 56 / 111 / 221 | 7 / 14 / 27 / 55 |
| Grenade | 24 / 38 / 58 / 86 | 2 / 1.86 / 1.7 / 1.5 | 3 / 6 / 9 / 12 | 12.0 / 20.4 / 34.1 / 57.3 | 31 / 62 / 124 / 247 | 7 / 15 / 31 / 61 |
| Bazooka | 60 / 96 / 144 / 216 | 2.8 / 2.6 / 2.38 / 2.1 | 3 / 6 / 9 / 12 | 21.4 / 36.9 / 60.5 / 102.9 | 89 / 177 / 353 / 705 | 22 / 44 / 88 / 176 |
| Sword | 25 / 40 / 60 / 90 | 0.9 / 0.84 / 0.77 / 0.68 | 10 / 13 / 16 / 19 | 27.8 / 47.6 / 77.9 / 132.4 | 67 / 133 / 265 / 529 | 16 / 33 / 66 / 132 |
| Machine Gun | 3 / 5 / 7 / 11 | 0.14 / 0.13 / 0.12 / 0.11 | 3 / 6 / 9 / 12 | 21.4 / 38.5 / 58.3 / 100.0 | 78 / 155 / 309 / 617 | 19 / 38 / 77 / 154 |

DPS is damage ÷ cooldown before stats and crits. Wave-1 value is what the tier costs in wave-1 prices (two tier I copies make a tier II, four make a tier III, eight make a tier IV).

### Tiles, selection, and shops

[WeaponTitle](../src/weapon/WeaponTitle.tsx) displays the definition’s name and classes, [WeaponStats](../src/weapon/WeaponStats.tsx) displays numeric stats and projectile speed, and [WeaponDisplay](../src/weapon/WeaponDisplay.tsx) renders the atlas sprite. The [weapon gallery](../src/stories/Weapons.stories.tsx) iterates the player registry. Runtime equipped weapons resolve back to their definitions through `fromWeaponState`, or to the definition with tier stats through `ownedWeaponFromState`.

[baseBulbro](../src/characters-definitions/base.ts) makes the player registry available in shops to characters that inherit its weapon pool. Starting choices filter that pool through `excludedStartingWeapons`: AK-47 is only a starting choice for Grandpa, and Bazooka is shop-only for everyone. Both remain normal tier I weapons that can be combined up to tier IV; their premium role comes from their base stats and prices. Characters may override it: the [medic](../src/characters-definitions/medic.ts) allows only pistol, hand, and fist. [ShopItemsGenerator](../src/shop/ShopItemsGenerator.ts) uses the character’s available weapons, exclusions, wave, inflation, and reroll settings; base price is not necessarily the displayed shop price.

## Enemy weapons

These definitions belong to the separate `enemyWeapons` registry and are not offered by the standard player shop. “—” denotes an omitted weapon bonus, not a zero total for the enemy. Enemy damage adds the enemy’s damage stat to the weapon’s damage bonus, without the player damage-scaling/critical-hit calculation. An omitted cooldown falls back to 1 second before attack speed is applied.

| Weapon | ID | Classes | Attack | Damage bonus | Cooldown (s) | Range bonus | Projectile speed | Base price |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ranged Aphid Gun | `aphidGun` | gun | Projectile | — | 2 | — | 275 | 5 |
| Enemy Fist | `enemyFist` | unarmed, heavy | Thrust 250 ms | — | 1 (default) | — | — | 5 |
| Orc Very Slow Gun | `orcGun` | gun | Projectile | 5 | 5 | 2000 | 150 | 5 |

Enemy weapons specify no knockback, critical-chance, or damage-scaling overrides. `enemyFist` is exported as `orcFist`, and `orcGun` as `orcSlowGun`. [Enemy melee attacks](../src/weapon/Attack.ts) use body contact plus the weapon’s range bonus and a small touch margin; they do not use the enemy’s range stat. All three enemy weapon sprite frames are currently empty, so their definitions do not provide visible held-weapon artwork.

## Sprite atlas

All player weapon artwork is packed in [weapons.png](../src/assets/weapons.png), currently 1024 × 976 pixels. The original artwork is preserved pixel-for-pixel in the first 540 rows. The brick, flare gun, grenade, machine gun, and bazooka were added below it.

[Assets](../src/Assets.ts) registers the full-resolution sheet, bundled by Vite with a content-hashed filename. [WeaponSprite](../src/weapon/sprites/WeaponSprite.ts) extracts frames using the full-size atlas coordinates below and scales each sprite programmatically. Gameplay uses ⅛ scale; shop previews default to ½. No pre-scaled sheets are needed.

| Weapon | ID | x | y | Width | Height |
| --- | --- | --- | --- | --- | --- |
| AK-47 | `ak47` | 660 | 238 | 345 | 137 |
| Brick | `brick` | 16 | 576 | 210 | 140 |
| Double Barrel Shotgun | `doubleBarrelShotgun` | 640 | 370 | 360 | 170 |
| Fist | `fist` | 235 | 20 | 155 | 145 |
| Hand | `hand` | 0 | 40 | 145 | 110 |
| Knife | `knife` | 24 | 420 | 296 | 116 |
| Laser Gun | `laserGun` | 76 | 200 | 215 | 170 |
| Pistol | `pistol` | 480 | 20 | 225 | 165 |
| SMG | `smg` | 760 | 10 | 240 | 195 |
| Sword | `sword` | 330 | 260 | 296 | 155 |
| Flare Gun | `flareGun` | 240 | 568 | 240 | 160 |
| Grenade | `grenade` | 496 | 560 | 160 | 192 |
| Machine Gun | `machineGun` | 672 | 584 | 336 | 168 |
| Bazooka | `bazooka` | 16 | 784 | 360 | 180 |
| Ranged Aphid Gun | `aphidGun` | 0 | 0 | 0 | 0 |
| Enemy Fist | `enemyFist` | 0 | 0 | 0 | 0 |
| Orc Very Slow Gun | `orcGun` | 0 | 0 | 0 | 0 |

SMG, knife, sword, and shotgun frames were expanded to avoid clipping their edges. The separate PNGs for the added weapons and their preload entries were removed after packing. When adding or moving artwork, update the full-resolution atlas and the frame in `WeaponSprite.ts`. Keep transparent spacing between frames to avoid texture bleeding.

The five added sprites were generated with the built-in imagegen tool, then packed and resized using Bun and Sharp while preserving transparency. Their original prompts are retained below; prompts for the original nine sprites are not recorded here.

## Generation prompts

### Bazooka

Use case: stylized-concept. Asset type: isolated 2D cartoon game weapon sprite matching a casual colorful cartoon arsenal. One chunky bazooka rocket launcher in strict horizontal side profile, muzzle pointing RIGHT. Long olive-green cylindrical launch tube with wide dark blue-gray metal muzzle rim on the right and flared rear opening on the left, small orange-brown grip below and compact simple sight above. Thick near-black outlines, simple flat cel shading, restrained crisp highlights, bold instantly readable silhouette at tiny size, minimal detail. Entire weapon centered fully visible in a wide landscape canvas with small transparent margin. Genuine transparent background, clean alpha, no backdrop, no glow or cast shadow. No text, logos, hands, person, projectile, muzzle flash or extra objects.

### Brick

Use case: stylized-concept. Asset type: isolated 2D game weapon sprite. Create one red terracotta brick, horizontal long axis, slight three-quarter view with top and right end visible, chunky simple silhouette, small chipped corners, two subtle cracks. Style: polished cartoon game inventory art, thick near-black outlines, flat warm colors with simple cel shading and restrained highlights, matching a casual cartoon arsenal. Center the single object, fill most of a landscape canvas, fully visible with small transparent margin. Genuine transparent background. No text, no shadow outside object, no hands or other objects.

### Flare Gun

Use case: stylized-concept. Asset type: isolated 2D game inventory sprite. Single cartoon flare gun in strict side profile, muzzle pointing right, chunky short wide orange-red barrel, dark blue steel hinge and frame, orange grip angled down left, simple trigger guard. Match casual game weapon artwork with thick near-black outlines, very simple flat cel shading, 2-3 color shades per material, crisp bold readable shapes, no texture noise. Entire object centered and visible with small margin. TRANSPARENT background with clean alpha, no backdrop, no glow, no cast shadow. No text, hands, bullets, effects or extra objects.

### Grenade

Use case: stylized-concept. Asset type: isolated 2D game inventory sprite. Single cartoon olive-green pineapple grenade upright, chunky rounded segmented body, dark blue-gray safety lever, simple visible metal pull ring at top right. Match casual cartoon game weapon artwork, thick near-black outlines, simple flat cel shading, restrained crisp highlights, bold readable shapes, minimal detail. Entire object centered fully visible with a small transparent margin. Genuine TRANSPARENT background with clean alpha, no colored backdrop, no glow, no cast shadow. No text, hands, explosion or other objects.

### Machine Gun

Use case: stylized-concept. Asset type: isolated 2D game weapon sprite. One chunky cartoon light machine gun, strict side profile muzzle pointing right, long dark blue-gray barrel with cooling shroud, substantial receiver, box magazine below, orange-brown stock at left and orange pistol grip. Recognizable machine gun silhouette distinct from a compact submachine gun. Thick near-black outlines, simple flat cel shading with restrained crisp highlights, casual cartoon game inventory art, minimal detail readable at tiny size. Entire object centered fully visible in landscape canvas with small margin. Genuine transparent background, clean alpha, no backdrop, glow or cast shadow. No text, logos, hands, muzzle flash or additional objects.

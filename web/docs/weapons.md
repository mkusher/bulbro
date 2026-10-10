# Weapons

See [Items](items.md) for shop item bonuses and artwork, and
[Game Balance](../../docs/balance.md) for the economy and combat review.

The game registers 14 player weapons and 3 enemy weapons in [weapons-definitions/index.ts](../src/weapons-definitions/index.ts). Each definition supplies an ID, display name, classes, weapon stats, base price, projectile speed, and attack configuration. The [Weapon model](../src/weapon.ts) and [WeaponStats type](../src/weapon/WeaponState.ts) define these fields.

## Player weapons

Bulbros must start with exactly `startingWeapons` weapons (default **1**) and may carry at most `maxWeapons` (default **6**). Both are secondary stats configured through additive `statBonuses`: `{ startingWeapons: 1, maxWeapons: 2 }` requires two starting weapons and allows eight in total. Counts must be nonnegative integers, and the starting count cannot exceed capacity.

Built-in `weapons` count toward the starting requirement. Setup offers the remaining slots, using `defaultWeapons` as initial selections when they are in `availableWeapons`; duplicate weapons can occupy different slots. Single-player, local co-op, and online readiness require the exact count. Shop purchases stop at capacity without spending materials; rerolls remain available.

These are weapon values before character bonuses, damage scaling, attack speed, critical hits, or shop price adjustments. Cooldowns are in seconds. Range is the weapon’s contribution to attack reach, and knockback is added to the wielder’s knockback. Omitted damage, range, knockback, and critical-chance bonuses contribute zero. Projectile speed is unused for melee attacks and is shown as “—”.

| Weapon | ID | Damage | Cooldown (s) | Range | Knockback | Projectile speed | Base price |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AK-47 | `ak47` | 2 | 0.3 | 500 | 5 | 1800 | 5 |
| Brick | `brick` | 30 | 1.39 | 150 | 5 | — | 5 |
| Double Barrel Shotgun | `doubleBarrelShotgun` | 12 | 1.37 | 350 | 16 | 1500 | 5 |
| Fist | `fist` | 8 | 0.78 | 150 | 0 | — | 5 |
| Hand | `hand` | 1 | 1.01 | 150 | 30 | — | 5 |
| Knife | `knife` | 6 | 1.01 | 150 | 2 | — | 5 |
| Laser Gun | `laserGun` | 4 | 1.98 | 500 | 0 | 1500 | 5 |
| Pistol | `pistol` | 2 | 0.5 | 400 | 5 | 1500 | 5 |
| SMG | `smg` | 1 | 0.2 | 400 | 0 | 1400 | 5 |
| Sword | `sword` | 25 | 0.9 | 80 | 8 | — | 5 |
| Flare Gun | `flareGun` | 8 | 1.4 | 420 | 2 | 900 | 7 |
| Grenade | `grenade` | 24 | 2 | 300 | 12 | 600 | 9 |
| Machine Gun | `machineGun` | 3 | 0.14 | 600 | 2 | 1900 | 10 |
| Bazooka | `bazooka` | 40 | 2.8 | 650 | 18 | 1000 | 14 |

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

### Tiles, selection, and shops

[WeaponTitle](../src/weapon/WeaponTitle.tsx) displays the definition’s name and classes, [WeaponStats](../src/weapon/WeaponStats.tsx) displays numeric stats and projectile speed, and [WeaponDisplay](../src/weapon/WeaponDisplay.tsx) renders the atlas sprite. The [weapon gallery](../src/stories/Weapons.stories.tsx) iterates the player registry. Runtime equipped weapons resolve back to their definitions through `fromWeaponState`.

[baseBulbro](../src/characters-definitions/base.ts) makes the player registry available to characters that inherit its weapon pool. Characters may override it: the [medic](../src/characters-definitions/medic.ts) allows only pistol, hand, and fist. [ShopItemsGenerator](../src/shop/ShopItemsGenerator.ts) uses the character’s available weapons, exclusions, wave, inflation, and reroll settings; base price is not necessarily the displayed shop price.

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

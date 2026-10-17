# Weapons

See [Items](items.md), [Enemies](enemies.md), and the [balance review](../../docs/balance.md).

The game registers 14 player weapons and 3 enemy weapons in
[weapons-definitions/index.ts](../src/weapons-definitions/index.ts).

## Brotato analogues

Pistol, SMG, Laser Gun, Hand, Fist, Knife, Sword, Double Barrel Shotgun and
Brick use [Brotato's weapon data](https://brotato.wiki.spellsandguns.com/Weapons),
checked on 2026-10-17. Damage, cooldown, range, knockback, crit chance,
crit multiplier, damage scaling and base prices follow individual tier tables.
Sword begins at tier II, including when selected as a starting weapon; it has
no custom tier-I version. Other starting availability rules are unchanged.

AK-47, Bazooka, Flare Gun, Grenade and Machine Gun have no direct analogue.
They retain their current base stats, prices and generic tier growth.

## Base stats

Values are for each weapon's lowest supported tier, before character bonuses,
attack speed and critical hits. Shotgun damage and scaling apply to each pellet.
Cooldowns are seconds. Projectile speeds remain Bulbro's existing tuning;
melee projectile speed is unused.

| Weapon | ID | First tier | Damage | Pellets | Cooldown | Range | Knockback | Crit chance / multiplier | Base price |
|---|---|---|---|---|---|---|---|---|---|
| AK-47 | `ak47` | 1 | 5 | 1 | 0.22 | 500 | 5 | 5% / ×2 | 65 |
| Brick | `brick` | 1 | 30 | 1 | 1.39 | 150 | 5 | 3% / ×1.5 | 6 |
| Double Barrel Shotgun | `doubleBarrelShotgun` | 1 | 3 | 4 | 1.37 | 350 | 8 | 3% / ×2 | 20 |
| Fist | `fist` | 1 | 8 | 1 | 0.78 | 150 | 15 | 1% / ×1.5 | 10 |
| Hand | `hand` | 1 | 1 | 1 | 1.01 | 150 | 30 | 1% / ×1.5 | 10 |
| Knife | `knife` | 1 | 9 | 1 | 1.01 | 150 | 2 | 20% / ×2.5 | 10 |
| Laser Gun | `laserGun` | 1 | 40 | 1 | 1.98 | 500 | 0 | 3% / ×2 | 15 |
| Pistol | `pistol` | 1 | 12 | 1 | 1.2 | 400 | 15 | 10% / ×2 | 10 |
| SMG | `smg` | 1 | 3 | 1 | 0.17 | 400 | 0 | 1% / ×1.5 | 20 |
| Sword | `sword` | 2 | 30 | 1 | 1.28 | 200 | 5 | 3% / ×2 | 51 |
| Flare Gun | `flareGun` | 1 | 8 | 1 | 1.4 | 420 | 2 | 3% / ×2 | 15 |
| Grenade | `grenade` | 1 | 24 | 1 | 2 | 300 | 12 | 3% / ×2 | 28 |
| Machine Gun | `machineGun` | 1 | 3 | 1 | 0.14 | 600 | 2 | 3% / ×2 | 70 |
| Bazooka | `bazooka` | 1 | 60 | 1 | 2.8 | 650 | 18 | 3% / ×2 | 80 |

## Tier growth and prices

[WeaponTiers.ts](../src/weapon/WeaponTiers.ts) resolves the same tier data for
shop previews, equipment, combining and selling. A weapon's explicit tier
stats override its base stats. Custom weapons use damage multipliers
1/1.6/2.4/3.6, cooldown multipliers 1/0.93/0.85/0.75, and +3 crit chance
per tier above I. These generic rules do not apply to the nine analogues.

Rows list only supported tiers: Sword II/III/IV, all others I/II/III/IV.
Prices shown at wave 1 are comparison values; tier II/III/IV shop offers
first unlock after waves 2/4/8, with chances increased by luck.

| Weapon | Damage per hit | Projectiles | Cooldown | Crit chance | Crit multiplier | Damage scaling | Base prices | Wave-1 prices | Wave-1 sell prices |
|---|---|---|---|---|---|---|---|---|---|
| AK-47 | 5 / 8 / 12 / 18 | 1 / 1 / 1 / 1 | 0.22 / 0.2 / 0.19 / 0.17 | 5 / 8 / 11 / 14 | 2 / 2 / 2 / 2 | 80% rangedDamage / 80% rangedDamage / 80% rangedDamage / 80% rangedDamage | 65 / 130 / 260 / 520 | 72 / 144 / 287 / 573 | 18 / 36 / 71 / 143 |
| Brick | 30 / 60 / 90 / 120 | 1 / 1 / 1 / 1 | 1.39 / 1.39 / 1.39 / 1.39 | 3 / 3 / 3 / 3 | 1.5 / 1.5 / 1.5 / 1.5 | 50% meleeDamage + 50% engineering / 65% meleeDamage + 65% engineering / 80% meleeDamage + 80% engineering / 100% meleeDamage + 100% engineering | 6 / 14 / 22 / 40 | 7 / 16 / 25 / 45 | 1 / 4 / 6 / 11 |
| Double Barrel Shotgun | 3 / 6 / 9 / 9 | 4 / 4 / 4 / 6 | 1.37 / 1.28 / 1.2 / 1.2 | 3 / 3 / 3 / 3 | 2 / 2 / 2 / 2 | 80% rangedDamage / 85% rangedDamage / 90% rangedDamage / 100% rangedDamage | 20 / 39 / 74 / 149 | 23 / 43 / 82 / 164 | 5 / 10 / 20 / 41 |
| Fist | 8 / 16 / 32 / 64 | 1 / 1 / 1 / 1 | 0.78 / 0.73 / 0.69 / 0.59 | 1 / 1 / 1 / 1 | 1.5 / 1.5 / 1.5 / 1.5 | 100% meleeDamage / 100% meleeDamage / 100% meleeDamage / 100% meleeDamage | 10 / 22 / 45 / 91 | 12 / 25 / 50 / 101 | 3 / 6 / 12 / 25 |
| Hand | 1 / 1 / 1 / 1 | 1 / 1 / 1 / 1 | 1.01 / 0.93 / 0.86 / 0.71 | 1 / 1 / 1 / 1 | 1.5 / 1.5 / 1.5 / 1.5 | 50% meleeDamage / 50% meleeDamage / 50% meleeDamage / 50% meleeDamage | 10 / 22 / 45 / 91 | 12 / 25 / 50 / 101 | 3 / 6 / 12 / 25 |
| Knife | 9 / 13 / 18 / 25 | 1 / 1 / 1 / 1 | 1.01 / 0.93 / 0.86 / 0.78 | 20 / 30 / 40 / 50 | 2.5 / 3 / 3.5 / 4 | 80% meleeDamage / 80% meleeDamage / 80% meleeDamage / 80% meleeDamage | 10 / 22 / 45 / 91 | 12 / 25 / 50 / 101 | 3 / 6 / 12 / 25 |
| Laser Gun | 40 / 55 / 70 / 100 | 1 / 1 / 1 / 1 | 1.98 / 1.9 / 1.82 / 1.65 | 3 / 3 / 3 / 3 | 2 / 2 / 2 / 2 | 400% rangedDamage / 450% rangedDamage / 500% rangedDamage / 600% rangedDamage | 15 / 31 / 61 / 122 | 17 / 35 / 68 / 135 | 4 / 8 / 17 / 33 |
| Pistol | 12 / 20 / 30 / 50 | 1 / 1 / 1 / 1 | 1.2 / 1.12 / 1.03 / 0.87 | 10 / 15 / 20 / 25 | 2 / 2 / 2 / 2 | 100% rangedDamage / 100% rangedDamage / 100% rangedDamage / 100% rangedDamage | 10 / 22 / 45 / 91 | 12 / 25 / 50 / 101 | 3 / 6 / 12 / 25 |
| SMG | 3 / 4 / 5 / 8 | 1 / 1 / 1 / 1 | 0.17 / 0.17 / 0.17 / 0.15 | 1 / 1 / 1 / 1 | 1.5 / 1.5 / 1.5 / 1.5 | 50% rangedDamage / 60% rangedDamage / 70% rangedDamage / 80% rangedDamage | 20 / 39 / 74 / 149 | 23 / 43 / 82 / 164 | 5 / 10 / 20 / 41 |
| Sword | 30 / 45 / 65 | 1 / 1 / 1 | 1.28 / 1.13 / 0.98 | 3 / 3 / 3 | 2 / 2 / 2 | 100% meleeDamage / 100% meleeDamage / 100% meleeDamage | 51 / 95 / 190 | 57 / 105 / 210 | 14 / 26 / 52 |
| Flare Gun | 8 / 13 / 19 / 29 | 1 / 1 / 1 / 1 | 1.4 / 1.3 / 1.19 / 1.05 | 3 / 6 / 9 / 12 | 2 / 2 / 2 / 2 | 50% rangedDamage + 100% elementalDamage / 50% rangedDamage + 100% elementalDamage / 50% rangedDamage + 100% elementalDamage / 50% rangedDamage + 100% elementalDamage | 15 / 30 / 60 / 120 | 17 / 34 / 67 / 133 | 4 / 8 / 16 / 33 |
| Grenade | 24 / 38 / 58 / 86 | 1 / 1 / 1 / 1 | 2 / 1.86 / 1.7 / 1.5 | 3 / 6 / 9 / 12 | 2 / 2 / 2 / 2 | 100% rangedDamage + 50% elementalDamage / 100% rangedDamage + 50% elementalDamage / 100% rangedDamage + 50% elementalDamage / 100% rangedDamage + 50% elementalDamage | 28 / 56 / 112 / 224 | 31 / 62 / 124 / 247 | 7 / 15 / 31 / 61 |
| Machine Gun | 3 / 5 / 7 / 11 | 1 / 1 / 1 / 1 | 0.14 / 0.13 / 0.12 / 0.11 | 3 / 6 / 9 / 12 | 2 / 2 / 2 / 2 | 60% rangedDamage / 60% rangedDamage / 60% rangedDamage / 60% rangedDamage | 70 / 140 / 280 / 560 | 78 / 155 / 309 / 617 | 19 / 38 / 77 / 154 |
| Bazooka | 60 / 96 / 144 / 216 | 1 / 1 / 1 / 1 | 2.8 / 2.6 / 2.38 / 2.1 | 3 / 6 / 9 / 12 | 2 / 2 / 2 / 2 | 150% rangedDamage / 150% rangedDamage / 150% rangedDamage / 150% rangedDamage | 80 / 160 / 320 / 640 | 89 / 177 / 353 / 705 | 22 / 44 / 88 / 176 |

Prices use `floor((base + wave + base × wave × 0.1) × inflation)`.
Recycling returns 25% of the current tier price, rounded down, minimum 1.

### Tiers, selling, and combining

Two equal weapons at the same tier combine into the next tier, up to IV.
The selected weapon keeps its slot. Selling the last weapon is blocked.
At capacity, a matching type and tier below IV can still be purchased and
combines before the new equipment is validated against the slot limit.
Shop offers display their tier and equip that tier's stats.

Bulbros start with exactly `startingWeapons` weapons (default 1), including
built-in weapons, and carry at most `maxWeapons` (default 6). Starting weapon
choices, previews and loadout validation share the character's allowed pool.
AK-47 remains a Grandpa-only starting choice and Bazooka remains shop-only.
Medic's pool remains Pistol, Hand and Fist.

## Effects and remaining differences

- Hand grants 3/6/12/25 Harvesting while equipped. This bonus stacks across
  weapons and is removed on sale. It participates in end-of-wave payout and
  harvesting growth.
- Brick scales with both Melee Damage and Engineering, using 50%/65%/80%/100%
  of each stat at tiers I–IV. Structures are still absent.
- Double Barrel Shotgun fires 4/4/4/6 independently aimed pellets with damage
  3/6/9/9 and ranged scaling 80%/85%/90%/100%. Bulbro uses a 0.4-radian
  spread; this spread is implementation tuning, not a verified Brotato value.
- Pistol, Laser Gun and Shotgun still lack Brotato's piercing effects.
  Brick does not break and drop materials. These conditional effects are
  separate from the numeric stat and price match.
- Custom explosive weapons retain their existing splash attacks. Flare Gun
  still has no burning effect. Weapon class bonuses are not implemented.

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

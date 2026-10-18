# Enemies

Six enemy definitions use the numerical stats of role equivalents from
[Brotato's Crash Zone enemies](https://brotato.wiki.spellsandguns.com/Enemies),
checked on 2026-10-17. The mapping follows their existing attack and movement
roles; Bulbro keeps its names, sprites and wave spawn schedules.

| Bulbro enemy | Brotato analogue | HP | HP per wave | Damage | Damage per wave | Speed | Knockback resistance | Materials | Consumable chance |
|---|---|---|---|---|---|---|---|---|---|
| Baby | Baby Alien | 3 | 2 | 1 | 0.6 | 200–300, rolled per spawn | 0% | 1 | 1% |
| Colorado Beetle | Chaser | 1 | 1 | 1 | 0.6 | 380 | 0% | 1 | 2% |
| Aphid | Spitter | 8 | 1 | 1 | 0.75 (projectile) | 200 | 95% | 1 | 3% |
| Wild Boar | Charger | 4 | 2.5 | 1 | 0.85 | 400 | 80% | 1 | 1% |
| Beetle Warrior | Bruiser | 20 | 11 | 2 | 0.85 | 300 | 90% | 3 | 3% |
| Tree | Tree | 10 | 5 | 0 | 0 | 0 | 100% | 3 | 100% |

Base HP and damage are wave-1 values. Each later wave adds the listed growth:
`base + growth × (wave − 1)`. Fractional HP and damage growth is preserved.
Material values do not grow with waves for these analogues. Tree always drops
a consumable; loot crates are not implemented.

[buildEnemyCharacterForWave](../src/enemy/buildEnemyCharacterForWave.ts) applies
wave growth without mutating the definition.
[spawnEnemy](../src/enemy/EnemyState.ts) rolls Baby's speed once per spawn.
Enemy attack speed uses stat points, so its neutral base is 0.

Knockback resistance multiplies incoming knockback by `1 − resistance`.
It does not reduce damage. Trees cannot be knocked back.

## Custom enemies and remaining differences

Roach, Beetle Archer, Hedgehog and Badger have no established direct analogue.
Their base stats are custom. Their per-wave growth follows the late Brotato
enemies they replace in waves 13–30, so they keep up with the matched roles:

| Bulbro enemy | Late-wave role | HP | HP per wave | Damage | Damage per wave | Materials |
|---|---|---|---|---|---|---|
| Roach | Pursuer | 10 | 4 | 3 | 1 | 3 |
| Badger | Helmet Alien | 10 | 4 | 3 | 0.85 | 3 |
| Hedgehog | Fin Alien | 6 | 3 | 3 | 0.85 | 3 |
| Beetle Archer | Fly | 2 | 5 | 3 | 0.85 | 1 |

Previously, none of them gained damage, Hedgehog and Badger gained 1 HP per
wave, and Beetle Archer gained one material value per wave.

After wave 30 every enemy also gets the endless HP, damage and speed
multipliers described in the [balance review](../../docs/balance.md#waves-after-30).

Only numerical stats and rewards are matched. Bulbro retains its own AI,
charge timing, body sizes, attack cooldowns, projectile speeds, spawn schedules
and difficulty rules. Aphid fires projectiles; it does not implement Spitter's
separate contact damage growth of 0.6. There is no loot crate system, and the
matched enemies do not gain Brotato's difficulty-based HP/damage multipliers.
Players still have no invulnerability interval after taking a hit.

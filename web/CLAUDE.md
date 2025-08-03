# Project Description

It is a bun monorepo project for an pixijs game with bun as build environment. The game is roguelike arcade shooter. The game is split into 60 seconds rounds.
There might be from 1 to 4(2 at the moment) players. Each player controls a single character called bulbro. Each character is a potato which can have up to 6 weapons. A player has stats. Stats are:
- max hp
- hp regeneration
- damage
- melee damage
- ranged damage
- elemental damage
- attack speed
- cric chance
- engineering
- range
- armor
- dodge
- speed
- luck
- harvesting

Each weapon has a class or several. Classes are blade, blunt, elemental, explosive, gun, heavy, precise, support, tool, unarmed
Each weapon characteristics. Characteristics are a bonuses to the player's stats.

# Build environment

The build tool is bun. You should ALWAYS use bun instead of npm, yarn, pnpm and npx. All code should be in typescript

# Project structure

Project consists of
- web game with 2 entry points for web and telegrap mini app
- server which is responsible for signaling for lobby and in-game. In-game signaling should be also implemented using webrtc for actual data messages and server then is only needed to establish and re-establish connections


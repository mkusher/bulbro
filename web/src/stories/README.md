# Storybook Battle Scenes

This directory contains interactive Storybook stories for testing and showcasing the game's battle mechanics.

## Available Stories

### Game Scenes / Combat Scenarios

Battle scene stories with full UI controls and player controls:

1. **BulbroVsBaby** - Basic combat scenario with a baby enemy
2. **BulbroVsAphid** - Combat against an Aphid enemy
3. **BulbroVsBeetleWarrior** - Combat against a tougher Beetle Warrior
4. **BulbroVsMultipleEnemies** - Arena combat with 4 enemies
5. **FullyLoadedBulbro** - Test a fully equipped character with 6 weapons

### UI Controls

Each battle scene includes:

- **Game Scene Controls Panel** (top-left)
  - Play/Pause/Stop buttons
  - Step through frames
  - Timed playback
  - Scene state and tick count

- **In-Game UI Overlays** (from StageWithUi)
  - **Timer** (top-center) - Round countdown
  - **Wave Number** (top-center) - Current wave
  - **Health Bar** (top corners) - Player health and experience
  - **Materials Indicator** (top corners) - Collected materials

- **Stats Panel** (top-right)
  - **Game Stats** - Wave number, enemy count, kills
  - **Player Stats** - HP, level, XP, materials, weapons
  - **Detailed Stats** (optional) - All character stats and bonuses

- **Touch Controls** (bottom-center, optional)
  - Virtual joystick for mobile testing

### Player Controls

**Movement:**
- WASD or Arrow keys - Move character
- Mouse - Aim direction (weapons auto-fire)

**Scene Controls:**
- Space - Play/Pause
- S - Stop and reset
- N - Step forward one frame

### Storybook Controls

Each story has customizable parameters:

- **bulbroX/bulbroY** - Initial player position
- **enemyX/enemyY** - Initial enemy position
- **bulbroType** - Select character type (well-rounded, berserker, etc.)
- **debug** - Show debug visuals
- **enableKeyboard** - Enable keyboard controls and shortcuts
- **showGameStats** - Show stats panel on the right
- **showPlayerStats** - Show detailed character stats in the stats panel
- **showTouchControls** - Show touch/virtual joystick

## Running Storybook

```bash
cd web
bun run storybook
```

Then navigate to http://localhost:6006

## How to Use

1. Select a story from the sidebar
2. Click "Play" in the Game Scene Controls to start the simulation
3. Use WASD/Arrows to move your character
4. Mouse to aim and shoot
5. Adjust parameters in the Storybook Controls panel
6. Use Step mode for frame-by-frame debugging

## Development

These stories use:
- `StorybookGameScene` - Main wrapper component
- `StorybookSceneWithUi` - Scene with in-game UI elements (timer, health bars, etc.)
- `AutoCenterOnPlayerCamera` - Camera that follows player
- `GameSceneControls` - Playback controls
- `GameStatsOverlay` - Live game statistics
- `gameSceneStore` - Centralized game state management
- Real game controls from `controls/` directory
- Full game loop from `TickProcess`

### Camera Behavior

The camera automatically follows the player character as they move around the map:
- Map size: 2000x1500 (full classic map)
- Viewport: 800x600 (default, configurable)
- Camera centers on player position
- Proper scaling to fit viewport

All changes to game mechanics are immediately visible in Storybook!

# Moving Game Controls from Storybook Stories to Addon Panels

## Current Situation Analysis

### Existing Setup
- **Storybook Version**: 9.1.2 with Preact-Vite framework
- **Current Controls**: Game controls are embedded within stories via `<GameSceneControls />` component
- **Control Location**: Rendered as fixed overlay on top-left of each game scene story
- **Control Features**:
  - Play/Pause/Stop game state
  - Step-by-step execution (configurable step size)
  - Timed play functionality
  - Real-time status display (state, ticks, elapsed time)
  - Keyboard shortcuts (Space, S, N keys)

### Current Control Implementation
- `GameSceneControls.tsx`: UI component with game control buttons and state display
- `gameSceneStore.ts`: State management for game scene with exported functions (play, pause, stop, step, etc.)
- Used in `StorybookGameScene.tsx` and multiple story files for game scenes

## Implementation Plan

### Phase 1: Create Custom Storybook Addon Structure

#### 1.1 Set up Addon Directory Structure
```
web/.storybook/
├── addons/
│   └── game-controls/
│       ├── register.js
│       ├── Panel.tsx
│       └── index.ts
```

#### 1.2 Register the Addon
- Update `web/.storybook/main.ts` to include the new local addon
- Create addon registration file using `addons.register()` API
- Register panel type using `types.PANEL`

### Phase 2: Migrate Control Logic to Panel

#### 2.1 Create Panel Component
- Create `Panel.tsx` that renders the game controls interface
- Import and utilize existing `gameSceneStore` functions
- Maintain all current functionality (play/pause/stop/step/timed play)
- Preserve keyboard shortcuts functionality
- Include real-time status updates using Preact signals

#### 2.2 Panel Integration
- Use `AddonPanel` component from `storybook/internal/components`
- Implement proper `active` state handling for panel visibility
- Ensure panel works across all game scene stories

### Phase 3: Update Story Components

#### 3.1 Remove Embedded Controls
- Remove `<GameSceneControls />` from `StorybookGameScene.tsx`
- Clean up any control-related props that are no longer needed
- Maintain backward compatibility for non-game-scene stories

#### 3.2 Update Story Definitions
- Remove any control-related argTypes from game scene stories
- Keep story-specific args (bulbroType, selectedWeapons, etc.)
- Ensure stories still work correctly without embedded controls

### Phase 4: Enhance Panel Experience

#### 4.1 Panel-Specific Features
- Add panel title "Game Scene Controls"
- Implement proper panel sizing and responsive design
- Add visual feedback for active/inactive states

#### 4.2 Story Communication
- Ensure panel can detect which story is currently active
- Maintain state synchronization between panel and active story
- Handle story switching gracefully

### Phase 5: Testing and Refinement

#### 5.1 Functionality Testing
- Verify all control functions work from panel
- Test keyboard shortcuts still function
- Ensure multi-story switching works correctly
- Validate state persistence and reset behavior

#### 5.2 UI/UX Polish
- Optimize panel layout for Storybook's addon panel space
- Ensure controls are intuitive and accessible
- Test responsiveness across different screen sizes

## Technical Implementation Details

### Addon Registration Pattern
```typescript
import { addons, types } from 'storybook/manager-api';
import { Panel } from './Panel';

const ADDON_ID = 'bulbro/game-controls';
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Game Controls',
    render: ({ active }) => <Panel active={active} />,
  });
});
```

### State Management Strategy
- Leverage existing `gameSceneStore.ts` signals and functions
- Panel component subscribes to game state signals for real-time updates
- Maintain existing keyboard shortcut system
- Handle story switching by detecting active story changes

### File Modifications Required

#### New Files
- `web/.storybook/addons/game-controls/register.js`
- `web/.storybook/addons/game-controls/Panel.tsx`
- `web/.storybook/addons/game-controls/index.ts`

#### Modified Files
- `web/.storybook/main.ts` (add local addon)
- `web/src/stories/StorybookGameScene.tsx` (remove GameSceneControls)
- All game scene story files (cleanup if needed)

### Benefits of This Approach

1. **Cleaner Stories**: Game scenes no longer have overlay controls obscuring the view
2. **Consistent UX**: Controls appear in standard Storybook addon panel location
3. **Better Organization**: Separates control logic from story presentation
4. **Reusability**: Panel works across all game scene stories automatically
5. **Professional Look**: Follows Storybook UI patterns and conventions

### Potential Challenges

1. **State Synchronization**: Ensuring panel state stays in sync with active story
2. **Keyboard Shortcuts**: Maintaining global keyboard shortcuts while panel is active
3. **Story Switching**: Handling state reset/preservation when switching between stories
4. **Development Workflow**: Local addon development and hot reloading

## Success Criteria

- [ ] Game controls no longer appear as overlay in stories
- [ ] Panel appears in Storybook's addon panel area
- [ ] All existing control functionality works from panel
- [ ] Keyboard shortcuts continue to function
- [ ] Panel works across all game scene stories
- [ ] No regression in existing story functionality
- [ ] Clean, professional Storybook integration
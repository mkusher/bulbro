# Sound Design Guide

This document describes the audio style and technical specifications for all sounds in the project, inspired by Brotato's intense action roguelike aesthetic.

## General Audio Style

### Genre & Mood
- **Primary Genre:** Electronic / Synthwave / EDM
- **Subgenres:** Dubstep influences, deep bass, arcade action
- **Mood:** Adrenaline-pumping, high-energy, sci-fi tension
- **Aesthetic:** Alien invasion, arcade shooter, retro-futuristic

### Technical Specifications
| Parameter | Value |
|-----------|-------|
| Sample Rate | 44.1 kHz |
| Bit Rate | 160 kbps (MP3) |
| Channels | Mono |
| Format | MP3 (MPEG Layer III) |

### Audio Engine
- Web Audio API with `AudioContext`
- Separate gain nodes for BGM and sound effects
- Independent volume controls
- Preloaded `AudioBuffer` for instant playback

### Volume Defaults
- **BGM Volume:** 35% (0.35)
- **Effects Volume:** 50% (0.50)

---

## Background Music (BGM)

**File:** `sounds/bgm.mp3`  
**Duration:** 60 seconds  
**Tempo:** 140 BPM  
**Key:** A minor  
**Time Signature:** 4/4

### Track Structure Overview

| Section | Time | Description |
|---------|------|-------------|
| Intro | 0-6s | Half-time feel, atmospheric build |
| Build-up | 6-12s | Full drums enter, energy increases |
| Main + Piano | 12-47s | Full arrangement with piano melody |
| Piano Fade Out | 47-52s | Piano gradually fades (5 seconds) |
| Outro | 52-60s | Base track continues, final fade at 58s |

---

### Instruments

#### 1. Sub Bass
- **Frequency:** 55 Hz (A2)
- **Character:** Deep, rumbling foundation
- **Modulation:** 4 Hz tremolo (LFO) with 50% depth for dubstep-style wobble
- **Volume:** 60%
- **Duration:** Full track (0-60s)

#### 2. Mid Bass
- **Frequency:** 110 Hz (A3)
- **Character:** Adds body and punch above sub bass
- **Modulation:** 6 Hz tremolo with 40% depth
- **Volume:** 40%
- **Entry:** 6 seconds (after intro)
- **Duration:** 6-60s

#### 3. Synth Pads (Atmospheric Layer)

**Pad 1 & 2 (Detuned Pair):**
- **Frequencies:** 220 Hz and 221 Hz (A4, slightly detuned)
- **Purpose:** Creates warm, thick texture through beating frequencies
- **Volume:** 25% each
- **Fade in:** 0-4s
- **Duration:** Full track

**Pad 3 (Fifth):**
- **Frequency:** 165 Hz (E3 - perfect fifth below A)
- **Purpose:** Harmonic depth
- **Volume:** 20%
- **Entry:** 6 seconds
- **Duration:** 6-60s

**Pad 4 (High):**
- **Frequency:** 330 Hz (E4)
- **Modulation:** 2 Hz tremolo, 30% depth
- **Purpose:** Adds brightness and energy
- **Volume:** 15%
- **Entry:** 12 seconds
- **Duration:** 12-60s

#### 4. Lead Synths
- **Frequencies:** 440 Hz and 442 Hz (A5, detuned pair)
- **Modulation:** 8 Hz tremolo, 80% depth (fast shimmer)
- **Volume:** 12% each
- **Entry:** 6 seconds
- **Duration:** 6-60s

---

### Drums

#### Kick Drum
- **Frequencies:** 70 Hz + 40 Hz layered
- **Character:** Punchy electronic kick with sub weight
- **Envelope:** Fast attack (20ms), medium decay (80ms)
- **Pattern:**
  - **Intro (0-6s):** Half-time - every 2 beats (857ms spacing)
  - **Main (6-60s):** Four-on-the-floor - every beat (428ms spacing)
- **Volume:** 70% (intro), 90% (main)

#### Snare
- **Source:** White noise, highpass filtered at 1500 Hz
- **Envelope:** Fast attack, 100ms decay
- **Pattern:** Beats 2 and 4 (every 857ms, offset by 428ms)
- **Entry:** 6 seconds
- **Volume:** 50%

#### Hi-Hat
- **Source:** White noise, highpass filtered at 8000-9000 Hz
- **Pattern:** 16th notes (9.33 Hz tremolo gating at 140 BPM)
- **Intro (0-6s):** Softer, 6% amplitude, 9kHz filter
- **Main (6-60s):** Fuller, 12% amplitude, 8kHz filter

#### Crash Cymbal
- **Source:** Pink noise, highpass at 3000 Hz
- **Envelope:** 500ms sustain, 1.5s fade out
- **Placement:**
  - 6 seconds (section transition)
  - 30 seconds (mid-track emphasis)
- **Volume:** 100% at 6s, 70% at 30s

---

### Piano Melody

The piano is the main melodic element, providing an emotional hook during the main section.

#### Sound Design
- **Waveform:** Layered sine waves (7 components)
  - Fundamental frequency
  - 2 detuned copies (+1 Hz, -1 Hz) for warmth
  - 2nd harmonic (2x frequency)
  - 3rd harmonic (3x frequency)
  - 4th harmonic (4x frequency)
  - 5th harmonic (5x frequency)
- **Harmonic Volumes:** 35%, 15%, 15%, 12%, 8%, 4%, 2%
- **Envelope:**
  - Attack: 8ms (percussive)
  - Decay: 150ms to sustain
  - Release: 1 second fade
- **Filter:** Lowpass at 6000 Hz (removes harshness)
- **Note Duration:** 1.2 seconds with gradual decay

#### Notes Used
| Note | Frequency | Role |
|------|-----------|------|
| A4 | 440 Hz | Root note |
| B4 | 494 Hz | Transition note |
| C5 | 523 Hz | Minor third |
| D5 | 587 Hz | Fourth |
| E5 | 659 Hz | Fifth |
| F5 | 698 Hz | Variation |
| G5 | 784 Hz | Minor seventh |
| A5 | 880 Hz | Octave |

#### Chord Progressions (4 Patterns, 8 notes each)

**Pattern 1 - Basic Arpeggio:**
```
A4 -> C5 -> D5 -> E5 -> G5 -> E5 -> D5 -> C5
```

**Pattern 2 - Transition (with B4 and F5):**
```
A4 -> B4 -> C5 -> E5 -> G5 -> F5 -> E5 -> D5
```

**Pattern 3 - Wide Arpeggio (reaches A5):**
```
A4 -> C5 -> E5 -> G5 -> A5 -> G5 -> E5 -> C5
```

**Pattern 4 - Return to Basic:**
```
A4 -> C5 -> D5 -> E5 -> G5 -> E5 -> D5 -> C5
```

Patterns cycle every 8 notes, creating variation throughout the piano section.

#### Timing
- **Note Spacing:** 428ms (one beat at 140 BPM)
- **Start:** 12 seconds
- **End:** ~52 seconds
- **Total Notes:** ~93 notes

#### Volume Envelope

**Fade In (12s - 15s):**
- Duration: 3 seconds
- Curve: Linear 0% to 100%
- Purpose: Smooth introduction of melody

**Main Section (15s - 47s):**
- Duration: 32 seconds
- Volume: 35% (constant)
- Full piano presence

**Fade Out (47s - 52s):**
- Duration: 5 seconds
- Curve: Linear 100% to 0%
- Purpose: Gentle exit, prevents abrupt cutoff

---

### Track Transitions

#### Intro to Build-up (0s - 6s)
- Sub bass and pads establish atmosphere
- Half-time kick creates anticipation
- Soft hi-hats add subtle rhythm

#### Build-up Drop (6s)
- **Crash cymbal** marks transition
- Kick switches to four-on-the-floor
- Snare enters on backbeats
- Hi-hats become fuller
- Mid bass and additional pads enter

#### Piano Entry (12s)
- Piano fades in over 3 seconds
- High pad (330 Hz) also enters here
- Creates melodic focus

#### Mid-Track Emphasis (30s)
- Second crash cymbal
- Reinforces energy

#### Piano Exit (47s - 52s)
- 5-second gradual fade
- Base track continues underneath
- Smooth transition back to instrumental

#### Final Fade (58s - 60s)
- 2-second fade out
- Prepares for seamless loop

---

### Looping

The track is designed for seamless looping:
- Fade in at start (1 second)
- Fade out at end (2 seconds, starting at 58s)
- Similar energy levels at loop points
- No jarring transitions when track repeats

---

## Sound Effects

### Gunshot (`gunshot.mp3`)
- **Size:** 5.4 KB
- **Use:** Weapon fire

### Laser (`laser.mp3`)
- **Size:** 1.1 KB
- **Use:** Laser weapon fire

### Kick (`kick.mp3`)
- **Size:** 1.1 KB
- **Use:** Melee/impact sounds

### Explosion (`explosion.mp3`)
- **Size:** 18 KB
- **Use:** Enemy destruction, explosions

---

## Implementation Notes

### Browser Autoplay Policy
Audio engine initializes on first user interaction to comply with browser autoplay restrictions.

### Volume Control
- Master audio toggle affects all sounds
- BGM and effects have independent volume controls
- Reactive signals update gain nodes in real-time

### Preloading
All audio files are preloaded into `AudioBuffer` objects during initialization for instant playback with zero latency.

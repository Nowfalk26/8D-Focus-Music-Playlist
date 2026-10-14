# Google Stitch UI Screen Mapping Documentation
**Project ID:** `12328327054658467086`  
**Project Title:** Flow 8D - Premium Spatial Playlist Workstation & Audio Suite  
**Theme Name:** Obsidian Soundstage  

---

## Design System Tokens & Specs (Source: Google Stitch)
- **Primary Canvas / Background:** `#060609` (Obsidian 950), `#0a0a14` (Obsidian 900), `#0e0e1a` (Obsidian 850)
- **Surfaces & Cards:** `#131322` (Obsidian 800), `#1b1b30` (Obsidian 700), Glass Panels `rgba(14, 14, 26, 0.75)` with `backdrop-filter: blur(16px)`
- **Accent Palettes:**
  - Electric Cyan: `#00f2fe`
  - Neon Purple / Violet: `#b026ff` / `#8a2be2`
  - Neon Magenta Pop: `#f72585` / `#ff007f`
  - Emerald Active: `#10b981`
  - Warning Amber: `#f59e0b`
- **Typography:**
  - Display / Headings: `Syne`, `Plus Jakarta Sans`
  - Body & UI: `Inter`, `system-ui`
  - Telemetry & Metadata: `JetBrains Mono`
- **Component Geometry:**
  - Pill badges & buttons: `rounded-full`
  - Cards & modals: `rounded-2xl` / `rounded-3xl`
  - Glass borders: `1px solid rgba(255, 255, 255, 0.07)` or `rgba(0, 242, 254, 0.25)`

---

## Screen Inventory & Component Mapping

| # | Stitch Screen ID | Screen Title in Stitch | Target Codebase Component | Primary Features & Integrated Logic | Status |
|---|---|---|---|---|---|
| **1** | `ebe285b540ae4c57b7e06492f1465499` | **Flow 8D - Premium Spatial Playlist Workstation** | `web-admin/src/components/HomeScreen.jsx` | Audio Universe Switcher (`normal`, `8d`, `9d`), Smart No-Repeat Playback Cycle HUD, Category Filter Carousel, ML Recommendations, Now Playing Hero Card, Top Spatial Tracks. | Completed & Verified |
| **2** | `6aed05e5740f4d22b7c9d7d004f69130` | **Flow 8D - Music Taste & ML Fingerprint Profile** | `web-admin/src/components/TasteProfileScreen.jsx` | User Auditory Fingerprint DNA, 6-Axis Acoustic Radar (Energy, Valence, Danceability, Instrumentalness, Acousticness, Tempo), Top Genres & Artists, Listening Journey History, Recalibrate ML Engine. | Completed & Verified |
| **3** | `001fc94c2e4f4b8caecc03a6e48318bc` | **Flow 8D - 360° Binaural Orbit Studio Stage** | `web-admin/src/components/OrbitStageScreen.jsx` & `Player360.jsx` | 3D Interactive Binaural Orbit Canvas, Soundstage Spatial Vector Field (Axis X, Y, Z), Ear Phase Balance (L/R %), Realtime Spectrum Intensity Analyzer, HRTF Matrix Controls, Head Tracking HUD. | Completed & Verified |
| **4** | `2ffd84c1ee6d41b0ade4bac66bb60e1d` | **Flow 8D - AI 8D Studio & Customizer** | `web-admin/src/components/Studio8D.jsx` | Binaural Orbital Radar with Animated Emitter, RPM Speed Controller, Spatial Depth Slider, 8D Spatial Presets (Chill Orbit, Deep Trance, Hyperspace, Holographic Bloom), Live DSP Toggles. | Completed & Verified |
| **5** | `5705945e70c04c35905e45b037b3c4c6` | **Flow 8D - 8D Audio Library & Spatial Archive** | `web-admin/src/components/MusicLibrary.jsx` | Complete Spatial Audio Archive, Universe Filter Pills, Category Filter Tags, Search Bar with Shortcut `⌘K`, Track Table with Spatial Indicators, Smart Cycle Tracker, Play/Pause Triggers. | Completed & Verified |

---

## Functional Integrity Commitments
- **Smart No-Repeat Cycle System:** Maintained across all 5 screens via `PlaybackCycleManager.js` and `PlayerContext.jsx`. Songs do not repeat until full cycle finishes.
- **Audio Modes (3 Universes):** `normal`, `8d`, and `9d` modes are togglable with animated transitions and mode-specific catalog filtering.
- **Milo AI Companion:** Interactive chat and contextual emotional support + song recommendation support preserved with human-like multi-bubble responses.
- **Audio DSP & Offline Synthesizer:** Preserved Web Audio API orbit panner and offline pink/binaural generator for zero-drop playback.

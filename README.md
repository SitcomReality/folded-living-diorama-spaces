# Folded Living — Design Summary (MVP)

## Core Concept
- Cozy low-poly creative sandbox of modular “cube dioramas” (open side for viewing)
- Cubes unfold into configurable 6 surfaces: Portal, Backdrop, Sky, Earth, Wings (L/R)
- Asynchronous social discovery with lightweight progression

## Player Goals
- Create and personalize a cube within asset budgets
- Share cubes to earn “Sparkle” currency
- Explore, react, and collect rewards
- Optional future real-time gatherings

## Key Mechanics
- Unfold/Fold: Stored folded; unfolds to 5-sided stage (open Portal face)
- Surface Roles (fold-agnostic names):
  - Portal = UI surface (front)
  - Backdrop = rear
  - Sky = top
  - Earth = ground
  - Wings = left/right
- Building:
  - Asset budgets: poly cap + dynamic light cap (2–4)
  - Lighting modes: baked vs. raytraced presets
  - Asset list + highlight on click
- Gravity/Orientation:
  - “Relative gravity” when surfaces reconfigure
  - Auto-rotate to surface normal, manual override, snap-to-surface toggle

## UX & Navigation
- Portal becomes 2D gallery when folded
- Gallery shows cube previews; click to transition via camera zoom + unfold
- Smooth 2D/3D transitions; clean HUD, toolbar, and inspector

## Economy (Sparkle)
- Earn: visits (passive), positive reactions, daily cosmetic bonus
- Spend: unlock assets, customization slots, advanced materials/presets
- Philosophy: reward creativity, avoid grind/pay-to-win

## Social Model
- MVP: Asynchronous shared gallery (persisted cubes)
- Future: Real-time avatars/hubs (cafés/parks), collaborative mini-builds, themed events

## Tech & Art
- Low-poly, soft-shaded; later .glb asset support
- Three.js prototype: cube folding, placement, selection, camera transitions
- Websim records for persistence (cube_v1); simple, modular file structure

## Open Questions
- Best loop for rewarding live presence without grind?
- Default behaviors for orientation flips; preview + override UX
- Prevent “empty spaces”: featured cubes, seasonal neighborhoods

## Core Loops
- Create: Build within budgets, choose layout
- Share: Fold, publish to gallery, earn from visits
- Explore: Browse, visit, react, earn
- Customize: Spend Sparkle on assets/lighting/themes
- Gather (optional): Join social spaces/events


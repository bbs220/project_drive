# 🏎️ Project Drive: Multi-Vehicle Physics & Cyberpunk Sandbox

## 📋 1. Project Overview

* **Concept:** High-performance, web-based 3D multi-vehicle sandbox inspired by modern vehicle simulations and Tron/cyberpunk aesthetics.
* **Core Experience:** Seamless real-time switching between on-foot character exploration and distinct physics-driven vehicles (Sports Car, Aerobatic Plane, Tactical Helicopter) across an expandable neon proving ground.
* **Architecture:** Built on React 19, React Three Fiber (Three.js), Rapier 3D physics (WASM), and Zustand state management, achieving a locked 60–120 FPS with zero runtime garbage collection pressure.

---

## 🛠️ 2. Technology Stack & Key Systems

| Domain | Technology | Implementation Highlights |
| :--- | :--- | :--- |
| **Core & Routing** | React 19, TypeScript, React Router 7, Vite | Monolithic static architecture preventing WebGL context recreation and Suspense unmount churn. |
| **3D & Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` | Single WebGL context, instanced meshes, custom camera rig with dynamic FOV warp. |
| **Physics Engine** | `@react-three/rapier` | Deterministic WASM physics stepping synchronized with the simulation pause lifecycle (`paused={isPaused}`). |
| **Shaders** | `vite-plugin-glsl`, GLSL | Custom shaders for neon cyber-grid terrain, analytical SDF screen-quad minimap masking, and vehicle trails. |
| **State Management** | `zustand` | Non-persistent, isolated telemetry and UI stores. High-frequency physics updates decoupled from React render loops. |
| **Minimap System** | Offscreen FBO (`WebGLRenderTarget`) | Single-context GPU offscreen rendering with viewport scissor blit, heading tracking, and GSAP expansion (`M` key). |
| **Input & Focus Gate** | Native DOM + Hardware Pointer Lock | Strict focus gating: vehicle inputs strictly require active pointer lock; auto-flushes on blur/unlock. |
| **Audio & Ambiance** | `use-sound`, Howler.js | Multi-station synthwave radio HUD (`RadioHUD`), mechanical UI clicks, and throttled slider feedback. |
| **UI & Styling** | Tailwind CSS v4, Lucide React, GSAP | Tron-style telemetry HUD, pause navigation menu, and telemetry-styled Play button. |

---

## ⚙️ 3. Core Mechanics & Architecture

### 3.1 Multi-Vehicle Physics Simulation
* **Sports Car**: Raycast vehicle physics with drift dynamics, slip-angle evaluation, tire glow effects, and nitrous boost lag.
* **Aerobatic Plane**: Aerodynamic flight model featuring pitch, yaw, and roll banking with timestep-aware angular velocity headroom clamping to prevent dive jitter.
* **Tactical Helicopter**: VTOL flight dynamics with independent collective lift, dual-rotor physics, and throttled telemetry for artificial horizon and altimeter tapes.
* **On-Foot Operative**: Capsule collider character with sprint, jump, and vehicle mounting/unmounting (`F` key).

### 3.2 Single-Context FBO Minimap
* **Zero Multi-Context Overhead**: Replaced dual-canvas WebGL setup with an offscreen `THREE.WebGLRenderTarget` rendered within the primary canvas at `renderPriority={2}`.
* **Hardware Presentation**: Blitted via an analytical 16px SDF rounded corner screen-quad shader (`screenQuadFrag.glsl`) with dynamic viewport tracking during window resizes and GSAP expansions.
* **Real-Time Tracking**: Features heading-aligned rotation, edge-clamped entity markers (Player, Car, Plane, Heli), and active distance telemetry.

### 3.3 Simulation Pause & Strict Focus Gate
* **Deterministic Pause Lifecycle**: Hitting `ESC` or toggling the menu freezes Rapier physics stepping (`<Physics paused={isPaused}>`), halts camera lerping, and flushes all active inputs.
* **Strict Focus Gate**: Vehicle inputs in `useAllVehicleInput.ts` require active `document.pointerLockElement`. Unlocking pointer lock immediately zeroes inputs to prevent ghost driving.
* **HUD Play Button**: A telemetry-styled Play button handles Chromium's 1200ms pointer lock cooldown and guides cursor acquisition.

### 3.4 High-Performance Telemetry Engine
* **0 React Re-Renders**: High-frequency physics telemetry (speed, altitude, pitch, roll, yaw) bypasses React state diffing using direct `requestAnimationFrame` loops and DOM text node mutations.
* **Zero Per-Frame Allocations**: Physics creator hooks and camera rigs reuse module-level static vectors and quaternions to eliminate garbage collection hitching.

---

## 🎮 4. Controls Quick Reference

| Action | Ground / Vehicle | Aerial (Plane / Heli) |
| :--- | :--- | :--- |
| **Throttle / Pitch** | `W` / `S` (or Arrow Up/Down) | `W` (Pitch Down) / `S` (Pitch Up) |
| **Steer / Roll** | `A` / `D` (or Arrow Left/Right) | `A` (Roll Left) / `D` (Roll Right) |
| **Brake / Descend** | `Spacebar` (Handbrake) | `Spacebar` (Descend / Airbrake) |
| **Boost / Ascend** | `Left Shift` / `Right Shift` | `Shift` (Ascend / Jet Boost) |
| **Rudder / Yaw** | — | `Q` (Yaw Left) / `E` (Yaw Right) |
| **Mount / Unmount** | `F` | `F` |
| **Respawn Vehicle** | `R` | `R` |
| **Toggle Radar Map** | `M` (Expand / Minimize) | `M` (Expand / Minimize) |
| **Pause / Resume** | `Escape` | `Escape` |

---

## 🚀 5. Development & Scripts

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run strict ESLint checks
npm run lint

# Production typecheck & build
npm run build

# Preview production build locally
npm run preview
```

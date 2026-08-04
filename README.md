# 🚗 Project Drive: Procedural City & Custom Vehicle Sandbox

## 📋 1. Project Overview
* **Concept:** Modern, web-based 3D multi-vehicle simulation inspired by the `swift502/Sketchbook` repository.
* **Features:** Dynamically generated procedural city environment and a suite of drivable, physics-based vehicles (Car, Plane, Helicopter) plus on-foot exploration.
* **Ecosystem:** React 19, React Three Fiber (R3F) for WebGL rendering, Rapier for deterministic 3D physics, and Zustand for strict, isolated global state management.

## 🛠️ 2. Technology Stack & Architecture

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | React 19, Vite, TypeScript | Project foundation and build tooling. |
| **3D & Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` | WebGL rendering and scene helpers. |
| **Shaders** | `vite-plugin-glsl` | Custom vertex and fragment shader compilation and injection. |
| **Physics Engine** | `@react-three/rapier` | Deterministic 3D physics (raycast vehicles, rigid bodies). |
| **Procedural Gen** | `simplex-noise` | Generating city blocks, roads, and terraced terrain. |
| **State Mgmt** | `zustand` | Strict, isolated vehicle telemetry and active control routing. |
| **Animation & UI** | `gsap`, Tailwind CSS v4, Lucide React | Smooth transitions, modular HUD overlays, tabular numeric displays. |
| **Debugging** | `tweakpane` | Live-tuning physics parameters, UI elements, and shader uniforms. |
| **Audio** | `use-sound` | Engine loops, tire skids, and UI sounds. |
| **Compilation** | React Compiler | Auto-memoization for maximum frame rates. |

## ⚙️ 3. Core Mechanics

| Mechanic | Implementation Details |
| :--- | :--- |
| **Multi-Vehicle Physics** | Distinct Rapier controllers for cars, planes, and helicopters. Inputs and physics calculations are gated by an `activeControl` global state to prevent bleed-over. |
| **Procedural City** | `simplex-noise` mapping on an infinite grid utilizing "Macro-Hills, Micro-Flat" terracing to prevent raycast suspension glitches. High performance via `InstancedMesh`. |
| **Decoupled Camera System** | A singular, reusable `CameraRig` utilizing R3F's `useFrame` that dynamically tracks the currently active vehicle or character mesh without memory leaks. |
| **Dynamic HUD Overlay** | Tailwind-powered UI that listens to strictly typed vehicle telemetry (e.g., ground speed in KM/H) and swaps control info/displays based on the active vehicle. |
| **Customization** | UI overlay built with React Router to navigate modes, modify vehicle parts, update base colors via custom shaders, and track live stats. |
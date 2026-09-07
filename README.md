# ✨ Neon Drives: Procedural City & Multi-Vehicle Sandbox

## 📋 1. Project Overview

* **Concept:** Modern, web-based 3D multi-vehicle simulation inspired by the `swift502/Sketchbook` repository.
* **Features:** Seamless transition between on-foot exploration and a suite of drivable, physics-based vehicles (Car, Plane, Helicopter) within a dynamically generated procedural environment.
* **Ecosystem:** React 19, React Three Fiber (R3F) for WebGL rendering, Rapier for deterministic 3D physics, and Zustand for strict, isolated global state management.

## 🛠️ 2. Technology Stack & Architecture

| Domain | Technology | Purpose |
| --- | --- | --- |
| **Core** | React 19, Vite, TypeScript, React Router | Project foundation, build tooling, and isolated mode routing. |
| **3D & Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` | WebGL rendering, scene helpers, and instanced meshes. |
| **Shaders** | `vite-plugin-glsl` | Custom vertex and fragment shader compilation. |
| **Physics Engine** | `@react-three/rapier` | Deterministic 3D physics (raycast vehicles, rigid bodies, overlapping chunk colliders). |
| **Procedural Gen** | Poisson Disk, Simplex Noise, Delaunay Triangulation | Generating infinite macro-biomes, structured city grids, network logic, and organic vegetation/prop placement. |
| **State Mgmt** | `zustand` | Strict, isolated vehicle telemetry, routing states, and active control tracking. |
| **Animation & UI** | `gsap`, Tailwind CSS v4, Lucide React | Smooth transitions, modular HUD overlays, dynamic loaders. |
| **Debugging** | `tweakpane` | Live-tuning physics parameters, UI elements, and global shader uniforms. |
| **Audio** | `use-sound` | Engine loops, tire skids, and UI sounds. |
| **Compilation** | React Compiler | Auto-memoization for maximum frame rates and memory stability. |

## ⚙️ 3. Core Mechanics

| Mechanic | Implementation Details |
| --- | --- |
| **Multi-Vehicle Physics** | Distinct Rapier controllers for cars, planes, and helicopters. Inputs and physics calculations are gated by an `activeControl` global state to prevent bleed-over and allow simultaneous world simulation. |
| **Procedural Environment** | Custom algorithmic generation utilizing Poisson Disk sampling and modular grid math on a dynamically shifting infinite 3x3 chunk grid, maintaining seamless localized rendering and overlapping physics colliders around the active vehicle. |
| **Decoupled Camera System** | A singular, reusable `CameraRig` utilizing R3F's `useFrame` that dynamically tracks the currently active vehicle or character mesh without memory leaks. |
| **Dynamic HUD Overlay** | Tailwind-powered UI that listens to strictly typed vehicle telemetry (e.g., ground speed in KM/H) and swaps control info/displays based on the active vehicle. |
| **Customization** | Isolated React Router architecture containing a physics-free `GarageCanvas` showroom with cinematic lighting and real-time `MeshReflectorMaterial` floors. |
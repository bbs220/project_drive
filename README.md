# 🚗 Project Drive: Procedural City & Custom Vehicle Sandbox

## 📋 1. Project Overview
* **Concept:** Modern, web-based 3D vehicle simulation inspired by the `swift502/Sketchbook` repository.
* **Features:** Dynamically generated procedural city environment and a fully drivable, physics-based, customizable car.
* **Ecosystem:** React 19, React Three Fiber (R3F) for WebGL rendering, Rapier for deterministic 3D physics, and Zustand for global state management.

## 🛠️ 2. Technology Stack & Architecture

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | React 19, Vite, TypeScript | Project foundation and build tooling. |
| **3D & Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` | WebGL rendering and scene helpers. |
| **Physics Engine** | `@react-three/rapier` | Deterministic 3D physics (replacing Ammo/Cannon). |
| **Procedural Gen** | `simplex-noise` | Generating city blocks, roads, and terrain. |
| **State Mgmt** | `zustand` | Vehicle telemetry, customization states, and settings. |
| **Animation & UI** | `gsap`, `@gsap/react`, Tailwind CSS v4, Lucide React | Smooth transitions, DOM styling, and icons. |
| **Debugging** | `tweakpane` | Live-tuning physics parameters (suspension, friction). |
| **Audio** | `use-sound` | Engine loops, tire skids, and UI sounds. |
| **Compilation** | React Compiler | `babel-plugin-react-compiler` for auto-memoization. |

## ⚙️ 3. Core Mechanics

| Mechanic | Implementation Details |
| :--- | :--- |
| **Vehicle Physics** | Rapier dynamic rigid bodies and colliders (raycast vehicle or custom wheel constraints). Tunable suspension stiffness, damping, mass, and tire friction. |
| **Procedural City** | `simplex-noise` mapping on an infinite/large bounded grid. High performance achieved via `InstancedMesh` and Rapier's Instanced colliders for static buildings. |
| **Camera System** | Smooth follow-camera utilizing R3F's `useFrame` and GSAP for dynamic FOV shifts mapped to vehicle speed. |
| **Customization** | UI overlay built with Tailwind and React Router to navigate modes and modify vehicle parts, paint, and stats. |
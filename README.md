# Project Drive: Procedural City & Custom Vehicle Sandbox

## 1. Project Overview
Project Drive is a modern, web-based 3D vehicle simulation inspired by the `swift502/Sketchbook` repository. It features a dynamically generated procedural city environment and a fully drivable, physics-based, customizable car. 

The project leverages a modern React 19 ecosystem, utilizing React Three Fiber (R3F) for WebGL rendering, Rapier for deterministic 3D physics, and Zustand for global state management.

## 2. Technology Stack & Architecture
- **Core:** React 19, Vite, TypeScript
- **3D & Rendering:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Physics Engine:** `@react-three/rapier` (Replaces Ammo/Cannon from older Sketchbook implementations)
- **Procedural Generation:** `simplex-noise` (For generating city blocks, roads, and terrain)
- **State Management:** `zustand` (For vehicle telemetry, customization states, and settings)
- **Animation & UI:** `gsap`, `@gsap/react`, Tailwind CSS v4, Lucide React icons
- **Debugging & Tuning:** `tweakpane` (Crucial for live-tuning physics parameters like suspension and friction)
- **Audio:** `use-sound` (For engine loops, tire skids, and UI sounds)
- **Compilation:** React Compiler (`babel-plugin-react-compiler`)

## 3. Core Mechanics
- **Vehicle Physics:** Implemented via Rapier's dynamic rigid bodies and colliders (e.g., raycast vehicle or custom wheel constraints). Must support tuning for suspension stiffness, damping, mass, and tire friction.
- **Procedural City:** Utilizing `simplex-noise` to create an infinite or large-scale bounded grid. Buildings and static colliders should use InstancedMeshes and Rapier's Instanced colliders for high performance.
- **Camera System:** A smooth, follow-camera system utilizing R3F's `useFrame` and GSAP for dynamic FOV shifts based on vehicle speed.
- **Customization:** A UI overlay built with Tailwind and React Router to modify vehicle parts, paint, and performance stats.

## 4. Strict Coding Standards
- **Component Structure:** Functional components utilizing modern React hooks. R3F logic must be separated from UI logic.
- **Types:** Strict TypeScript typing for all props, physics configurations, and Zustand stores.
- **Commenting Rules (CRITICAL STRICT RULES):**
  - all code comments must always be in lower case
  - code comments must only be added above the code line never aside it
  - never include any numbers or periods into the code comments

## 5. Implementation Plan: MVP to Full Deployment

### Phase 1: Foundation & Environment (MVP Step 1)
- **Repository Setup:** Initialize the Vite project, configure TypeScript, ESLint, and the React Compiler. 
- **3D Canvas Initialization:** Set up the `@react-three/fiber` Canvas, basic lighting, and `@react-three/drei` helpers (Sky, Environment, OrbitControls).
- **Physics World Setup:** Wrap the scene in a `<Physics>` provider from `@react-three/rapier`. Render a basic static ground plane with a friction material.
- **Debug Tooling:** Integrate `tweakpane` outside the canvas to allow real-time parameter tweaking.

### Phase 2: Drivable Car Physics (MVP Step 2)
- **Vehicle Modeling (Placeholder):** Import a low-poly vehicle model or create a basic box/cylinder chassis.
- **Rapier Vehicle Implementation:** Set up the dynamic rigid body for the chassis and wheel colliders. Map physics constraints to simulate suspension and steering.
- **Input Handling:** Create a custom hook to listen to WASD/Arrow keys or gamepad input, translating them into motor force and steering angles in the physics loop.
- **Chase Camera:** Implement a basic follow camera using `useFrame` to smoothly interpolate the camera's position and look-at target behind the car.

### Phase 3: Procedural City Generation
- **Noise Grid System:** Implement `simplex-noise` to generate a 2D heightmap or density map.
- **City Layout:** Map the noise values to a grid system representing roads, intersections, and building plots.
- **Instanced Rendering:** Use `InstancedMesh` for buildings to keep draw calls low. Attach static Rapier colliders to the building instances so the car can crash into them.
- **Infinite Scrolling (Optional):** Implement a chunking system where city blocks load and unload based on the car's distance.

### Phase 4: Customization & UI 
- **State Management:** Create a `zustand` store (`useCarStore`) to manage customization states (e.g., body color, spoiler type, suspension height).
- **UI Overlay:** Build out the DOM interface using Tailwind CSS and Lucide React icons. Use React Router to navigate between "Drive Mode" and "Garage Mode".
- **3D Updates:** Bind the Zustand state to the R3F materials and Rapier physics constraints (e.g., changing suspension height in the UI immediately updates the physics joint).
- **Animation:** Use `@gsap/react` to animate UI panels sliding in/out and smooth transitions when moving the camera between the garage view and chase view.

### Phase 5: Audio & Polish
- **Sound Integration:** Use `use-sound` to implement dynamic engine audio. Map the pitch/volume of the sound to the vehicle's velocity/RPM from the physics engine.
- **Visual Effects:** Add skid marks using dynamic geometry or decal meshes, and tire smoke using a basic particle system.
- **Performance Profiling:** Audit the app using R3F's `Perf` component. Ensure the React Compiler is successfully memoizing UI components. Optimize physics timestep and solver iterations.

### Phase 6: Full Deployment
- **Asset Optimization:** Compress all 3D models (GLTF/GLB) using Draco or Meshopt. Compress audio files.
- **Build Pipeline:** Run `tsc -b && vite build`. Verify that Rollup properly tree-shakes unused dependencies.
- **Hosting Configuration:** Deploy to a modern edge provider (Vercel, Netlify, or Cloudflare Pages) ensuring proper routing rules for React Router.
- **Cross-Device Testing:** Ensure the Tailwind UI is responsive and touch controls (if implemented) work correctly on mobile devices.
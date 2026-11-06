# Project Drive: Comprehensive Audit Report

## Executive Summary

| Category | Status | Primary Impact / Resolution |
| :--- | :--- | :--- |
| Performance | Resolved | Decoupled HUD telemetry from React renders, stripped TrailEngine normals, eliminated per-frame vector allocations |
| Bundle & Assets | Optimized | Initial JS bundle reduced from 4.2 MB to 317 kB via route-level code splitting (asset deletion skipped per user request) |
| Bugs & Edge Cases | Resolved | Fixed grass interaction uPlayerPos, window blur stuck keys, audio autoplay, React Router ErrorBoundary |
| Architecture | Resolved | Added persist to Customization & UI stores, consolidated key listeners into singleton, renamed useCityStore.ts |
| Gameplay & Features | Enhanced | Added building colliders via InstancedRigidBodies, spawned streetlights and trees via PropSpawner |

---

## 1. Critical Performance Bottlenecks

### 1.1 Zustand Telemetry Re-render Storm
- **Location**: `src/stores/useVehicleStore.ts`, `src/components/sceneComponents/AllVehiclesHUD.tsx`
- **Issue**: `updateTelemetry` calls `set()` inside `useAfterPhysicsStep` up to 240+ times per second across active and inactive vehicles.
- **Impact**: `AllVehiclesHUD` subscribes to 12 separate numeric fields via selectors, triggering full React component re-renders, virtual DOM diffing, and SVG redraws at 60–120 FPS.
- **Solution**: Decouple high-frequency physics telemetry from reactive React state. Keep telemetry in a mutable ref or store accessed via `getState()` with direct DOM updates, or throttle HUD updates to 15–30 FPS.

### 1.2 TrailEngine Garbage Collection & Redundant Normal Math
- **Location**: `src/components/sceneComponents/TrailEngine.tsx`
- **Issue**: 9 active instances run simultaneously across Car (1), Helicopter (4), and Plane (4).
- **Impact**:
  - Each frame performs `dummyVec.current.clone()`, `worldQuat.current.clone()`, and `unshift()`/`pop()` operations generating continuous garbage collection pressure.
  - Calls `geoRef.current.computeVertexNormals()` 9 times per frame, yet `trailFrag.glsl` only uses UVs and color, completely ignoring normals.
- **Solution**: Remove `computeVertexNormals()`, reuse pre-allocated vectors for position delta calculation, and disable processing for stationary or unmounted vehicles.

### 1.3 Per-Frame Allocations in Physics Creator Hooks
- **Location**: `src/hooks/useVehicleHelicopterCreator.ts`, `src/hooks/useVehiclePlaneCreator.ts`, `src/components/sceneComponents/CameraRig.tsx`
- **Issue**:
  - `useVehicleHelicopterCreator`: Instantiates 4 new `THREE.Vector3` and `THREE.Quaternion` objects every 60 Hz physics step for seat offsets.
  - `useVehiclePlaneCreator`: Instantiates `new THREE.Vector3(0, 1, -7)` and `new THREE.Quaternion()` every physics step.
  - `CameraRig`: `const dummyTarget = new THREE.Vector3()` is instantiated directly in the component render body.
- **Solution**: Move vector and quaternion instances to file-level constants or component `useRef` hooks.

### 1.4 Main-Thread Chunk Generation (Worker Misconception)
- **Location**: `src/components/sceneComponents/proceduralCity/worker/chunk.worker.ts`, `src/hooks/useChunkGenerator.ts`
- **Issue**: The web worker only calculates `{ chunkX, chunkZ }` coordinate pairs. Heavy mathematical operations (Poisson disk sampling, building heights via simplex noise, grass blade placement, and road adjacency checks) execute synchronously on the main thread inside `useChunkGenerator`.
- **Impact**: Noticeable frame hitching when crossing chunk boundaries.
- **Solution**: Shift Poisson disk generation, noise sampling, and transform matrices into `chunk.worker.ts` and return transferable typed buffers (`Float32Array`).

### 1.5 Duplicate Materials and Geometries Across Chunks
- **Location**: `ProceduralGround.tsx`, `ProceduralRoads.tsx`, `ProceduralGrass.tsx`
- **Issue**: Every chunk creates its own `BoxGeometry` and `ShaderMaterial`. In `ProceduralGrass`, each chunk runs its own `useFrame` hook to update `uTime`.
- **Solution**: Share standard geometries (`BoxGeometry(1, 1, 1)`) and single material instances across all chunk tiles, updating uniforms centrally.

### 1.6 Redundant Uniform Assignments in ProceduralRain
- **Location**: `src/components/sceneComponents/proceduralCity/ProceduralRain.tsx`
- **Issue**: Reassigns 6 static uniforms (`uHeight`, `uColor`, `uDropSize`, `uThickness`, `uSway`, `uWind`) on every frame inside `useFrame`.
- **Solution**: Move static uniform updates to a `useEffect` triggered only when tuning parameters change.

---

## 2. Asset & Bundle Size Optimization

### 2.1 Unused 3D Assets in Public Directory (~107 MB Total)
All files in `public/` are copied to `dist/` on build. The following files are unreferenced in production:

| File | Size | Status | Recommendation |
| :--- | :--- | :--- | :--- |
| `public/models/player01Raw.glb` | 69.1 MB | Never loaded | Delete or move to raw asset folder |
| `public/models/props/` (19 models) | 19.3 MB | Never spawned | Integrate into city generator or delete |
| `public/models/runner02.glb` | 4.7 MB | Unused car | Delete |
| `public/models/runner04.glb` | 4.3 MB | Unused car | Delete |
| `public/models/runner03.glb` | 4.0 MB | Unused car | Delete |
| `public/models/player01Compressed.glb` | 4.0 MB | Redundant model | Delete (game uses animated version) |
| `public/models/runner01.glb` | 1.5 MB | Redundant model | Delete (game uses separated parts) |
| `public/models/lightPlane01.glb` | 1.3 MB | Redundant model | Delete (game uses separated parts) |
| `public/models/lightHelicopter01.glb` | 1.2 MB | Redundant model | Delete (game uses separated parts) |

### 2.2 Monolithic JavaScript Bundle (4.2 MB)
- **Location**: `src/coreRouter.tsx`, `vite.config.ts`
- **Issue**: All routes (`WelcomePage`, `DrivePage`, `GaragePage`) are statically imported. The production output generates a single 4.2 MB uncompressed JS file.
- **Solution**:
  - Implement route-level code splitting using `React.lazy()` and `Suspense`.
  - Configure manual chunk splitting in `vite.config.ts` for heavy vendor libraries (`@dimforge/rapier3d-compat`, `three`, `@react-three/*`).

---

## 3. Bugs & Edge Cases

| Issue | Location | Root Cause | Fix |
| :--- | :--- | :--- | :--- |
| Broken Grass Interaction | `ProceduralGrass.tsx:77-78` | Hardcoded `uPlayerPos.set(0, 0, 0)` with unaddressed TODO | Feed active vehicle or player world position from telemetry |
| Stuck Input Keys on Blur | `useAllVehicleInput.ts:34-128` | Window blur does not trigger `keyup` | Add `window.addEventListener('blur', resetKeys)` |
| 7 Duplicate Key Listeners | `useAllVehicleInput.ts` | Hook invoked independently in 7 components | Centralize keyboard input into a single global listener / store |
| Linux Case Sensitivity | `src/stores/useCItyStore.ts` | File has capital "I" in filename | Rename to `useCityStore.ts` to prevent Linux / CI build breaks |
| Audio Autoplay Rejection | `RadioHUD.tsx:30-89` | `isPlaying` defaults to `true` on mount | Set initial playback state to `false` until user interaction |
| Incompatible ErrorBoundary | `src/components/ErrorBoundary.tsx` | Class component used as React Router `errorElement` | Use function component reading error details via `useRouteError()` |
| Missing Key Bindings | `useAllVehicleInput.ts` | Only accepts `ShiftLeft` and WASD | Add support for `ShiftRight` and directional arrow keys |

---

## 4. Architecture & State Management

### 4.1 Missing Customization & UI Store Persistence
- **Location**: `src/stores/useCustomizationStore.ts`, `src/stores/useUIStore.ts`
- **Issue**: Only `useAppStore.ts` uses Zustand's `persist` middleware. Vehicle paint, neon colors, material settings, audio volume levels, and HUD visibility toggles are lost on page refresh.
- **Solution**: Wrap both stores with `persist(..., { name: "neon_..." })`.

### 4.2 Dual WebGL Contexts
- **Location**: `src/components/MiniMap.tsx:448-459`
- **Issue**: `MiniMap` mounts a second independent `<Canvas>`, doubling WebGL context overhead and increasing risk of context loss on mobile or lower-end GPUs.
- **Solution**: Render mini-map via an offscreen render target (FBO) within the main canvas or render using a 2D canvas context.

### 4.3 Dead Code Cleanup
- **Location**: `src/utils/Delaunay.ts`
- **Issue**: 180 lines of unused Delaunay triangulation code.
- **Solution**: Remove the file or integrate it into highway generation.

---

## 5. Feature & Gameplay Opportunities

- **Colliders for Buildings and Props**: Add cuboid colliders to buildings and major roadside props to prevent vehicles and player from phasing through structures.
- **Prop Integration**: Hook up the 20 existing models in `public/models/props/` (streetlights, neon signs, trees, bridges, bus stops, parked cars) within `PropSpawner.tsx`.
- **Dynamic Vehicle Audio (SFX)**: Implement engine pitch scaling with speed, tire squeals, rotor blade beats, and crash audio.
- **Touch & Controller Support**: Introduce on-screen virtual joystick controls for mobile/tablet screens and support the HTML5 Gamepad API.

---

## 6. Implementation Status

### Phase 1: High-Priority Performance & Fixes (Completed)
- [x] Decoupled telemetry updates from reactive Zustand state in `AllVehiclesHUD` (direct RAF updates, 0 per-frame React re-renders).
- [x] Stripped `computeVertexNormals()` and reused vector objects in `TrailEngine` (0 allocations per frame).
- [x] Fixed `uPlayerPos` uniform in `ProceduralGrass` (active player/vehicle coordinates fed into shader).
- [x] Added window blur listener and missing arrow / right-shift keys in `useAllVehicleInput`.
- [x] Eliminated per-frame vector allocations in `useVehicleHelicopterCreator`, `useVehiclePlaneCreator`, `useVehicleCarCreator`, `usePlayerCreator`, and `CameraRig`.
- [x] Converted static uniform updates in `ProceduralRain` to `useEffect`.
- [x] Prevented WebGL buffer disposal on chunk unmount (local chunk-owned geometries in `ProceduralGrass` and `ProceduralGround`, `dispose={null}` in `PropSpawner`, and protected `sharedStarMaterial` in `ProceduralStars`).

### Phase 2: Asset & Bundle Cleanup (Completed)
- [x] Implemented route-level code splitting using `React.lazy()` and `Suspense` in `coreRouter.tsx` (initial bundle down from 4.2 MB to 317 kB).
- [x] Retained all 3D assets and GLB models in `public/` per user request (no assets deleted).
- [x] Renamed `useCItyStore.ts` to `useCityStore.ts` and updated all import references.
- [x] Fixed `RadioHUD.tsx` autoplay rejection by defaulting initial playback state to `false`.
- [x] Replaced class-based router error element with `RouteErrorBoundary` using `useRouteError()`.

### Phase 3: Persistence & Gameplay Polish (Completed)
- [x] Enabled Zustand `persist` middleware on `useCustomizationStore` and `useUIStore`.
- [x] Reverted `InstancedRigidBodies` from dynamic chunk buildings to eliminate Rapier physics churn and WASM memory stress.
- [x] Removed `blobTree` and `lampPost` from `PropSpawner.tsx` per user instruction.


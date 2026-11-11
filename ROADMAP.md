# Project Drive: Gameplay Systems Roadmap

## Vision & Objective

Now that the structural foundation (monolithic WebGL pipeline, zero-allocation physics, FBO minimap, simulation pause lifecycle, and pointer focus gating) is complete and locked at 60+ FPS, this roadmap defines the **gameplay loops, purpose, and progression systems** that transform Project Drive from a vehicle sandbox into a compelling, goal-oriented cyber-driving and aviation game.

---

## The Core Problem & Gameplay Solution

| Vehicle | Current State | Why Play? (New Gameplay Purpose) |
| :--- | :--- | :--- |
| **Car** | Free drive on infinite roads | **Speed Traps, Highway Radar Runs & Drift Chains**: Clock record speeds through highway speed traps; earn drift multipliers around tight procedural corners; perform stunt launches off highway ramps. |
| **Helicopter** | Free VTOL flight | **Rooftop Extractions, Precision Landings & Radar Avoidance**: Land on designated skyscraper helipads under tight timers; navigate below corporate radar ceilings; perform tight low-altitude hover rescues. |
| **Plane** | Free atmospheric banking | **Skyway Ring Slaloms & Skyscraper Canyon Runs**: Thread through high-speed aerial ring courses; weave through narrow skyscraper canyons at 300+ km/h without clipping wings for "Daredevil" multipliers. |
| **Player / On-Foot** | Walk and mount vehicles (`F`) | **Vehicle Relays & Multi-Stage Operative Heists**: Fly helicopter to secure rooftop data $\rightarrow$ leap down to waiting sports car for highway getaway $\rightarrow$ reach runway to board jet and escape airspace. |

---

## Gameplay Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   CORE GAMEPLAY LOOP                   │
└────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
 ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
 │   CHALLENGE   │ │    CONTRACT   │ │   FREE-ROAM   │
 │   ACTIVITIES  │ │    MISSIONS   │ │    STUNTS     │
 └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
 ┌───────────────────────────────────────────────────────┐
 │               TELEMETRY SCORING ENGINE                │
 │    (Speed, Drift Angle, G-Force, Proximity, Time)     │
 └─────────────────────────┬─────────────────────────────┘
                           ▼
 ┌───────────────────────────────────────────────────────┐
 │              CREDITS & REPUTATION (REP)               │
 └─────────────────────────┬─────────────────────────────┘
                           ▼
 ┌───────────────────────────────────────────────────────┐
 │                   GARAGE SHOP & UNLOCKS               │
 │    (Underglow, Jet Trails, Boost Capacity, Tuning)    │
 └───────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 1: Real-Time Telemetry Scoring & Stunt Engine
*Transform every physical maneuver into an instant visual reward.*

* **Car Telemetry Scoring**:
  * **Drift Score**: Evaluates slip angle $\times$ forward velocity. Sustained drifts trigger multiplier combos ($1\times \rightarrow 4\times$).
  * **Top Speed Streaks**: Maintaining $> 180\text{ km/h}$ on roads generates continuous "Speed Surge" score.
  * **Near Misses**: Brushing past buildings or road dividers at speed grants instant reflex bonuses.
* **Plane Telemetry Scoring**:
  * **Canyon Weaving**: Flying below building rooflines between skyscraper walls awards continuous "Canyon Carver" score.
  * **Inverted / Knife-Edge Flight**: Sustained high-bank roll angles award aerobatic style points.
* **Helicopter Telemetry Scoring**:
  * **Precision Hover**: Holding a stationary altitude $< 5\text{ m}$ over a target zone builds an alignment multiplier.
  * **Rooftop Touchdown**: Smooth vertical descent landing onto high-altitude pads awards touchdown ratings (Poor, Good, Perfect).
* **HUD Feed**:
  * Cyberpunk telemetry popup banners matching `AllVehiclesHUD` aesthetic (`text-tron-yellow`, `font-telemetry`) showing current trick and active combo tally.

---

### Phase 2: World Activity System & Minimap Beacons
*Populate the procedural city with vehicle-specific objective targets.*

* **Highway Radar Traps (Car)**:
  * Glowing neon sensor arches spawned periodically along procedural highways.
  * Flashes speed readout upon breach; compares against vehicle personal bests.
* **Skyway Ring Courses (Plane)**:
  * Procedurally placed neon aerial rings suspended between skyscraper clusters.
  * Flying through gate 1 triggers a countdown timer to complete the sequence.
* **Skyscraper Helipads (Helicopter)**:
  * Neon $H$-pads placed atop procedural corporate towers.
  * Visual landing lights pulse faster as descent velocity and alignment match parameters.
* **Minimap Objective Projection**:
  * Update `MiniMapFBO` to render target waypoint icons (Rings, Helipads, Speed Traps) within radar range.
  * Display distance-to-target indicator on vehicle telemetry cluster.

---

### Phase 3: Contract Missions & Multi-Vehicle Relays
*Give players high-stakes narrative objectives requiring vehicle switching.*

* **Contract Types**:
  * **Data Heist (Multi-Vehicle Relay)**:
    1. *Stage 1 (Helicopter)*: Hover above skyscraper server hub to decrypt a beacon.
    2. *Stage 2 (Foot)*: Mount elevator or parachute down to a parked sports car.
    3. *Stage 3 (Car)*: Evade corporate sweep through city streets to an abandoned airstrip.
    4. *Stage 4 (Plane)*: Take off and ascend past $500\text{ m}$ to transmit data and complete mission.
  * **High-Priority Courier (Car)**:
    * Fragile cargo delivery with a health meter damaged by heavy impacts or roll-overs.
  * **Airspace Intercept (Plane)**:
    * Chase and fly through a moving rogue drone's flightpath before it exits procedural airspace.
  * **Emergency Evacuation (Helicopter)**:
    * Reach 3 rooftop survival beacons across the city within a tight collective timer.
* **Mission Dispatch UI**:
  * Clean telemetry mission briefing overlay accessible via Pause menu or world trigger beacons.

---

### Phase 4: Progression, Currency & Garage Integration
*Provide persistent long-term incentives to replay, improve, and customize.*

* **Economy Model**:
  * **Credits ($\mathbb{C}$)**: Earned from stunts, speed traps, and completed contracts.
  * **Reputation (REP)**: Levels up driver class (Class D $\rightarrow$ Class S) to unlock advanced challenges.
* **Garage Shop**:
  * **Cosmetics**:
    * Custom paint finishes (Matte, Gloss, Chrome, Iridescent Neon).
    * Underglow neon tubes with customizable color palettes.
    * Custom engine trail colors for `TrailEngine.tsx` (Cyan, Amber, Hot Magenta, Laser Green).
  * **Performance Tuning (Physics Parameters)**:
    * Nitrous refill rate and boost multiplier.
    * Vehicle suspension stiffness and drift bias.
    * Aircraft pitch/roll angular velocity headroom and airbrake deceleration power.
* **Local Save / Session Persistence**:
  * Store player wallet, high scores, and vehicle tune configuration safely in structured game store.

---

### Phase 5: Environmental Hazards & Atmospheric Events
*Introduce dynamic environmental friction that tests player mastery.*

* **Dynamic Weather States**:
  * **Neon Rainstorm**: Increases road tire slip (higher drift potential, longer braking distance) and generates cloud turbulence for planes.
  * **Dense Fog / Cyber Smog**: Restricts visible flight ceiling, requiring reliance on HUD artificial horizon and altimeter.
* **City Grid Hazards**:
  * **Corporate Radar Ceilings**: Flying planes or helicopters above designated altitudes triggers alarm tracking.
  * **EMP Deadzones**: City districts where boost is disabled and headlights flicker, requiring pure mechanical steering.

---

## Implementation Priority Matrix

| Milestone | Complexity | Primary Impact | Dependencies |
| :--- | :--- | :--- | :--- |
| **M1: Telemetry Stunt Scorer** | Low | Instant feedback loop for drifting, speed, and canyon flying | `AllVehiclesHUD`, `useVehicleStore` |
| **M2: Speed Traps & Aerial Rings** | Medium | Tangible world objectives for Car and Plane | `ProceduralCity`, `MiniMapFBO` |
| **M3: Helipad Landing System** | Medium | Precision gameplay and distinct role for Helicopter | `chunkDataGenerator`, Rapier sensors |
| **M4: Multi-Vehicle Relay Contracts** | High | Complete loop connecting character, car, heli, and plane | M1, M2, M3 |
| **M5: Garage Economy & Unlocks** | Medium | Long-term progression and customization retention | `useCustomizationStore`, Garage Page |

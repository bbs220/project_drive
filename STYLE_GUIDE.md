# 🎨 STYLE_GUIDE.md

## 🪩 Neon Color Palette
Use deep blacks for backgrounds to maximize bloom intensity and highly saturated neons for accents.

| Element | Role | Hex Code | Preview |
| :--- | :--- | :--- | :--- |
| **Void** | Backgrounds and skybox | `#050505` to `#0D0E15` | Deep midnight |
| **Grid** | Procedural buildings and UI borders | `#00F3FF` | Neon cyan |
| **Pulse** | Roads, active throttle, and targets | `#FF00FF` | Laser magenta |
| **Organic** | Nature, ground planes, and success states | `#39FF14` | Acid green |
| **Warning** | Brakes, stall warnings, and low altitude | `#FF2A00` | Overdrive red |

## 🔤 Typography System
Maintain strict contrast between digital telemetry readouts and human-readable labels.

* **Main Readouts:** `Share Tech Mono` or `Orbitron`
  * Use for speed, altitude, and RPM numbers.
  * Monospaced formatting prevents UI jitter during rapid data changes.

* **Sub Info:** `Rajdhani` or `Inter`
  * Use for static labels, menus, and chat.
  * Clean and squared-off to contrast the heavy stylization of the main numbers.

## 🌟 Visual Effects (Bloom & Containers)
To achieve the glowing neon aesthetic without expensive 3D lighting calculations:
* Containers must never have box shadows or block-level dropshadows. They use glowing borders only (e.g., using colored border utilities and border glow).
* Only the text and inner elements within a container have text-shadow or drop-shadow effects.
* Create a dense inner core of light (e.g., `5px` spread) surrounded by a softer, wider falloff (e.g., `20px` spread).
* This perfectly mimics a WebGL post-processing bloom pass while keeping UI rendering completely separate and highly performant.

## 📘 MATERIAL_RULESET

| Property | Value |
| :--- | :--- |
| Metallic | 1 |
| Roughness | 0.1 |
| IOR | 1.5 |
| Alpha | 1 |
| Normal | Default |
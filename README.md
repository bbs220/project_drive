<!-- fill this up later -->
# ✨ Character Controller And Driver

## 👋 A physics based game driving game in three.js and typescript

Dont know when I'll finish this but this as a side project keeps my brain running
It works on desktop for now

## 📝 TODO :
 1. Make it performant on mobile landscape devices
 2. Add controls for touchscreen
 3. Interaction between Player and Car
 4. Sounds and ambient music
 5. Fix bugs?
   
## 🕹️ Controls :
 - ⚠️ Note : 
    - Make sure the Camera in Settings has target lock to `on` and it is set to `chassisMesh` so it follows the mesh like a third person camera
    - Also turn `on` the Vehicle Controls in Settings to drive the car if you want to drive the car
    - Press `H` to see/hide the physics debugger
   
 - 💻 For Desktop :
    - `WASD` to control the vehicle or player, only one mesh can be controlled at one time
    - Vehicle has additional controls for `B` for handbreak and `N` for nitrous
    - Player has not much functionality yet...
  
 - 📱For Mobile :
    - Nothing yet...
  
   
## 🛠️ Tools and Libraries used :
 - [Three.js](https://threejs.org/)
 - [Cannon.es](https://github.com/pmndrs/cannon-es)
 - [Cannon.es Debugger](https://github.com/pmndrs/cannon-es-debugger)
 - [lil.gui](https://lil-gui.georgealways.com/)
 - [Stats.js](https://github.com/mrdoob/stats.js)
 - [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl)
  
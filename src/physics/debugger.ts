import CannonDebugger from "cannon-es-debugger";
import { type Scene } from "three";
import { type World } from "cannon-es";

// initiating the physics debug renderer
export let physicsDebug: { update: Function };

// main function to invoke the wireframe only of physics world
// wireframe is non interactable
// press H to hide or show
export function initPhysicsDebugger(scene: Scene, world: World) {
  physicsDebug = CannonDebugger(scene, world, {
    color: 0xffff00,
    onInit(_body, mesh) {
      mesh.visible = false;

      document.addEventListener("keydown", (e) => {
        e.stopPropagation();

        if (e.key === "h") {
          mesh.visible = !mesh.visible;
        }
      });
    },
  });
}

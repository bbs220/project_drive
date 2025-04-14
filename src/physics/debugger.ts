import CannonDebugger from "cannon-es-debugger";
import { type Scene } from "three";
import { type World } from "cannon-es";
import { pane } from "../helpers/visualHelpers";

// initiating the physics debug renderer
export let physicsDebug: { update: Function };

// main function to invoke the wireframe only of physics world
// wireframe is non interactable
export function initPhysicsDebugger(scene: Scene, world: World) {
  const debugState = {
    showPhysics: false,
  };

  const physicsFolder = pane.addFolder({
    title: "🛠️ Physics",
    expanded: false,
  });

  physicsFolder
    .addBinding(debugState, "showPhysics", {
      label: "Debug",
    })
    .on("change", (ev) => {
      scene.traverse((obj) => {
        if (obj.userData.isCannonDebugMesh) {
          // dont ask about the "any" of isCannonDebugMesh
          // this is a workaround to get the cannon debug mesh
          // since this fucker does not have a boolean but just turns on/off by reverting the value using != operator
          obj.visible = ev.value;
        }
      });
    });

  physicsDebug = CannonDebugger(scene, world, {
    color: 0xffff00,
    onInit(_body, mesh) {
      mesh.visible = debugState.showPhysics;
      mesh.userData.isCannonDebugMesh = true;
    },
  });
}

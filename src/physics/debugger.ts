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
    wireframeColor: "#ffff00",
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
          obj.visible = ev.value;
        }
      });
    });

  // dont ask about the "any" of isCannonDebugMesh
  // this is a workaround to get the cannon debug mesh
  // since this fucker does not have a boolean but just turns on/off by reverting the value using != operator

  physicsFolder
    .addBinding(debugState, "wireframeColor", {
      label: "Debug Color",
      view: "color",
    })
    .on("change", (ev) => {
      scene.traverse((obj: any) => {
        if (obj.userData.isCannonDebugMesh) {
          obj.material.color.set(ev.value);
        }
      });
    });

  physicsDebug = CannonDebugger(scene, world, {
    color: debugState.wireframeColor,
    onInit(_body, mesh) {
      mesh.visible = debugState.showPhysics;
      mesh.userData.isCannonDebugMesh = true;
    },
  });
}

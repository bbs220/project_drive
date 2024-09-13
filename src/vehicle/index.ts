import * as THREE from "three";
import * as CANNON from "cannon-es";
import { modelLoader } from "../utils/assetLoader";
import { ctrlToggle, enableControls } from "./steeringControls";
import { allCarModels } from "../utils/assetPaths";
import { groundCollistonMaterial } from "../ground";
import { useHeadLights } from "./headLights";
import { gui } from "../helpers/visualHelpers";
import { info, nosContainer, speedElement, uiToggle } from "../ui/vehicleUI";

// setting this up in global since im gonna neet to use in update functions down below
export let mixer: THREE.AnimationMixer;
export let chassisMesh: THREE.Object3D;
export const chassisBody = new CANNON.Body({ mass: 300 });

const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.3, 1));
chassisBody.addShape(chassisShape);
chassisBody.position.set(0, 2, 10);
chassisBody.quaternion.set(0, -1, 0, 1);

// init raycast vehicle
export const vehicle = new CANNON.RaycastVehicle({
  chassisBody: chassisBody,
});

// setting for all wheel options
const wheelOptions = {
  radius: 0.3,
  directionLocal: new CANNON.Vec3(0, -1, 0),
  suspensionStiffness: 30,
  suspensionRestLength: 0.3,
  frictionSlip: 1.4,
  dampingRelaxation: 2.3,
  dampingCompression: 4.4,
  maxSuspensionForce: 100000,
  rollInfluence: 0.01,
  axleLocal: new CANNON.Vec3(0, 0, 1),
  chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
  maxSuspensionTravel: 0.3,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
};

const selectedCar = {
  chassis: allCarModels.muscle.chassis,
  wheels: allCarModels.muscle.wheel,
  xPos: 1.1,
  yPos: -0.1,
  zPos: 0.75,
  xAdditiveValueFront: -0.08,
  xAdditiveValueRear: -0.005,
};

const wheelPos_X = selectedCar.xPos;
const wheelPos_Z = selectedCar.zPos;
const wheelPos_Y = selectedCar.yPos;

// pushing all wheels in in 4 postions

// front axle left position
wheelOptions.chassisConnectionPointLocal.set(
  -wheelPos_X + selectedCar.xAdditiveValueFront,
  wheelPos_Y,
  wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// front axle right position
wheelOptions.chassisConnectionPointLocal.set(
  -wheelPos_X + selectedCar.xAdditiveValueFront,
  wheelPos_Y,
  -wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// rear axle left position
wheelOptions.chassisConnectionPointLocal.set(
  wheelPos_X + selectedCar.xAdditiveValueRear,
  wheelPos_Y,
  wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// rear axle right position
wheelOptions.chassisConnectionPointLocal.set(
  wheelPos_X + selectedCar.xAdditiveValueRear,
  wheelPos_Y,
  -wheelPos_Z
);
vehicle.addWheel(wheelOptions);

// setting up wheel bodies as a array
const wheelBodies: CANNON.Body[] = [];
const wheelVisual: THREE.Group<THREE.Object3DEventMap>[] = [];

const wheelCollisionMaterial = new CANNON.Material("wheel");

export const carFolder = gui.addFolder("Vehicle");
carFolder.close();

// adding vehicle to the physics world
export function addVehicle(scene: THREE.Scene, world: CANNON.World) {
  vehicle.addToWorld(world);

  // immediately adding headlights to the vehicle
  useHeadLights(scene);

  // adding this here cause i really want this to not screw with character ui
  document.body.appendChild(speedElement);
  document.body.appendChild(info);
  document.body.appendChild(nosContainer);

  vehicle.wheelInfos.forEach((wheel) => {
    const cylinderShape = new CANNON.Cylinder(
      wheel.radius,
      wheel.radius,
      wheel.radius / 2,
      20
    );
    const wheelBody = new CANNON.Body({
      mass: 0,
      material: wheelCollisionMaterial,
    });
    wheelBody.type = CANNON.Body.KINEMATIC;
    wheelBody.collisionFilterGroup = 0; // turn off collisions
    const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
    wheelBodies.push(wheelBody);
    world.addBody(wheelBody);

    let wheelModel;
    modelLoader.load(selectedCar.wheels, function (gltf) {
      wheelModel = gltf.scene;
      wheelModel.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.material.wireframe = false;
        }
      });
      wheelVisual.push(wheelModel);
      scene.add(wheelModel);
    });
  });

  // pushing wheel cylinders in all 4 positions and orientations
  world.addEventListener("postStep", () => {
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i);

      // setting up transforms for pushing wheel from array into local chassis position
      const transform = vehicle.wheelInfos[i].worldTransform;
      const wheelBody = wheelBodies[i];

      // for pushing cannon wheels into local chassis position
      if (wheelBody) {
        wheelBody.position.copy(transform.position);
        wheelBody.quaternion.copy(transform.quaternion);
      }

      // for pushing wheel models to their 4 local positions related to chassisbody
      if (wheelVisual[i]) {
        wheelVisual[i].position.copy(transform.position);
        wheelVisual[i].quaternion.copy(transform.quaternion);
      }
    }
  });

  // material for collision between wheels and ground plane
  const wheel_ground = new CANNON.ContactMaterial(
    wheelCollisionMaterial,
    groundCollistonMaterial,
    {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 1000,
      contactEquationRelaxation: 3,
    }
  );
  world.addContactMaterial(wheel_ground);

  // adding controls here
  // controlsForVehicle(vehicle);

  // loads model and only plays animation if it consists animations data
  modelLoader.load(selectedCar.chassis, function (gltf) {
    chassisMesh = gltf.scene;

    const validAnimationSet = gltf.animations;

    chassisMesh.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.material.wireframe = false;
        node.material.flatShading = false;
      }
    });

    if (validAnimationSet.length > 0) {
      mixer = new THREE.AnimationMixer(chassisMesh);
      const action = mixer.clipAction(validAnimationSet[0]);
      action.play();
    }

    scene.add(chassisMesh);
  });

  // quick controls for vehicle
  carFolder.add(uiToggle, "value").onChange(uiShowHide).name("Vehicle UI");
  carFolder
    .add(ctrlToggle, "value")
    .onChange(() => enableControls(vehicle))
    .name("Vehicle Controls");
  carFolder.add({ resetVehicle }, "resetVehicle").name("Reset Vehicle");

  function uiShowHide() {
    if (uiToggle.value === true) {
      info.style.display = "flex";
      speedElement.style.display = "block";
      nosContainer.style.display = "block";
    } else {
      info.style.display = "none";
      speedElement.style.display = "none";
      nosContainer.style.display = "none";
    }
  }

  // for bringing the car back to position (0,0,0) in case it crashes somewhere
  function resetVehicle() {
    chassisBody.position.set(0, 2, 10);
    chassisBody.quaternion.set(0, -1, 0, 1);
    chassisBody.velocity.set(0, 0, 0);
    vehicle.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
  }
}

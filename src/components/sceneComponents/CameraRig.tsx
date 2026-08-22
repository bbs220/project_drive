import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import {
  useVehicleStore,
  CONTROL_STATE,
  type TypeControlState,
} from "../../stores/useVehicleStore";
import { useAllVehicleInput } from "../../hooks/useAllVehicleInput";

// define props with optional debug flag
type typeCameraRigProps = {
  targetRef: React.RefObject<THREE.Group | null>;
  debugMode?: boolean;
};

const CameraRig = ({ targetRef, debugMode = false }: typeCameraRigProps) => {
  const { camera, gl } = useThree();

  // initialize global inputs
  const controls = useAllVehicleInput();

  // live tuning params separated by vehicle scale requirements
  const params = useTweakpane(
    { title: "🎥 Camera Rig", expanded: false },
    {
      playerDistance: { value: 3, min: 1, max: 15, label: "player dist" },
      carDistance: { value: 8, min: 2, max: 20, label: "car dist" },
      heliDistance: { value: 16, min: 5, max: 40, label: "heli dist" },
      planeDistance: { value: 24, min: 10, max: 60, label: "plane dist" },

      // dedicated parameters purely for the cinematic boost lag
      boostLagOffset: { value: 2, min: 0, max: 10, label: "boost lag (+)" },
      boostLerpSpeed: {
        value: 0.02,
        min: 0.001,
        max: 0.5,
        label: "boost lag speed",
      },

      heightOffset: { value: 0, min: 0, max: 10, label: "target height" },
      forwardOffset: { value: 0, min: -10, max: 10, label: "target forward" },
      sensitivity: {
        value: 0.004,
        min: 0.001,
        max: 0.01,
        label: "mouse speed",
      },
      smoothness: { value: 0.8, min: 0.01, max: 1.0, label: "lerp speed" },
    },
  );

  // spherical coordinates manage math for orbiting perfectly around a center point
  const spherical = useRef(new THREE.Spherical(8, Math.PI / 3, 0));

  // decouple the base radius from the boost offset so they can lerp at different speeds
  const baseRadius = useRef(8);
  const boostOffset = useRef(0);

  // vectors used to smooth out the camera movement over time
  const lookAtTarget = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());

  // dummy vector to extract world data without memory leaks
  const dummyTarget = new THREE.Vector3();

  // handle pointer lock and raw mouse inputs exclusively when not debugging
  useEffect(() => {
    if (debugMode) {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      return;
    }

    // translate raw hardware mouse movement into orbital rotation
    const onMouseMove = (event: MouseEvent) => {
      // strictly only rotate if the game actually owns the cursor
      if (document.pointerLockElement === gl.domElement) {
        spherical.current.theta -=
          event.movementX * (params.sensitivity as number);
        spherical.current.phi -=
          event.movementY * (params.sensitivity as number);

        // clamp the vertical angle to prevent the camera from flipping upside down
        spherical.current.phi = Math.max(
          0.1,
          Math.min(Math.PI / 2 - 0.1, spherical.current.phi),
        );
      }
    };

    // capture the mouse into the canvas on left click
    const onClick = () => {
      if (document.pointerLockElement !== gl.domElement) {
        gl.domElement.requestPointerLock();
      }
    };

    gl.domElement.addEventListener("mousemove", onMouseMove);
    gl.domElement.addEventListener("click", onClick);

    return () => {
      gl.domElement.removeEventListener("mousemove", onMouseMove);
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [gl, debugMode, params.sensitivity]);

  // core camera physics loop
  useFrame(() => {
    // exit early if debug mode is active or target is missing
    if (debugMode || !targetRef.current) return;

    // fetch the currently active vehicle from the global state object
    const { active } = useVehicleStore.getState();

    // strictly map the control states to the tweakpane distances
    const distanceMap: Record<TypeControlState, number> = {
      [CONTROL_STATE.PLAYER]: params.playerDistance as number,
      [CONTROL_STATE.CAR]: params.carDistance as number,
      [CONTROL_STATE.HELICOPTER]: params.heliDistance as number,
      [CONTROL_STATE.PLANE]: params.planeDistance as number,
    };

    // lerp the BASE vehicle distance fast (used for swapping between car/heli/player)
    baseRadius.current = THREE.MathUtils.lerp(
      baseRadius.current,
      distanceMap[active.control],
      (params.smoothness as number) * 0.25,
    );

    // lerp the BOOST offset separately using its own slower cinematic speed
    const isBoosting =
      active.control === CONTROL_STATE.CAR && controls.current.boost;
    const targetBoostOffset = isBoosting
      ? (params.boostLagOffset as number)
      : 0;

    boostOffset.current = THREE.MathUtils.lerp(
      boostOffset.current,
      targetBoostOffset,
      params.boostLerpSpeed as number,
    );

    // combine them for the final calculated camera radius
    spherical.current.radius = baseRadius.current + boostOffset.current;

    // set the exact local coordinates we want to focus on
    dummyTarget.set(
      0,
      params.heightOffset as number,
      params.forwardOffset as number,
    );

    // flawlessly convert those local coordinates into true world space
    targetRef.current.localToWorld(dummyTarget);

    // smoothly lerp the invisible target point so the camera catches up organically
    lookAtTarget.current.lerp(dummyTarget, params.smoothness as number);

    // convert the spherical math into true world coordinates relative to the vehicle
    const idealPosition = new THREE.Vector3()
      .setFromSpherical(spherical.current)
      .add(lookAtTarget.current);

    // smoothly drag the actual physical camera toward the ideal mathematical position
    currentPosition.current.lerp(idealPosition, params.smoothness as number);

    // apply the final calculated matrix directly to the camera
    camera.position.copy(currentPosition.current);
    camera.lookAt(lookAtTarget.current);
  });

  // render default orbit controls when debug mode is active
  return debugMode ? (
    <OrbitControls
      makeDefault
      maxDistance={Infinity}
      minDistance={0}
      maxPolarAngle={Math.PI}
    />
  ) : null;
};

export default CameraRig;

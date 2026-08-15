import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";
import { useVehicleStore } from "../../stores/useVehicleStore";

// define props with optional debug flag
type typeCameraRigProps = {
  targetRef: React.RefObject<THREE.Group | null>;
  debugMode?: boolean;
};

const CameraRig = ({ targetRef, debugMode = false }: typeCameraRigProps) => {
  const { camera, gl } = useThree();

  // live tuning params separated by vehicle scale requirements
  const params = useTweakpane(
    { title: "🎥 Camera Rig", expanded: false },
    {
      playerDistance: { value: 4, min: 1, max: 15, label: "player dist" },
      carDistance: { value: 8, min: 2, max: 20, label: "car dist" },
      heliDistance: { value: 16, min: 5, max: 40, label: "heli dist" },
      planeDistance: { value: 24, min: 10, max: 60, label: "plane dist" },
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
  // initialized to the standard car distance
  const spherical = useRef(new THREE.Spherical(8, Math.PI / 3, 0));

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

    // fetch the currently active vehicle from global state
    const { activeControl } = useVehicleStore.getState();

    // determine the correct locked distance based on the vehicle type
    let targetRadius = params.carDistance as number;
    if (activeControl === "on_foot") {
      targetRadius = params.playerDistance as number;
    } else if (activeControl === "helicopter") {
      targetRadius = params.heliDistance as number;
    } else if (activeControl === "plane") {
      targetRadius = params.planeDistance as number;
    }

    // smoothly lerp the spherical radius so the camera dynamically pushes in and out when swapping vehicles
    spherical.current.radius = THREE.MathUtils.lerp(
      spherical.current.radius,
      targetRadius,
      (params.smoothness as number) * 0.25,
    );

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

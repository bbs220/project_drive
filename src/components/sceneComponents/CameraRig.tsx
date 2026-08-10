import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";

// define props with optional debug flag
type typeCameraRigProps = {
  targetRef: React.RefObject<THREE.Group | null>;
  debugMode?: boolean;
};

const CameraRig = ({ targetRef, debugMode = false }: typeCameraRigProps) => {
  const { camera, gl } = useThree();

  // live tuning params to perfect the camera feel for different vehicles
  const params = useTweakpane(
    { title: "🎥 camera rig", expanded: false },
    {
      distance: { value: 6, min: 5, max: 50, label: "chase distance" },
      heightOffset: { value: 0, min: 0, max: 10, label: "target height" },
      forwardOffset: { value: 0, min: -10, max: 10, label: "target forward" },
      sensitivity: {
        value: 0.004,
        min: 0.001,
        max: 0.01,
        label: "mouse speed",
      },
      smoothness: { value: 0.2, min: 0.01, max: 1.0, label: "lerp speed" },
    },
  );

  // spherical coordinates manage math for orbiting perfectly around a center point
  const spherical = useRef(
    new THREE.Spherical(params.distance as number, Math.PI / 3, 0),
  );

  // vectors used to smooth out the camera movement over time
  const lookAtTarget = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());

  // dummy vectors to extract world data without memory leaks
  const dummyTarget = new THREE.Vector3();
  const localOffset = new THREE.Vector3();

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

    // sync live tweakpane distance to the math sphere
    spherical.current.radius = params.distance as number;

    // extract the exact world position of the currently driven vehicle
    targetRef.current.getWorldPosition(dummyTarget);

    // calculate the local offset based on the vehicle rotation
    localOffset.set(
      0,
      params.heightOffset as number,
      params.forwardOffset as number,
    );

    // apply the vehicle rotation to the offset vector so it always points forward
    localOffset.applyQuaternion(targetRef.current.quaternion);

    // add the calculated shift to the base position
    dummyTarget.add(localOffset);

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

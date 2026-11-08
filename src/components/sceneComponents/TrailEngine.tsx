import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import trailFrag from "./shaders/trailFrag.glsl";
import trailVert from "./shaders/trailVert.glsl";
import * as THREE from "three";

export type VehicleTrailProps = {
  targetRef: React.RefObject<THREE.Group | null>;
  length?: number;
  height?: number;
  width?: number;
  color?: string | THREE.Color;
  emissiveIntensity?: number;
  offset?: [number, number, number];
  isCar?: boolean;
};

const TrailEngine = ({
  targetRef,
  length = 50,
  height = 2.0,
  width = 1.0,
  color = "#00ffff",
  emissiveIntensity = 2.0,
  offset = [0, 0, 0],
  isCar = false,
}: VehicleTrailProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // track how long the vehicle has remained stationary
  const stationaryCount = useRef(length);

  // generate 4 vertices per segment to create a 3d box
  const { positions, uvs, indices } = useMemo(() => {
    const pos = new Float32Array(length * 4 * 3);
    const uv = new Float32Array(length * 4 * 2);
    const ind = [];

    for (let i = 0; i < length; i++) {
      const ratio = i / (length - 1);

      // bottom-right
      uv[i * 8 + 0] = ratio;
      uv[i * 8 + 1] = 0;
      // bottom-left
      uv[i * 8 + 2] = ratio;
      uv[i * 8 + 3] = 0;
      // top-right
      uv[i * 8 + 4] = ratio;
      uv[i * 8 + 5] = 1;
      // top-left
      uv[i * 8 + 6] = ratio;
      uv[i * 8 + 7] = 1;

      if (i < length - 1) {
        const br = i * 4 + 0;
        const bl = i * 4 + 1;
        const tr = i * 4 + 2;
        const tl = i * 4 + 3;

        const nbr = (i + 1) * 4 + 0;
        const nbl = (i + 1) * 4 + 1;
        const ntr = (i + 1) * 4 + 2;
        const ntl = (i + 1) * 4 + 3;

        // right face
        ind.push(br, tr, ntr);
        ind.push(br, ntr, nbr);
        // left face
        ind.push(bl, nbl, ntl);
        ind.push(bl, ntl, tl);
        // top face
        ind.push(tr, tl, ntl);
        ind.push(tr, ntl, ntr);
        // bottom face
        ind.push(br, nbr, nbl);
        ind.push(br, nbl, bl);
      }
    }

    return {
      positions: pos,
      uvs: uv,
      indices: new Uint16Array(ind),
    };
  }, [length]);

  const intenseColor = useMemo(() => {
    const c = new THREE.Color(color);
    return new THREE.Color(
      c.r * emissiveIntensity,
      c.g * emissiveIntensity,
      c.b * emissiveIntensity,
    );
  }, [color, emissiveIntensity]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: intenseColor },
      uOpacity: { value: 0.8 },
    }),
    [intenseColor],
  );

  // synchronize material color with state changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value = intenseColor;
    }
  }, [intenseColor]);

  const history = useRef<{ pos: THREE.Vector3; right: THREE.Vector3 }[]>([]);

  const dummyVec = useRef(new THREE.Vector3());
  const dummyRight = useRef(new THREE.Vector3());
  const worldQuat = useRef(new THREE.Quaternion());
  const moveDeltaVec = useRef(new THREE.Vector3());
  const invWorldQuat = useRef(new THREE.Quaternion());

  const lastPos = useRef(new THREE.Vector3());
  const isInitialized = useRef(false);

  useFrame(() => {
    if (!targetRef.current || !geoRef.current) return;

    // correctly map the local offset to world coordinates based on vehicle rotation
    dummyVec.current.set(offset[0], offset[1], offset[2]);
    targetRef.current.localToWorld(dummyVec.current);

    if (!isInitialized.current) {
      lastPos.current.copy(dummyVec.current);
      isInitialized.current = true;
      if (meshRef.current) {
        meshRef.current.visible = false;
      }
      return;
    }

    // calculate movement distance since previous frame
    moveDeltaVec.current.copy(dummyVec.current).sub(lastPos.current);
    const moveDistSq = moveDeltaVec.current.lengthSq();
    lastPos.current.copy(dummyVec.current);

    // skip processing if vehicle has remained stationary and trail has contracted
    if (moveDistSq < 0.0001) {
      if (stationaryCount.current >= length) {
        if (meshRef.current && meshRef.current.visible) {
          meshRef.current.visible = false;
        }
        return;
      }
      stationaryCount.current++;
    } else {
      stationaryCount.current = 0;
      if (meshRef.current && !meshRef.current.visible) {
        meshRef.current.visible = true;
      }
    }

    targetRef.current.getWorldQuaternion(worldQuat.current);

    dummyRight.current
      .set(1, 0, 0)
      .applyQuaternion(worldQuat.current)
      .normalize()
      .multiplyScalar(width / 2);

    // reverse detection math
    invWorldQuat.current.copy(worldQuat.current).invert();
    const localMoveZ = moveDeltaVec.current.applyQuaternion(invWorldQuat.current).z;

    // only detect reversing if this trail actually belongs to a car
    const isReversing = isCar && localMoveZ < -0.01;

    // emission logic
    if (!isReversing) {
      let segment =
        history.current.length >= length ? history.current.pop() : null;
      if (!segment) {
        segment = { pos: new THREE.Vector3(), right: new THREE.Vector3() };
      }
      segment.pos.copy(dummyVec.current);
      segment.right.copy(dummyRight.current);
      history.current.unshift(segment);
    } else {
      if (history.current.length > 0) {
        history.current.pop();
      }
    }

    const posAttr = geoRef.current.attributes.position;

    for (let i = 0; i < length; i++) {
      const current = history.current[i] ||
        history.current[history.current.length - 1] || {
          pos: dummyVec.current,
          right: dummyRight.current,
        };

      const p = current.pos;
      const r = current.right;
      const baseIdx = i * 4 * 3;

      posAttr.array[baseIdx + 0] = p.x - r.x;
      posAttr.array[baseIdx + 1] = p.y - r.y;
      posAttr.array[baseIdx + 2] = p.z - r.z;

      posAttr.array[baseIdx + 3] = p.x + r.x;
      posAttr.array[baseIdx + 4] = p.y + r.y;
      posAttr.array[baseIdx + 5] = p.z + r.z;

      posAttr.array[baseIdx + 6] = p.x - r.x;
      posAttr.array[baseIdx + 7] = p.y - r.y + height;
      posAttr.array[baseIdx + 8] = p.z - r.z;

      posAttr.array[baseIdx + 9] = p.x + r.x;
      posAttr.array[baseIdx + 10] = p.y + r.y + height;
      posAttr.array[baseIdx + 11] = p.z + r.z;
    }

    posAttr.needsUpdate = true;
    geoRef.current.computeBoundingSphere();
  });

  return (
    <mesh ref={meshRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={trailVert}
        fragmentShader={trailFrag}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export default TrailEngine;

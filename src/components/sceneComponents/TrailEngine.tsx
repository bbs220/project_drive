import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type VehicleTrailProps = {
  targetRef: React.RefObject<any>;
  length?: number;
  height?: number;
  width?: number;
  color?: string | THREE.Color;
  emissiveIntensity?: number;
  offset?: [number, number, number];
};

const TrailEngine = ({
  targetRef,
  length = 50,
  height = 2.0,
  width = 1.0,
  color = "#00ffff",
  emissiveIntensity = 2.0,
  offset = [0, 0, 0],
}: VehicleTrailProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  // generate 4 vertices per segment to create a 3d box
  const { positions, uvs, indices } = useMemo(() => {
    const pos = new Float32Array(length * 4 * 3);
    const uv = new Float32Array(length * 4 * 2);
    const ind = [];

    for (let i = 0; i < length; i++) {
      const ratio = i / (length - 1);
      
      // 0: bottom-right
      uv[i * 8 + 0] = ratio; uv[i * 8 + 1] = 0;
      // 1: bottom-left
      uv[i * 8 + 2] = ratio; uv[i * 8 + 3] = 0;
      // 2: top-right
      uv[i * 8 + 4] = ratio; uv[i * 8 + 5] = 1;
      // 3: top-left
      uv[i * 8 + 6] = ratio; uv[i * 8 + 7] = 1;

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

  const history = useRef<{ pos: THREE.Vector3 }[]>([]);
  const dummyVec = useRef(new THREE.Vector3());
  
  // reusable vectors for trail thickness math without memory leaks
  const dirVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3(0, 1, 0));

  useFrame(() => {
    if (!targetRef.current || !geoRef.current) return;

    // correctly map the local offset to world coordinates based on vehicle rotation
    dummyVec.current.set(offset[0], offset[1], offset[2]);
    targetRef.current.localToWorld(dummyVec.current);

    history.current.unshift({ pos: dummyVec.current.clone() });

    if (history.current.length > length) {
      history.current.pop();
    }

    const posAttr = geoRef.current.attributes.position;

    for (let i = 0; i < length; i++) {
      const current = history.current[i] || { pos: dummyVec.current };
      
      // look ahead and behind to find the direction the trail is moving
      const newer = i > 0 ? history.current[i - 1] || current : current;
      const older = i < length - 1 ? history.current[i + 1] || current : current;

      dirVec.current.subVectors(newer.pos, older.pos).normalize();
      
      // fallback if the vehicle hasn't moved yet
      if (dirVec.current.lengthSq() === 0) dirVec.current.set(0, 0, 1);

      // cross product calculates the left/right axis relative to forward direction
      rightVec.current.crossVectors(dirVec.current, upVec.current).normalize().multiplyScalar(width / 2);

      const baseIdx = i * 4 * 3;

      // 0: bottom-right
      posAttr.array[baseIdx + 0] = current.pos.x - rightVec.current.x;
      posAttr.array[baseIdx + 1] = current.pos.y - rightVec.current.y;
      posAttr.array[baseIdx + 2] = current.pos.z - rightVec.current.z;

      // 1: bottom-left
      posAttr.array[baseIdx + 3] = current.pos.x + rightVec.current.x;
      posAttr.array[baseIdx + 4] = current.pos.y + rightVec.current.y;
      posAttr.array[baseIdx + 5] = current.pos.z + rightVec.current.z;

      // 2: top-right
      posAttr.array[baseIdx + 6] = current.pos.x - rightVec.current.x;
      posAttr.array[baseIdx + 7] = current.pos.y - rightVec.current.y + height;
      posAttr.array[baseIdx + 8] = current.pos.z - rightVec.current.z;

      // 3: top-left
      posAttr.array[baseIdx + 9] = current.pos.x + rightVec.current.x;
      posAttr.array[baseIdx + 10] = current.pos.y + rightVec.current.y + height;
      posAttr.array[baseIdx + 11] = current.pos.z + rightVec.current.z;
    }

    posAttr.needsUpdate = true;
    geoRef.current.computeBoundingSphere();
    geoRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-uv"
          args={[uvs, 2]}
        />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>

      <meshBasicMaterial
        color={intenseColor}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </mesh>
  );
};

export default TrailEngine;
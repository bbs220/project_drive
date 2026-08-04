import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  generateTerrainNoise,
  type TerrainParams,
} from "../../hooks/useTerrainCreator";
import { useTweakpane } from "../../hooks/useTweakpane";
import grassVert from "./shaders/grassVert.glsl";
import grassFrag from "./shaders/grassFrag.glsl";
import { grassConstants } from "../../constants/sceneConstants";

// dummy object to calculate matrix math outside the render loop
const dummy = new THREE.Object3D();

// define props interface
interface GrassProps {
  params: TerrainParams;
}

const Grass = ({ params }: GrassProps) => {
  // initialize refs for mesh and material
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // bind tweakpane to local state
  const grassParams = useTweakpane(
    { title: "⛰️ Grass Tuning", expanded: false },
    grassConstants,
  );

  // create ultra low poly triangle geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // define bottom left bottom right and top center vertices
    const vertices = new Float32Array([
      -0.05, 0.0, 0.0, 0.05, 0.0, 0.0, 0.0, 0.5, 0.0,
    ]);

    // apply vertices to geometry
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return geo;
  }, []);

  // memoize initial shader uniforms leaving deps empty since we update in frame loop
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(grassConstants.baseColor.value) },
      uTipColor: { value: new THREE.Color(grassConstants.tipColor.value) },
    }),
    [],
  );

  // recalculate grass positions whenever terrain shape or grass count changes
  useEffect(() => {
    if (!meshRef.current) return;

    // iterate through requested blade count using local grass parameters
    for (let i = 0; i < grassParams.grassCount; i++) {
      // generate random planar coordinates within the terrain bounds
      const x = (Math.random() - 0.5) * params.size;
      const z = (Math.random() - 0.5) * params.size;

      // query the shared noise function to find the exact ground height
      const y =
        generateTerrainNoise(x * params.noiseScale, z * params.noiseScale) *
        params.noiseHeight;

      // position the dummy object
      dummy.position.set(x, y, z);

      // bake translation into matrix skipping rotation since shader handles billboarding
      dummy.updateMatrix();

      // apply dummy matrix to the specific instance
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    // flag the instanced mesh buffer for a webgl update
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [
    params.size,
    params.noiseScale,
    params.noiseHeight,
    grassParams.grassCount,
  ]);

  // update uniforms every frame
  useFrame((state) => {
    if (materialRef.current) {
      // update wind timer
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // safely sync tweakpane live colors to gpu
      materialRef.current.uniforms.uBaseColor.value.set(grassParams.baseColor);
      materialRef.current.uniforms.uTipColor.value.set(grassParams.tipColor);
    }
  });

  return (
    // render all blades in a single highly optimized draw call
    // forcing a remount via key prevents buffer overflow crashes when sliding count
    <instancedMesh
      ref={meshRef}
      key={grassParams.grassCount}
      args={[geometry, undefined, grassParams.grassCount]}
    >
      {/* // apply custom billboarding and wind material */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={grassVert}
        fragmentShader={grassFrag}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};

export default Grass;

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTweakpane } from "../../../hooks/useTweakpane";
import {
  useVehicleStore,
  type TypeEntityId,
} from "../../../stores/useVehicleStore";
import rainFrag from "../shaders/rainFrag.glsl";
import rainVert from "../shaders/rainVert.glsl";

const ProceduralRain = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const rainGroupRef = useRef<THREE.Group>(null);

  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const params = useTweakpane(
    { title: "🌧️ Procedural Rain", expanded: false },
    {
      count: {
        value: 25000,
        min: 1000,
        max: 100000,
        step: 1000,
        label: "drop count",
      },
      area: { value: 900, min: 300, max: 2000, label: "global square area" },
      height: { value: 150, min: 50, max: 500, label: "volume height" },
      innerRadius: {
        value: 150,
        min: 10,
        max: 500,
        label: "center circle radius",
      },
      innerDensity: {
        value: 0.6,
        min: 0.0,
        max: 1.0,
        label: "% of rain in center",
      },
      color: { value: "#aaccff", label: "rain color" },
      speedMultiplier: { value: 4.0, min: 0.1, max: 5.0, label: "fall speed" },
      dropSize: { value: 150.0, min: 10.0, max: 500.0, label: "drop scale" },
      thickness: {
        value: 2.5,
        min: 0.5,
        max: 10.0,
        label: "thickness (squeeze)",
      },
    },
  );

  useEffect(() => {
    if (!geometryRef.current) return;

    const c = params.count as number;
    const a = params.area as number;
    const h = params.height as number;
    const r = params.innerRadius as number;
    const density = params.innerDensity as number;

    const positions = new Float32Array(c * 3);
    const speeds = new Float32Array(c);
    const offsets = new Float32Array(c);

    const innerCount = Math.floor(c * density);

    for (let i = 0; i < c; i++) {
      if (i < innerCount) {
        const theta = Math.random() * Math.PI * 2;
        const dropRadius = Math.sqrt(Math.random()) * r;

        positions[i * 3 + 0] = Math.cos(theta) * dropRadius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(theta) * dropRadius;
      } else {
        positions[i * 3 + 0] = (Math.random() - 0.5) * a;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * a;
      }

      speeds[i] = 25.0 + Math.random() * 30.0;
      offsets[i] = Math.random() * h;
    }

    geometryRef.current.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    geometryRef.current.setAttribute(
      "aSpeed",
      new THREE.BufferAttribute(speeds, 1),
    );
    geometryRef.current.setAttribute(
      "aOffset",
      new THREE.BufferAttribute(offsets, 1),
    );
  }, [
    params.count,
    params.area,
    params.height,
    params.innerRadius,
    params.innerDensity,
  ]);

  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTime: { value: 0 },
          uHeight: { value: params.height },
          uColor: { value: new THREE.Color(params.color as string) },
          uDropSize: { value: params.dropSize },
          uThickness: { value: params.thickness },
        },
      ]),
    [params.color, params.dropSize, params.height, params.thickness],
  );

  useFrame((_, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value +=
        delta * (params.speedMultiplier as number);
      shaderRef.current.uniforms.uHeight.value = params.height;
      shaderRef.current.uniforms.uColor.value.set(params.color as string);
      shaderRef.current.uniforms.uDropSize.value = params.dropSize;
      shaderRef.current.uniforms.uThickness.value = params.thickness;
    }

    if (rainGroupRef.current) {
      const state = useVehicleStore.getState();
      const activeEntity = state.active.entity as TypeEntityId;
      const telemetry = state.telemetry[activeEntity];

      if (telemetry?.position) {
        rainGroupRef.current.position.x = telemetry.position[0];
        rainGroupRef.current.position.z = telemetry.position[2];
      }
    }
  });

  return (
    <group ref={rainGroupRef}>
      <points renderOrder={1}>
        <bufferGeometry ref={geometryRef} />
        <shaderMaterial
          ref={shaderRef}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          uniforms={uniforms}
          vertexShader={rainVert}
          fragmentShader={rainFrag}
          fog={true}
        />
      </points>
    </group>
  );
};

export default ProceduralRain;

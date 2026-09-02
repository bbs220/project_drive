import { useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import type { typeInstanceConfig } from "./ProceduralCity";

const dummy = new THREE.Object3D();

const ProceduralRocks = ({ rocks }: { rocks: typeInstanceConfig[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (meshRef.current && rocks.length > 0) {
      rocks.forEach((rock, i) => {
        dummy.position.set(...rock.position);
        dummy.scale.set(...rock.scale);

        if (rock.rotation) {
          dummy.rotation.set(...rock.rotation);
        } else {
          dummy.rotation.set(0, 0, 0);
        }

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [rocks]);

  if (rocks.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, rocks.length]}
      castShadow
      receiveShadow
    >
      {/* A low-poly dodecahedron makes a perfect angular sci-fi rock */}
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#0a1518" // Deep dark cyan-grey
        roughness={0.9}
        metalness={0.2}
        flatShading={true}
      />
    </instancedMesh>
  );
};

export default ProceduralRocks;

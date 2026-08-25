// components/Hero/CloudScene.tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Cloud } from "./Cloud";
import { Halo } from "./Halo";
import { Mist } from "./Mist";
import { Lighting } from "./Lighting";

function Rig({ docked }: { docked: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const targetScale = docked ? 0.45 : 1;
    const targetY = docked ? 1.2 : 0;

    // lerp = smoothly move toward the target each frame instead of snapping
    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.06);
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, targetScale, 0.06);
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, targetScale, 0.06);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.06);
  });

  return (
    <group ref={group}>
      <Cloud />
      <Halo />
      {/* <Mist /> */}
    </group>
  );
}

export function CloudScene({ docked = false }: { docked?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} style={{ width: "100%", height: "100%" }}>
      <Lighting />
      <Rig docked={docked} />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.4} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
// components/Hero/Cloud.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// More puffs, smaller, tighter overlap = smoother silhouette
const PUFFS: [number, number, number, number][] = [
  [0, 0.1, 0, 1.0],
  [-1.1, -0.15, 0.3, 0.75],
  [1.1, -0.15, 0.2, 0.75],
  [-0.55, 0.45, 0.4, 0.68],
  [0.55, 0.45, 0.35, 0.68],
  [0, -0.4, 0.5, 0.8],
  [-1.7, -0.3, -0.1, 0.5],
  [1.7, -0.3, -0.15, 0.5],
  [0, 0.7, 0.1, 0.55],
  [-0.3, -0.6, 0.6, 0.55],
  [0.3, -0.6, 0.55, 0.55],
];

export function Cloud() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.8) * 0.15;
    group.current.rotation.y = state.pointer.x * 0.15;
    group.current.rotation.x = -state.pointer.y * 0.08;
  });

  return (
    <group ref={group}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 64, 64]} />
          <MeshDistortMaterial
            color="#ffffff"
            roughness={0.55}
            metalness={0}
            distort={0.12}
            speed={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
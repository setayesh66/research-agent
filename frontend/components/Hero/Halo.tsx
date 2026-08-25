// components/Hero/Halo.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Halo() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.z = t * 0.3;
    mesh.current.position.y = 1.6 + Math.sin(t * 1.2) * 0.15;
  });

  return (
    <mesh ref={mesh} position={[0, 1.6, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[1.2, 0.06, 32, 100]} />
      <meshStandardMaterial
        color="#f4c542"
        emissive="#e8a317"
        emissiveIntensity={1.4}
        metalness={0.6}
        roughness={0.25}
      />
    </mesh>
  );
}
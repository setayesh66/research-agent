// components/Hero/Mist.tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function useSoftCircleTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.4)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

const LAYERS = [
  { x: -2.2, y: 0.2, z: -2, scale: 4, speed: 0.05, opacity: 0.55, color: "#eaf6ff" },
  { x: 2.4, y: -0.6, z: -2.5, scale: 5, speed: 0.03, opacity: 0.45, color: "#d8ecff" },
  { x: 0, y: -1, z: -1.5, scale: 3.5, speed: 0.07, opacity: 0.5, color: "#ffffff" },
  { x: -1, y: 0.8, z: -1.8, scale: 3, speed: 0.04, opacity: 0.4, color: "#e0f0ff" },
];

export function Mist() {
  const texture = useSoftCircleTexture();
  const refs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.x = LAYERS[i].x + Math.sin(t * LAYERS[i].speed) * 1.2;
      mesh.position.y = LAYERS[i].y + Math.cos(t * LAYERS[i].speed * 0.8) * 0.4;
    });
  });

  return (
    <>
      {LAYERS.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[layer.x, layer.y, layer.z]}
        >
          <planeGeometry args={[layer.scale, layer.scale]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={layer.opacity}
            color={layer.color}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
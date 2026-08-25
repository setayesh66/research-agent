// components/Hero/CloudSceneLoader.tsx
"use client";

import dynamic from "next/dynamic";

export const CloudSceneLoader = dynamic(
  () => import("./CloudScene").then((mod) => mod.CloudScene),
  { ssr: false }
) as React.ComponentType<{ docked?: boolean }>;
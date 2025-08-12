"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Test() {
  const meshRef = useRef();

  // Rotate the mesh on every frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} receiveShadow={true} castShadow={true} position={[0, 1.54, 0]} >
      <boxGeometry args={[2, 2, 2]} />
      <meshPhysicalMaterial color="orange" />
    </mesh>
  );
}

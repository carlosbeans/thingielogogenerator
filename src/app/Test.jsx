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
          <mesh ref={meshRef}>
               <boxGeometry args={[1, 1, 1]} />
               <meshStandardMaterial color="orange" />
          </mesh>
     );
}

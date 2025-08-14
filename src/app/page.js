"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { OrbitControls } from "@react-three/drei";

export default function Home() {
     return (
          <main className="w-screen h-screen">
               <Canvas
                    shadows
                    gl={{
                         antialias: true,
                         alpha: false,
                         preserveDrawingBuffer: false,
                    }}
                    camera={{ fov: 45 }}
               >
                    <color attach="background" args={["#000000"]} />
                    <OrbitControls />
                    <Scene />
               </Canvas>
          </main>
     );
}

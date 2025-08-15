"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { OrbitControls } from "@react-three/drei";

export default function Home() {
  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col h-screen">
        <div className="logoPreviewContainer h-screen flex flex-col">
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
          <div className="logoUploadContainer w-screen absolute bottom-0">
            <div className="dragRegion backdrop-blur-xs border border-dashed p-24 m-16 flex flex-col items-center rounded-lg">              
              <div className="flex flex-row items-center">
              <input type="file" className="bg-white" />
                <button className="bg-white button button-primary rounded text-black p-2">
                  Upload
                </button>
              </div>
              <div className="disclaimer">
                Don't be a dick, upload an svg file with a transparent
                background.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

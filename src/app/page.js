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
          <div className="logoUploadContainer p-40">
            <input type="file" />
            <button>Upload</button>
            <div className="disclaimer">
              Don't be a dick, upload an svg file with a transparent background.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

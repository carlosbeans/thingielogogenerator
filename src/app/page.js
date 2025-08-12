"use client";

import { Canvas } from "@react-three/fiber";
import Test from "./Test";

export default function Home() {
     return (
          <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
               <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                    <div className="flex gap-4 items-center flex-col sm:flex-row">
                         <div style={{ width: "400px", height: "400px" }}>
                              <Canvas>
                                   <ambientLight intensity={0.5} />
                                   <pointLight position={[10, 10, 10]} />
                                   <Test />
                              </Canvas>
                         </div>
                         {/* Your other JSX content goes here */}
                    </div>
               </main>
          </div>
     );
}

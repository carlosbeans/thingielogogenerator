"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useCallback } from "react";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFiles(files);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files.length) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type === 'image/svg+xml') {
      setFileName(file.name);
      // You can add your file processing logic here
    } else {
      setFileName(null);
      alert('Please upload an SVG file');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col h-screen">
        <div className="logoPreviewContainer h-screen flex flex-col">
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              preserveDrawingBuffer: false,
            }}
            camera={{ fov: 45 }}
          >
            <color attach="background" args={["#000000"]} />
            <OrbitControls enablePan={false} enableRotate={false} enableZoom={false} enableDamping={true} />
            <Scene />
          </Canvas>
          <div className="logoUploadContainer absolute bottom-0 w-screen flex justify-center">
            <div 
              ref={dropZoneRef}
              className={`dragRegion w-1/3 backdrop-blur-sm bg-white/5 p-16 m-24 flex flex-col items-center rounded-lg transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
            <div className="filePreviewContainer text-center mb-4">

                <div className="text-white bg-black/30 px-4 py-2 rounded-md">
                  {fileName}
                </div>
              
            </div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".svg"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center">
                <div className="text-white mb-4 text-center">
                  {fileName ? (
                    <span className="font-medium">{fileName}</span>
                  ) : isDragging ? (
                    'Drop your SVG file here'
                  ) : (
                    'Drag & drop an SVG file here, or click to select'
                  )}
                </div>
              </div>
              <div className="disclaimer text-gray-500 text-sm text-center">
                Must be an SVG with a transparent background
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

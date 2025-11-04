"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Circle, Float, Cloud } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  GodRays,
  Noise,
  HueSaturation,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import Plastic from "./Plastic";
import Dirt from "./Dirt";
// import useTexture
import { useTexture } from "@react-three/drei";

export default function Scene({ blob, uploadStatus, setShowCTAs, setUploadStatus }) {
  const [textureUrl, setTextureUrl] = useState();
  const [texture, setTexture] = useState(null);
  const [light, setLight] = useState();
  const [lightReady, setLightReady] = useState(false);
  const dirtTexture = useTexture("dirt.png"); 

  // Load texture manually instead of using useLoader to avoid hooks issue
  useEffect(() => {
    if (!textureUrl) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();

    loader.load(
      textureUrl,
      (loadedTexture) => {
        if (!cancelled) {
          loadedTexture.needsUpdate = true;
          setTexture(loadedTexture);
        }
      },
      undefined,
      (error) => {
        if (!cancelled) {
          console.error("Error loading texture:", textureUrl, error);
          setTexture(null);
        }
      }
    );

    // Cleanup function - cancels the loading if effect re-runs
    return () => {
      cancelled = true;
    };
  }, [textureUrl]);

  // Handle blob changes and create object URL
  useEffect(() => {
    if (!blob) {
      setTextureUrl("/logo.png");
      return;
    }

    //const objectUrl = URL.createObjectURL(blob);
    setTextureUrl(blob);

    return () => {
      //URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  // inverted shader material
  const invertedAlphaMaterial = useMemo(() => {
    if (!texture || !texture.image) {
      return null;
    }

    const meshSize = [1, 1];
    const textureSize = [texture.image.width, texture.image.height];

    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        color: { value: new THREE.Color("black") },
        uMeshSize: { value: new THREE.Vector2(meshSize[0], meshSize[1]) },
        uTextureSize: {
          value: new THREE.Vector2(textureSize[0], textureSize[1]),
        },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 color;
        uniform vec2 uMeshSize;
        uniform vec2 uTextureSize;
        varying vec2 vUv;

        float zoom = 4.0;

        void main() {
          float meshAspect    = uMeshSize.x / uMeshSize.y;
          float textureAspect = uTextureSize.x / uTextureSize.y;
          
          vec2 scaledUv = vUv;

          if (meshAspect > textureAspect) {
              float scaleX = meshAspect / textureAspect;
              scaledUv.x = (vUv.x - 0.5) * scaleX + 0.5;
          } else {
              float scaleY = textureAspect / meshAspect;
              scaledUv.y = (vUv.y - 0.5) * scaleY + 0.5;
          }

          scaledUv = (scaledUv - 0.5) * zoom + 0.5;

          float inX = step(0.0, scaledUv.x) * step(scaledUv.x, 1.0);
          float inY = step(0.0, scaledUv.y) * step(scaledUv.y, 1.0);
          float inBounds = inX * inY;
          
          vec4 texColor = inBounds > 0.5 ? texture2D(map, scaledUv) : vec4(0.0);
          float invertedAlpha = 1.0 - texColor.a;
          
          if (invertedAlpha < 0.5) {
              discard;
          }

          gl_FragColor = vec4(color, invertedAlpha);
      }
      `,
      transparent: true,
    });
  }, [texture]);


  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 300; i++) {
      temp.push((Math.random() - 0.5) * 20);
      temp.push((Math.random() - 0.5) * 20);
      temp.push((Math.random() - 0.5) * 20);
    }
    return new Float32Array(temp);
  }, []);

  if (!invertedAlphaMaterial) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={10} />

      <Circle
        ref={(el) => {
          if (el) {
            setLight(el);
            setLightReady(true);
          }
        }}
        args={[25, 25]}
        position={[0, 0, -16]}
        transparent={true}
        scale={[0.5, 0.5, 1]}
      >
        <meshBasicMaterial color={"#b3c1eb"} />
      </Circle>

      <Float
        speed={2}
        rotationIntensity={1.8}
        floatIntensity={1.8}
        position={[0, 2, 2.52]}
      >
        <Cloud
          opacity={0.03}
          seed={1}
          scale={1}
          volume={5}
          color="#b3c1eb"
          fade={150}
          position={[0, 0, 0]}
        />
      </Float>

      <mesh transparent castShadow={true} position={[-0.07, 0.6, 0]}>
        <boxGeometry args={[12, 12, 0.01]} />
        <primitive object={invertedAlphaMaterial} attach="material" />
      </mesh>

      <Dirt position={[0, 0, -0.2]} />

      <Plastic position={[0, 0, 0]} uploadStatus={uploadStatus} setShowCTAs={setShowCTAs} setUploadStatus={setUploadStatus} />

      <EffectComposer multisampling={0}>
        <BrightnessContrast brightness={0} contrast={0.05} />

        <HueSaturation
          blendFunction={BlendFunction.SCREEN}
          hue={6.4}
          saturation={0.86}
        />

        <Bloom
          intensity={54.0}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        <Noise opacity={0.06} scale={0.005} />

        {lightReady && (
          <GodRays
            sun={light}
            blendFunction={BlendFunction.Screen}
            samples={60}
            density={0.8}
            decay={0.9}
            weight={0.4}
            exposure={0.1}
            clampMax={1}
            kernelSize={KernelSize.SMALL}
            blur={true}
          />
        )}
      </EffectComposer>
    </>
  );
}

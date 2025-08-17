"use client";

import React from 'react'
import Test from './Test'
import { Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, BrightnessContrast, GodRays, Noise, LUT, HueSaturation, ColorAverage, Sepia } from '@react-three/postprocessing'
import { useMemo } from 'react'
import { useRef } from 'react'
import { BlendFunction } from 'postprocessing'
import { Circle } from '@react-three/drei'
import { KernelSize } from 'postprocessing'
import { Resizer } from 'postprocessing'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { Ramp, RampType } from '@react-three/postprocessing'
import { useEffect } from 'react'
// import cloud from drie
import { Clouds, Cloud, Float } from "@react-three/drei"
import Plastic from './Plastic'


export default function Scene() {

  //  const lutTexture = useLoader(THREE.TextureLoader, '/luttt.png')
  const svgTexture = useLoader(THREE.TextureLoader, '/logo.svg')
  svgTexture.anisotropy = 16 // Max supported by GPU
  svgTexture.needsUpdate = true

  // Configure texture settings after it loads
  // useEffect(() => {
  //   if (svgTexture) {
  //     svgTexture.generateMipmaps = false
  //     svgTexture.minFilter = THREE.LinearFilter
  //     svgTexture.magFilter = THREE.LinearFilter
  //     svgTexture.anisotropy = 16
  //   }
  // }, [svgTexture])

  // inverted shader
  const invertedAlphaMaterial = useMemo(() => {
    if (!svgTexture) return null; // Guard against initial render

    const meshSize = [1, 1]; // Box geometry dimensions
    const textureSize = [svgTexture.image.width, svgTexture.image.height]; // 300 117



    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: svgTexture },
        color: { value: new THREE.Color('black') },
        uMeshSize: { value: new THREE.Vector2(meshSize[0], meshSize[1]) },
        uTextureSize: { value: new THREE.Vector2(textureSize[0], textureSize[1]) },
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

        void main() {
          float meshAspect    = uMeshSize.x / uMeshSize.y;       // mesh W/H
          float textureAspect = uTextureSize.x / uTextureSize.y; // tex  W/H
          
          vec2 scaledUv = vUv;

          if (meshAspect > textureAspect) {
              // Mesh is wider than texture → fit height (pillarbox on sides)
              float scaleX = meshAspect / textureAspect; // > 1.0
              scaledUv.x = (vUv.x - 0.5) * scaleX + 0.5;
          } else {
              // Mesh is taller than texture → fit width (letterbox on top/bottom)
              float scaleY = textureAspect / meshAspect; // > 1.0
              scaledUv.y = (vUv.y - 0.5) * scaleY + 0.5;
          }

          // Apply uniform zoom after aspect ratio correction
          scaledUv = (scaledUv - 0.5) * 4.0 + 0.5;

          

          // Create in-bounds mask to avoid edge smearing
          float inX = step(0.0, scaledUv.x) * step(scaledUv.x, 1.0);
          float inY = step(0.0, scaledUv.y) * step(scaledUv.y, 1.0);
          float inBounds = inX * inY;
          
          // Sample texture only when inside bounds, else transparent padding
          vec4 texColor = inBounds > 0.5 ? texture2D(map, scaledUv) : vec4(0.0);
          
          // Invert alpha from texture
          float invertedAlpha = 1.0 - texColor.a;
          
          // Optional threshold for alpha cutoff
          if (invertedAlpha < 0.5) {
              discard;
          }
          
          // Output color with inverted alpha
          gl_FragColor = vec4(color, invertedAlpha);
      }
      `,
      transparent: true
    });
  }, [svgTexture]);

  // Make sure to handle the case where the material is not yet created
  if (!invertedAlphaMaterial) {
    return null;
  }




  const lightRef = useRef()

  const [lightReady, setLightReady] = React.useState(false);

  React.useEffect(() => {
    if (lightRef.current) {
      setLightReady(true);
    }
  }, []);

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 300; i++) {
      // Generate x, y, z coordinates (3 values per particle)
      temp.push((Math.random() - 0.5) * 20) // x
      temp.push((Math.random() - 0.5) * 20) // y  
      temp.push((Math.random() - 0.5) * 20) // z
    }
    return new Float32Array(temp)
  }, [])


  return (
    <>
      <ambientLight intensity={10} />

      <Circle
        ref={lightRef} args={[25, 25]} position={[0, 0, -16]} transparent={true} scale={[.5, .5, 1]}>
        <meshBasicMaterial color={"#b3c1eb"} />
      </Circle>

      {/* <Points positions={particles}>
        <PointMaterial transparent opacity={.1} size={0.02} sizeAttenuation color="black" />
      </Points> */}


      <Float
        speed={2} // Animation speed (default: 1)
        rotationIntensity={1.8} // XYZ rotation intensity (default: 1)
        floatIntensity={1.8} position={[0, 2, 2.52]} // Up/down float intensity (default: 1)
      >
        <Cloud opacity={0.03} seed={1} scale={1} volume={5} color="#b3c1eb" fade={150} position={[0, 0, 0]} />
      </Float>

      <mesh transparent castShadow={true} position={[-0.07, 1.37, 0]}>
        <boxGeometry args={[12, 12, .01]} />
        <primitive
          object={invertedAlphaMaterial}
          attach="material"
        />
      </mesh>


      <Plastic position={[0, 0, 0]} />

      <EffectComposer multisampling={0}>
        {/* <LUT lut={lutTexture} tetrahedralInterpolation={true}  /> */}

        {/* <Sepia intensity={0.4} blendFunction={BlendFunction.NORMAL} /> */}
        <BrightnessContrast
            brightness={0} // brightness. min: -1, max: 1
            contrast={.05} // contrast: min -1, max: 1
          />

        <HueSaturation
          blendFunction={BlendFunction.SCREEN} // blend mode
          hue={6.4} // hue in radians
          saturation={.86} // saturation in radians
        />

        <Bloom
          intensity={3.0}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        <Noise opacity={0.03} scale={0.005} />
        {lightReady && (
          <GodRays
            sun={lightRef}
            blendFunction={BlendFunction.Screen} // The blend function of this effect.
            samples={60} // The number of samples per pixel.
            density={0.8} // The density of the light rays.
            decay={0.9} // An illumination decay factor.
            weight={0.4} // A light ray weight factor.
            exposure={0.1} // A constant attenuation coefficient.
            clampMax={1} // An upper bound for the saturation of the overall effect.
            //width={Resizer.AUTO_SIZE} // Render width.
            //height={Resizer.AUTO_SIZE} // Render height.
            kernelSize={KernelSize.SMALL} // The blur kernel size. Has no effect if blur is disabled.
            blur={true} // Whether the god rays should be blurred to reduce artifacts.
          />
        )}


      </EffectComposer>
    </>
  )
}

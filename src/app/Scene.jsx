"use client";

import React from 'react'
import Test from './Test'
import { Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, GodRays } from '@react-three/postprocessing'
import { useMemo } from 'react'
import { useRef } from 'react'
import { BlendFunction } from 'postprocessing'
import { Circle } from '@react-three/drei'
import { KernelSize } from 'postprocessing'
import { Resizer } from 'postprocessing'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'


export default function Scene() {

  const svgTexture = useLoader(THREE.TextureLoader, '/logo.svg')

  // inverted shader
  const invertedAlphaMaterial = new THREE.ShaderMaterial({
  uniforms: {
    map: { value: svgTexture },
    color: { value: new THREE.Color('black') }
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
    varying vec2 vUv;
    void main() {
      vec4 texColor = texture2D(map, vUv);
      float invertedAlpha = 1.0 - texColor.a;

      // ✨ FIX: If the pixel is supposed to be see-through,
      // discard it entirely so it doesn't block the god rays.
      if (invertedAlpha < 0.5) {
        discard;
      }

      gl_FragColor = vec4(color, invertedAlpha);
    }
  `,
  transparent: true
})



  const lightRef = useRef()

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
      <ambientLight intensity={0.1} />




      <Circle
        ref={lightRef} args={[5, 5]} position={[0, 0, -16]} transparent={true} scale={[1.13, 0.7, 1]}>
        <meshBasicMaterial color={"white"} />
      </Circle>

      <Points positions={particles}>
        <PointMaterial transparent opacity={0.6} size={0.02} sizeAttenuation color="#ffffff" />
      </Points>




      <mesh transparent castShadow={true} position={[-0.07, 1.37, 0]}>
        <boxGeometry args={[2, 1, .01]} />
         <primitive object={invertedAlphaMaterial} attach="material" />
      </mesh>



      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        {lightRef.current && (
          <GodRays
            sun={lightRef}
            blendFunction={BlendFunction.Screen} // The blend function of this effect.
            samples={60} // The number of samples per pixel.
            density={0.8} // The density of the light rays.
            decay={0.9} // An illumination decay factor.
            weight={0.4} // A light ray weight factor.
            exposure={0.6} // A constant attenuation coefficient.
            clampMax={1} // An upper bound for the saturation of the overall effect.
            //width={Resizer.AUTO_SIZE} // Render width.
            // height={Resizer.AUTO_SIZE} // Render height.
            kernelSize={KernelSize.SMALL} // The blur kernel size. Has no effect if blur is disabled.
            blur={true} // Whether the god rays should be blurred to reduce artifacts.
          />
        )}
      </EffectComposer>
    </>
  )
}

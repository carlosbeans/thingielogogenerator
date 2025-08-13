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


export default function Scene() {



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
      <ambientLight intensity={0.16} />

      <spotLight
        position={[0, 5.33, 5.33]}
        angle={0.3}
        penumbra={0.5}
        intensity={38.76}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#ffffff"
        target-position={[0, 0, 0]}
        transparent={true}
      />

   

      <Circle
        ref={lightRef}  args={[10, 10]} position={[0, 0, -16]} transparent={true}>
        <meshBasicMaterial color={"blue"} />
      </Circle>

      <Points positions={particles}>
        <PointMaterial transparent opacity={0.6} size={0.02} sizeAttenuation color="#ffffff" />
      </Points>


      <mesh position={[0, 0, 0]} receiveShadow={true} rotation={[-1.57, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshPhysicalMaterial color="white" />
      </mesh>


      <Test />

      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshPhysicalMaterial color="blue" />
      </mesh>

       <EffectComposer multisampling={0}>
        <Bloom 
          intensity={0.5}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        {lightRef.current && (
          <GodRays
            sun={lightRef.current}
            blendFunction={BlendFunction.Screen} // The blend function of this effect.
            samples={60} // The number of samples per pixel.
            density={0.96} // The density of the light rays.
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

"use client";

import React from 'react'
import Test from './Test'
import { Points, PointMaterial } from '@react-three/drei'
import { useMemo } from 'react'

export default function Scene() {

  
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
      />

      <Points positions={particles}>
        <PointMaterial transparent opacity={0.6} size={0.02} sizeAttenuation color="#ffffff" />
      </Points>

      <fogExp2 attach="fog" args={['#404040', 0.02]} />

      <mesh position={[0, 0, 0]} receiveShadow={true} rotation={[-1.57, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshPhysicalMaterial color="white" />
      </mesh>


      <Test />

      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshPhysicalMaterial color="blue" />
      </mesh>
    </>
  )
}

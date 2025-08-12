"use client";

import React from 'react'
import Test from './Test'

export default function Scene() {
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

      <fog attach="fog" args={["#000000", 5, 20]} />

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

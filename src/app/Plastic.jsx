import * as THREE from 'three'

export default function Plastic() {
  return (
    <mesh scale={25} position={[0, 0, -1.33]}>
      <planeGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  )
}

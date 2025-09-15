// dirt compoennt
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Dirt({ position }) {
  const dirt = useTexture("dirt.png");
  
  return (
    <mesh position={position} castShadow={true} scale={3.00}>
      <planeGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial 
            alphaMap={dirt} 
            color="#000000"
            transparent
            alphaTest={0.01} // This helps with transparency rendering
       />
    </mesh>
  );
}
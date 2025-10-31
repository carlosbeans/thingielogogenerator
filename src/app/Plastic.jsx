import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";

const NodeToyMaterial = shaderMaterial(
  {
    _sinTime: new THREE.Vector4(),
  },
  // Vertex shader
  `
    varying vec2 nodeVary0;
    void main() {
      nodeVary0 = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader (paste NodeToy code here)
  `
// uniforms
uniform vec4 _sinTime; 
float uZoomSize = 1.0; // Added: control zoom size (1.0 = normal, >1.0 = zoom in, <1.0 = zoom out)

// varyings
varying vec2 nodeVary0; 

// variables
float nodeVar0; float nodeVar1; float nodeVar2; vec2 nodeVar3; float nodeVar4; float nodeVar5; 
float nodeVar6; float nodeVar7; float nodeVar8; float nodeVar9; float nodeVar10; float nodeVar11; 
float nodeVar12; float nodeVar13; float nodeVar14; float nodeVar15; float nodeVar16; float nodeVar17; 
float nodeVar18; vec3 nodeVar19; float nodeVar20; 

// noise functions (keep these as they're part of your custom logic)
float noise_randomValue_uy1NFFwI8n2X(vec2 uv) { 
    return fract(sin(dot(uv, vec2(12.9898, 78.233)))*43758.5453); 
}

float noise_interpolate_uy1NFFwI8n2X(float a, float b, float t) { 
    return (1.0-t)*a + (t*b); 
}

float valueNoise_uy1NFFwI8n2X(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);
    uv = abs(fract(uv) - 0.5);
    vec2 c0 = i + vec2(0.0, 0.0);
    vec2 c1 = i + vec2(1.0, 0.0);
    vec2 c2 = i + vec2(0.0, 1.0);
    vec2 c3 = i + vec2(1.0, 1.0);
    float r0 = noise_randomValue_uy1NFFwI8n2X(c0);
    float r1 = noise_randomValue_uy1NFFwI8n2X(c1);
    float r2 = noise_randomValue_uy1NFFwI8n2X(c2);
    float r3 = noise_randomValue_uy1NFFwI8n2X(c3);
    float bottomOfGrid = noise_interpolate_uy1NFFwI8n2X(r0, r1, f.x);
    float topOfGrid = noise_interpolate_uy1NFFwI8n2X(r2, r3, f.x);
    float t = noise_interpolate_uy1NFFwI8n2X(bottomOfGrid, topOfGrid, f.y);
    return t;
}

float SimpleNoise_uy1NFFwI8n2X(vec2 v) {
    float t = 0.0;
    float freq = pow(2.0, float(0));
    float amp = pow(0.5, float(3 - 0));
    t += valueNoise_uy1NFFwI8n2X(v/freq)*amp;
    freq = pow(2.0, float(1));
    amp = pow(0.5, float(3-1));
    t += valueNoise_uy1NFFwI8n2X(v/freq)*amp;
    freq = pow(2.0, float(2));
    amp = pow(0.5, float(3-2));
    t += valueNoise_uy1NFFwI8n2X(v/freq)*amp;
    return t;
}

float customFn_sM57zTBvCMjF(vec2 uv, float scale) {
    float noise = SimpleNoise_uy1NFFwI8n2X(uv * scale);
    return noise;
}

// Second noise function (keep if needed)
float noise_randomValue_i8UAglUI3q1Z(vec2 uv) { 
    return fract(sin(dot(uv, vec2(12.9898, 78.233)))*43758.5453); 
}

float noise_interpolate_i8UAglUI3q1Z(float a, float b, float t) { 
    return (1.0-t)*a + (t*b); 
}

float valueNoise_i8UAglUI3q1Z(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);
    uv = abs(fract(uv) - 0.5);
    vec2 c0 = i + vec2(0.0, 0.0);
    vec2 c1 = i + vec2(1.0, 0.0);
    vec2 c2 = i + vec2(0.0, 1.0);
    vec2 c3 = i + vec2(1.0, 1.0);
    float r0 = noise_randomValue_i8UAglUI3q1Z(c0);
    float r1 = noise_randomValue_i8UAglUI3q1Z(c1);
    float r2 = noise_randomValue_i8UAglUI3q1Z(c2);
    float r3 = noise_randomValue_i8UAglUI3q1Z(c3);
    float bottomOfGrid = noise_interpolate_i8UAglUI3q1Z(r0, r1, f.x);
    float topOfGrid = noise_interpolate_i8UAglUI3q1Z(r2, r3, f.x);
    float t = noise_interpolate_i8UAglUI3q1Z(bottomOfGrid, topOfGrid, f.y);
    return t;
}

float SimpleNoise_i8UAglUI3q1Z(vec2 v) {
    float t = 0.0;
    float freq = pow(2.0, float(0));
    float amp = pow(0.5, float(3 - 0));
    t += valueNoise_i8UAglUI3q1Z(v/freq)*amp;
    freq = pow(2.0, float(1));
    amp = pow(0.5, float(3-1));
    t += valueNoise_i8UAglUI3q1Z(v/freq)*amp;
    freq = pow(2.0, float(2));
    amp = pow(0.5, float(3-2));
    t += valueNoise_i8UAglUI3q1Z(v/freq)*amp;
    return t;
}

float customFn_SgpsoHl63bsq(vec2 uv, float scale) {
    float noise = SimpleNoise_i8UAglUI3q1Z(uv * scale);
    return noise;
}

void main() {
    // Your custom logic
    nodeVar1 = (_sinTime.w * 1.6);
    nodeVar2 = (nodeVar1 + 2.4);
    
    // MODIFIED: Apply zoom effect from center using uZoomSize
    vec2 zoomedUv = (nodeVary0 - 0.5) * uZoomSize + 0.5;
    nodeVar3 = (zoomedUv * vec2(1, 1) + vec2(0, 0));
    
    nodeVar4 = distance(vec4(nodeVar3.xy, 0.0, 1.0), vec4(0.5, 0.5, 0, 1));
    nodeVar5 = (1.0 - nodeVar4);
    nodeVar6 = (nodeVar2 * nodeVar5);
    nodeVar7 = pow(nodeVar6, 10.0);
    nodeVar8 = customFn_sM57zTBvCMjF(nodeVary0, 40.0);
    nodeVar9 = (nodeVar7 * nodeVar8);
    nodeVar10 = (_sinTime.w + 1.8);
    nodeVar11 = distance(vec4(nodeVar3.xy, 0.0, 1.0), vec4(0.5, 0.5, 0, 1));
    nodeVar12 = (1.0 - nodeVar11);
    nodeVar13 = (nodeVar10 * nodeVar12);
    nodeVar14 = pow(nodeVar13, 10.0);
    nodeVar15 = customFn_SgpsoHl63bsq(nodeVary0, 30.0);
    nodeVar16 = (nodeVar14 * nodeVar15);
    nodeVar17 = (1.0 - nodeVar16);
    
    if (nodeVar9 >= nodeVar17) {
        nodeVar0 = 1.0;
    } else {
        nodeVar0 = 0.0;
    };
    
    nodeVar18 = nodeVar0;
    nodeVar19 = (nodeVar18 * vec3(1, 1, 1));
    nodeVar20 = (1.0 - 0.1);
    
    if ((nodeVar17 < nodeVar20)) { 
        discard;
    };
    
    // Final output
    gl_FragColor = vec4(nodeVar19, nodeVar17);
}

  `
);

extend({ NodeToyMaterial });

export default function Plastic({
  uploadStatus,
  setShowCTAs,
  setUploadStatus,
}) {
  const materialRef = useRef();
  const audioRef = useRef();
  const [started, setStarted] = useState(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio("/burn.mp3");
    audioRef.current.volume = 0.8;
    audioRef.current.preload = "auto";

    // Initialize animation to -1
    if (materialRef.current) {
      materialRef.current._sinTime = new THREE.Vector4(-1, -1, -1, -1);
      materialRef.current.uniformsNeedUpdate = true;
    }
  }, []);

  // plays audio and sets started when uploadStatus is postUpload
  useEffect(() => {
    if (uploadStatus === "postUpload") {
      setStarted(true);
      startTimeRef.current = performance.now() / 1000; // Record start time
      audioRef.current.play().catch(console.error);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [uploadStatus]);

  useFrame((state) => {
    if (materialRef.current) {
      if (started) {
        // Calculate time since audio started
        const elapsedTime = state.clock.getElapsedTime() - startTimeRef.current;
        const duration = 25.0;

        let sinTimeValue;

        if (elapsedTime < duration) {
          const progress = elapsedTime / duration;
          sinTimeValue = -1.0 + 2.0 * progress;

          if (elapsedTime > duration - 12) {
            //setShowCTAs(true);
            setUploadStatus("animationComplete"); // this shows the restart / new file buttons
          }
        } else {
          sinTimeValue = 1.0;
        }

        materialRef.current._sinTime = new THREE.Vector4(
          sinTimeValue,
          sinTimeValue,
          sinTimeValue,
          sinTimeValue
        );
      }
      // Always update uniforms, even if not started yet
      materialRef.current.uniformsNeedUpdate = true;
    }
  });

  return (
    <mesh castShadow={true} scale={3.7} position={[0, 1, -0.7]}>
      <planeGeometry args={[1, 1, 1]} />
      <nodeToyMaterial ref={materialRef} />
    </mesh>
  );
}

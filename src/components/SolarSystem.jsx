import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// --- HELPER: Generate Lens Flare Texture Programmatically ---
const createLensFlareTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Radial Gradient
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 200, 80, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 100, 20, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// --- SUN SHADER (Existing) ---
const sunVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vNoise;
uniform float time;
float hash(vec3 p) {
    p  = fract( p*0.3183099+.1 );
    p *= 17.0;
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
}
float noise( in vec3 x ) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix( hash(i+vec3(0,0,0)), 
                        hash(i+vec3(1,0,0)),f.x),
                   mix( hash(i+vec3(0,1,0)), 
                        hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix( hash(i+vec3(0,0,1)), 
                        hash(i+vec3(1,0,1)),f.x),
                   mix( hash(i+vec3(0,1,1)), 
                        hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  float t = time * 0.2;
  vNoise = noise(position * 0.15 + vec3(t)) + noise(position * 0.4 - vec3(t * 1.5)) * 0.5;
  float displacement = (vNoise > 1.2) ? (vNoise - 1.2) * 2.0 : 0.0;
  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const sunFragmentShader = `
uniform float time;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vNoise;
void main() {
  vec3 cDeep = vec3(0.8, 0.1, 0.0);   // Deeper Red-Orange (was brown-red)
  vec3 cMid = vec3(1.0, 0.35, 0.0);    // Rich vibrant Orange (was yellow-orange)
  vec3 cBright = vec3(1.0, 0.8, 0.3); // Yellow-White
  vec3 cHot = vec3(1.0, 1.0, 1.0);    // White
  float n = clamp(vNoise * 0.6, 0.0, 1.0);
  vec3 col = mix(cDeep, cMid, smoothstep(0.0, 0.4, n));
  col = mix(col, cBright, smoothstep(0.4, 0.8, n));
  col = mix(col, cHot, smoothstep(0.8, 1.0, n));
  float viewAngle = dot(normalize(vNormal), vec3(0,0,1));
  col += vec3(0.2, 0.1, 0.0) * (1.0 - viewAngle);
  gl_FragColor = vec4(col, 1.0);
}
`;

const Planet = ({ position, size, color, speed, distance, parentRef }) => {
  const mesh = useRef();
  const angleOffset = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!parentRef.current) return;
    const t = clock.getElapsedTime();
    const angle = angleOffset.current + t * speed * 0.05;
    mesh.current.position.x = Math.sin(angle) * distance;
    mesh.current.position.z = Math.cos(angle) * distance;
    mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={mesh} position={[distance, 0, 0]} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

export const SolarSystem = () => {
  const sunGroup = useRef();
  const shaderRef = useRef();
  const lensFlareTexture = useMemo(() => createLensFlareTexture(), []);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  const shaderArgs = useMemo(() => ({
    uniforms: { time: { value: 0 } },
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader
  }), []);

  return (
    <group position={[600, 100, -800]} ref={sunGroup}>
      {/* SUN CORE - MASSIVE SCALE (Overwriting geometry args) */}
      <mesh>
        <sphereGeometry args={[120, 128, 128]} />
        <shaderMaterial
          ref={shaderRef}
          attach="material"
          args={[shaderArgs]}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* LENS FLARE / HALO GLOW */}
      <sprite scale={[350, 350, 1]}>
        <spriteMaterial
          map={lensFlareTexture}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Light Source */}
      <pointLight
        intensity={3.5}
        distance={4000}
        decay={1.0}
        color="#ffaa00"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Planets - Moving them out further to match 120 radius sun */}
      <Planet parentRef={sunGroup} size={1} color="#aaaaaa" distance={150} speed={4} />
      <Planet parentRef={sunGroup} size={2.5} color="#eecb8b" distance={190} speed={3} />
      <Planet parentRef={sunGroup} size={1.5} color="#bb3322" distance={240} speed={2.5} />
      <Planet parentRef={sunGroup} size={8} color="#d6a76e" distance={350} speed={0.8} />
    </group>
  );
};

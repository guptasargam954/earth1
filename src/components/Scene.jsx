import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Earth } from './Earth';
import { Constellation } from './Constellation';
import { SolarSystem } from './SolarSystem';
import { Vector3 } from 'three';

const CameraManager = () => {
    useFrame(({ camera, clock }) => {
        const t = clock.getElapsedTime();
        if (t < 12) {
            const progress = t / 12;
            const eased = 1 - Math.pow(1 - progress, 4);

            const startPos = new Vector3(750, 200, -750);
            const endPos = new Vector3(0, 5, 20);

            camera.position.lerpVectors(startPos, endPos, eased);

            const sunPos = new Vector3(600, 100, -800);
            const earthPos = new Vector3(0, 0, 0);

            const currentLook = new Vector3().lerpVectors(sunPos, earthPos, Math.pow(progress, 0.5));
            camera.lookAt(currentLook);
        }
    });
    return null;
};

export const Scene = ({ onStatusUpdate }) => {
    // Use a Ref for the user position to avoid re-rendering the whole scene every frame
    const userWorldPosRef = useRef(new Vector3());

    return (
        <Canvas shadows camera={{ position: [750, 200, -750], fov: 45 }}>
            {/* Lighting */}
            <ambientLight intensity={0.05} />
            <directionalLight
                position={[600, 100, -800]}
                intensity={2.0}
                castShadow
            />

            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <group>
                {/* Earth handles marker and updates userWorldPosRef */}
                <Earth userWorldPosRef={userWorldPosRef} />
                {/* Constellation reads that world pos ref for beams */}
                <Constellation onStatusUpdate={onStatusUpdate} userWorldPosRef={userWorldPosRef} />
            </group>

            <SolarSystem />

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.5}
                    luminanceSmoothing={0.9}
                    height={300}
                    intensity={1.5}
                />
            </EffectComposer>

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={8}
                maxDistance={1500}
                autoRotate
                autoRotateSpeed={0.5}
                dampingFactor={0.05}
            />

            <CameraManager />
        </Canvas>
    );
};

import React, { forwardRef, useMemo } from 'react';
import { Color, Vector3, Quaternion, Matrix4 } from 'three';
import { useFrame } from '@react-three/fiber';

const SatelliteModel = ({ failure }) => {
    // Detailed Procedural Satellite
    const materials = useMemo(() => ({
        body: new Color(failure ? '#ff0000' : '#D4AF37'), // Gold Foil
        panel: new Color('#000044'), // Dark Blue Solar
        metal: new Color('#888888'),
        glow: new Color('#ff0000'),
    }), [failure]);

    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            {/* Main Bus (Gold Foil Wrapped) */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.3, 0.5]} />
                <meshStandardMaterial
                    color={materials.body}
                    roughness={0.3}
                    metalness={1.0}
                    emissive={failure ? materials.glow : '#000'}
                    emissiveIntensity={failure ? 2 : 0}
                />
            </mesh>

            {/* Comms Dish */}
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
                <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={materials.metal} side={2} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Solar Panel Array Wings - Left */}
            <group position={[-0.2, 0, 0]}>
                <mesh position={[-0.4, 0, 0]}>
                    <boxGeometry args={[0.8, 0.4, 0.02]} />
                    <meshStandardMaterial
                        color={materials.panel}
                        roughness={0.2}
                        metalness={0.1}
                    />
                </mesh>
                {/* Support Strut */}
                <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.1]} />
                    <meshStandardMaterial color={materials.metal} />
                </mesh>
            </group>

            {/* Solar Panel Array Wings - Right */}
            <group position={[0.2, 0, 0]}>
                <mesh position={[0.4, 0, 0]}>
                    <boxGeometry args={[0.8, 0.4, 0.02]} />
                    <meshStandardMaterial
                        color={materials.panel}
                        roughness={0.2}
                        metalness={0.1}
                    />
                </mesh>
                <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.1]} />
                    <meshStandardMaterial color={materials.metal} />
                </mesh>
            </group>
        </group>
    );
};

// Beam that connects Satellite A to Point B
const TargetedBeam = ({ startPos, endPos, color }) => {
    const ref = React.useRef();

    // Draw a cylinder from Start to End
    // Logic: Position at midpoint. Orient to look at End. Scale height to distance.
    const dist = startPos.distanceTo(endPos);
    const mid = startPos.clone().add(endPos).multiplyScalar(0.5);

    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(mid);
            ref.current.lookAt(endPos);
            ref.current.rotateX(Math.PI / 2); // Cylinder main axis is Y, lookAt aligns Z.
            ref.current.scale.set(1, dist, 1);
        }
    });

    return (
        <mesh ref={ref}>
            {/* Thinner laser-like cylinder */}
            <cylinderGeometry args={[0.005, 0.005, 1, 8]} />
            <meshBasicMaterial
                color="#00ff00"
                transparent
                opacity={0.8}
                depthWrite={false}
                toneMapped={false} // Makes it glowy
            />
        </mesh>
    );
};

export const Satellite = forwardRef(({
    userPos,
    rssi = 0,
    connected = false,
    status = 'active',
    position,
    ...props
}, ref) => {

    const isFailure = status === 'failure';

    return (
        <group ref={ref} position={position} {...props}>
            <SatelliteModel failure={isFailure} />

            {/* Visual marker if connected */}
            {connected && (
                <mesh>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshBasicMaterial color="#0f0" wireframe transparent opacity={0.3} />
                </mesh>
            )}
        </group>
    );
});

export { TargetedBeam };

import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Satellite, TargetedBeam } from './Satellite';
import { generateConstellation, getSatellitePosition, calculateSignalQuality, EARTH_RADIUS } from '../utils/orbitalPhysics';

export const Constellation = ({ onStatusUpdate, userWorldPosRef }) => {
    const [satellites, setSatellites] = useState(() => generateConstellation(20));
    const [connectedId, setConnectedId] = useState(null);
    const [spaceWeather, setSpaceWeather] = useState({ active: false, intensity: 0 });

    const satRefs = useRef({});
    const constellationGroup = useRef();

    // Space Weather Logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.1) {
                setSpaceWeather({ active: true, intensity: Math.random() });
                setTimeout(() => setSpaceWeather({ active: false, intensity: 0 }), 3000);
            }
            if (Math.random() < 0.05) {
                setSatellites(prev => prev.map(s =>
                    Math.random() < 0.1 ? { ...s, status: s.status === 'failure' ? 'active' : 'failure' } : s
                ));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        // Read from the Ref (Performance Optimization)
        const currentUserPos = userWorldPosRef?.current || new Vector3(0, EARTH_RADIUS, 0);

        let bestSat = null;
        let bestQuality = -1;

        const candidates = [];
        const currentStats = {};

        satellites.forEach(sat => {
            const ref = satRefs.current[sat.id];
            if (!ref) return;

            const pos = getSatellitePosition(sat, t);
            ref.position.copy(pos);
            ref.lookAt(0, 0, 0);

            const dist = pos.distanceTo(currentUserPos);
            let quality = calculateSignalQuality(pos, currentUserPos);

            if (spaceWeather.active) quality *= 0.5;
            if (sat.status === 'failure') quality = 0;

            const velocity = sat.speed * 1000;

            currentStats[sat.id] = {
                rssi: quality,
                dist: dist,
                alt: (Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z) - EARTH_RADIUS) * 1000,
                vel: 7.8,
                latency: (dist * 0.02)
            };

            if (quality > 0 && sat.status !== 'failure') {
                candidates.push({ id: sat.id, quality });
            }

            if (quality > bestQuality && sat.status !== 'failure') {
                bestQuality = quality;
                bestSat = sat.id;
            }
        });

        const currentQ = connectedId ? (currentStats[connectedId]?.rssi || 0) : 0;

        if (bestSat && bestSat !== connectedId) {
            if (!connectedId || (bestQuality > currentQ + 10) || currentQ <= 0) {
                setConnectedId(bestSat);
            }
        }

        candidates.sort((a, b) => b.quality - a.quality);
        const nextCandidate = candidates.find(c => c.id !== connectedId);

        if (onStatusUpdate) {
            const activeStat = currentStats[connectedId] || {};
            onStatusUpdate({
                connectedId,
                nextId: nextCandidate ? nextCandidate.id : 'SEARCHING...',
                signalQuality: activeStat.rssi || 0,
                weather: spaceWeather.active ? 'STORM' : 'CLEAR',
                satCount: satellites.length,
                targetAlt: activeStat.alt || 0,
                targetVel: activeStat.vel || 0,
                targetLat: activeStat.latency || 0,
                targetDist: activeStat.dist || 0,
                userLocation: 'CALIBRATED_SITE'
            });
        }
    });

    return (
        <group ref={constellationGroup}>
            {/* Satellites */}
            {satellites.map(sat => (
                <Satellite
                    key={sat.id}
                    ref={(el) => (satRefs.current[sat.id] = el)}
                    rssi={0}
                    connected={connectedId === sat.id}
                    status={sat.status}
                />
            ))}

            {/* Beam - Uses Ref Position now */}
            {connectedId && satRefs.current[connectedId] && userWorldPosRef?.current && (
                <TargetedBeam
                    startPos={satRefs.current[connectedId].position}
                    endPos={userWorldPosRef.current}
                    color="#00ff00"
                />
            )}
        </group>
    );
};

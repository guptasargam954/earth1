import { Vector3 } from 'three';

export const EARTH_RADIUS = 6.371; // in simulation units (1 unit = 1000 km)
export const GM = 398.6; // scaled gravitational parameter (simplified)

// Generate initial random orbit parameters for a constellation
export const generateConstellation = (count = 20) => {
  const satellites = [];
  for (let i = 0; i < count; i++) {
    // Random altitude between 400km and 2000km
    const altitude = 0.4 + Math.random() * 1.6;
    const items = {
      id: `SAT-${i + 101}`,
      altitude: altitude,
      // Inclination: mixed, some polar, some equatorial, some inclined
      inclination: (Math.random() * 180 - 90) * (Math.PI / 180),
      // Longitude of ascending node
      raan: Math.random() * Math.PI * 2,
      // Initial phase
      phase: Math.random() * Math.PI * 2,
      // Speed factor (simplified Keplerian: fast for lower orbits)
      speed: Math.sqrt(GM / (EARTH_RADIUS + altitude)) * 0.05, // Speed scaler for visual
      status: 'active', // 'active', 'buffering', 'failure'
      temperature: 50, // C
    };
    satellites.push(items);
  }
  return satellites;
};

// Calculate position at a given time
export const getSatellitePosition = (satellite, time) => {
  const r = EARTH_RADIUS + satellite.altitude;
  const theta = satellite.phase + satellite.speed * time;
  
  // Simple circular orbit math
  // We can treat inclination as rotation around X/Z axes
  // Start with equatorial orbit in XZ plane
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  const y = 0;
  
  const pos = new Vector3(x, y, z);
  
  // Apply inclination (rotate around X axis)
  pos.applyAxisAngle(new Vector3(1, 0, 0), satellite.inclination);
  
  // Apply RAAN (rotate around Y axis - Earth's axis)
  pos.applyAxisAngle(new Vector3(0, 1, 0), satellite.raan);
  
  return pos;
};

// Calculate RSSI based on angle to target (Earth surface)
// Connecting to a user at (lat, lon) or just generally 'down' logic
export const calculateSignalQuality = (satPos, targetPos) => {
  const dist = satPos.distanceTo(targetPos);
  
  // Angle deviation from 'nadir' (pointing straight down to center)
  // For simplicity, we just check distance + visibility
  // If satellite is blocked by Earth, signal is 0
  
  // Simple logic: Closer is better
  // Max range ~ 3000km for good signal in LEO 
  // In our units: 3.0 units
  
  if (dist > 4.0) return 0;
  
  // Normalize quality 0-100
  let quality = Math.max(0, 100 - (dist * 20)); 
  
  return quality;
};

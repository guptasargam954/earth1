import React, { useState } from 'react';
import { Scene } from './components/Scene';

function App() {
  const [status, setStatus] = useState({
    connectedId: null,
    nextId: null,
    signalQuality: 0,
    weather: 'CLEAR',
    satCount: 0,
    targetAlt: 0,
    targetVel: 0,
    targetLat: 0,
    targetDist: 0,
    userLocation: 'UNKNOWN'
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene onStatusUpdate={setStatus} />

      {/* UI Overlay */}
      <div className="ui-container">
        <header>
          <div>
            <h1>STARLINK <span className="sub">SIMULATOR V2.1</span></h1>
            <div className="sys-status">SYSTEM NORMAL</div>
          </div>
          <div className="status-badge" data-status={status.weather}>
            WEATHER: {status.weather}
          </div>
        </header>

        {/* Telemetry Panel */}
        <div className="connection-panel">
          <div className="panel-header">CONNECTION TELEMETRY</div>

          <div className="row">
            <span className="label">GROUND STATION:</span>
            <span className="value monitor" style={{ color: '#f0f' }}>{status.userLocation}</span>
          </div>

          <div className="row">
            <span className="label">TARGET ID:</span>
            <span className="value monitor">{status.connectedId || "SEARCHING..."}</span>
          </div>

          <div className="row">
            <span className="label">NEXT HANDOVER:</span>
            <span className="value" style={{ color: '#aaa' }}>
              {status.nextId || "NONE"}
            </span>
          </div>

          <div className="row">
            <span className="label">STATUS:</span>
            <span className="value" style={{ color: status.connectedId ? '#0f0' : '#fa0' }}>
              {status.connectedId ? 'LOCKED' : 'SCANNING'}
            </span>
          </div>

          <hr />

          <div className="row">
            <span className="label">SIGNAL STRENGTH (RSSI):</span>
            <div className="rssi-bar-container">
              <div
                className="rssi-bar"
                style={{
                  width: `${status.signalQuality}%`,
                  backgroundColor: status.signalQuality > 70 ? '#0f0' : status.signalQuality > 40 ? '#ff0' : '#f00'
                }}
              />
            </div>
            <span className="value">{Math.round(status.signalQuality)}%</span>
          </div>

          <div className="grid-row">
            <div>
              <span className="label-sm">ALTITUDE</span>
              <div className="value-lg">{Math.round(status.targetAlt)} <span className="unit">km</span></div>
            </div>
            <div>
              <span className="label-sm">VELOCITY</span>
              <div className="value-lg">{status.targetVel.toFixed(2)} <span className="unit">km/s</span></div>
            </div>
            <div>
              <span className="label-sm">DISTANCE</span>
              <div className="value-lg">{status.targetDist.toFixed(1)} <span className="unit">u</span></div>
            </div>
            <div>
              <span className="label-sm">LATENCY</span>
              <div className="value-lg">{status.targetLat.toFixed(1)} <span className="unit">ms</span></div>
            </div>
          </div>

          <div className="row footer">
            <span className="label">ACTIVE SATELLITES:</span>
            <span className="value">{status.satCount}</span>
          </div>
        </div>

        {status.weather === 'STORM' && (
          <div className="alert-box">
            WARNING: SOLAR STORM DETECTED
            <br />
            SIGNAL INTERFERENCE LIKELY
            <br />
            <small>MAGNETIC FLUX ELEVATED</small>
          </div>
        )}
      </div>

      <style>{`
        .ui-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          padding: 2rem;
          box-sizing: border-box;
          font-family: 'Consolas', 'Monaco', monospace;
          color: #0f0;
          text-shadow: 0 0 2px rgba(0, 255, 0, 0.5);
          background: radial-gradient(circle at center, transparent 80%, rgba(0, 50, 0, 0.2));
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid rgba(0, 255, 0, 0.3);
          padding-bottom: 1rem;
          background: linear-gradient(90deg, rgba(0,20,0,0.8) 0%, transparent 100%);
          padding: 1rem;
          pointer-events: auto;
        }

        h1 {
          margin: 0;
          font-size: 1.8rem;
          letter-spacing: 4px;
        }
        
        .sub {
          font-size: 0.9rem;
          opacity: 0.7;
          font-weight: normal;
        }

        .sys-status {
            font-size: 0.8rem;
            color: #af0;
            margin-top: 0.2rem;
        }

        .status-badge {
          border: 1px solid currentColor;
          padding: 0.5rem 1rem;
          font-weight: bold;
          background: rgba(0,0,0,0.5);
        }
        .status-badge[data-status="STORM"] {
          color: #f00;
          text-shadow: 0 0 5px #f00;
          border-color: #f00;
          animation: blink 1s infinite;
        }

        .connection-panel {
          position: absolute;
          top: 8rem;
          right: 2rem;
          width: 320px;
          background: rgba(0, 15, 0, 0.85);
          border: 1px solid rgba(0, 255, 0, 0.4);
          padding: 1.5rem;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
          backdrop-filter: blur(4px);
        }
        
        .panel-header {
           border-bottom: 1px solid #363;
           margin-bottom: 1rem;
           padding-bottom: 0.5rem;
           text-align: right;
           font-size: 0.9rem;
           opacity: 0.8;
           letter-spacing: 2px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
        }
        
        .grid-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
            background: rgba(0, 255, 0, 0.05);
            padding: 0.5rem;
        }
        
        .label-sm {
            font-size: 0.7rem;
            opacity: 0.7;
            display: block;
        }
        
        .value-lg {
            font-size: 1.1rem;
            font-weight: bold;
        }
        
        .unit {
            font-size: 0.8rem;
            font-weight: normal;
            opacity: 0.8;
        }

        .monitor {
           font-weight: bold;
           color: #fff;
           text-shadow: 0 0 5px #fff;
        }

        .rssi-bar-container {
          flex: 1;
          height: 8px;
          background: #121;
          margin: 0 1rem;
          border: 1px solid #353;
        }
        
        .rssi-bar {
          height: 100%;
          transition: width 0.2s, background-color 0.2s;
          box-shadow: 0 0 5px currentColor;
        }
        
        hr {
            border: 0;
            border-top: 1px solid #242;
            margin: 1rem 0;
        }
        
        .footer {
            margin-bottom: 0;
            opacity: 0.6;
            font-size: 0.8rem;
        }

        .alert-box {
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(40, 0, 0, 0.8);
          border: 2px solid #f00;
          color: #f00;
          padding: 1.5rem 3rem;
          text-align: center;
          font-size: 1.4rem;
          font-weight: bold;
          text-shadow: 0 0 10px #f00;
          animation: blink 0.5s infinite;
          z-index: 100;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default App;

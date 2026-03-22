import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import type { SupplyChainStop, SupplyChainArc } from '../utils/calculations';

interface SupplyChainMapProps {
  stops: SupplyChainStop[];
  arcs: SupplyChainArc[];
}

export function SupplyChainMap({ stops, arcs }: SupplyChainMapProps) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleGlobeReady = () => {
    if (!globeEl.current) return;
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.5;
    const dest = stops.find(s => s.type === 'destination') ?? stops[stops.length - 1];
    if (dest) globeEl.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 2.5 }, 1000);
  };

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        onGlobeReady={handleGlobeReady}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={stops}
        pointAltitude={0.02}
        pointRadius={0.8}
        pointColor={(d: any) => {
          const stop = d as SupplyChainStop;
          if (stop.type === 'origin') return '#10b981';
          if (stop.type === 'manufacturing') return '#06b6d4';
          if (stop.type === 'distribution') return '#3b82f6';
          return '#8b5cf6';
        }}
        pointLabel={(d: any) => {
          const stop = d as SupplyChainStop;
          return `<div style="background:rgba(0,0,0,0.8);padding:8px;border-radius:4px;color:white"><strong>${stop.name}</strong><br/><span style="font-size:12px">${stop.type.toUpperCase()}</span></div>`;
        }}
        arcsData={arcs}
        arcColor={(d: any) => (d as SupplyChainArc).arcColor}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={1.5}
        arcDashInitialGap={(_: any) => Math.random()}
        arcLabel={(d: any) => {
          const arc = d as SupplyChainArc;
          return `
            <div style="background:rgba(0,0,0,0.85);padding:10px 12px;border-radius:6px;color:white;font-size:12px;min-width:180px;border:1px solid rgba(255,255,255,0.15)">
              <div style="font-weight:600;margin-bottom:6px;color:#a3e635">${arc.transportMode} Route</div>
              <div style="color:#9ca3af;margin-bottom:2px">${arc.from.split(' - ')[1] ?? arc.from}</div>
              <div style="color:#6b7280;font-size:10px;margin-bottom:6px">↓</div>
              <div style="color:#9ca3af;margin-bottom:8px">${arc.to.split(' - ')[1] ?? arc.to}</div>
              <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px">
                <div><div style="color:#6b7280;font-size:10px">DISTANCE</div><div style="color:white">${arc.distanceKm.toLocaleString()} km</div></div>
                <div><div style="color:#6b7280;font-size:10px">CO₂</div><div style="color:#f87171">${arc.co2Kg} kg</div></div>
                <div><div style="color:#6b7280;font-size:10px">DURATION</div><div style="color:white">~${arc.durationDays}d</div></div>
                <div><div style="color:#6b7280;font-size:10px">MODE</div><div style="color:#60a5fa">${arc.transportMode}</div></div>
              </div>
            </div>
          `;
        }}
      />
    </div>
  );
}

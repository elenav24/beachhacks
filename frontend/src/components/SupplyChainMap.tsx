import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import type { SupplyChainStop } from '../utils/calculations';

interface SupplyChainMapProps {
  stops: SupplyChainStop[];
}

export function SupplyChainMap({ stops }: SupplyChainMapProps) {
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

  const arcColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];
  const arcs = stops.slice(0, -1).map((stop, i) => ({
    startLat: stop.lat,
    startLng: stop.lng,
    endLat: stops[i + 1].lat,
    endLng: stops[i + 1].lng,
    arcColor: arcColors[i % arcColors.length],
  }));

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
        arcColor={(d: any) => d.arcColor}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={1}
        arcDashInitialGap={(_: any) => Math.random()}
      />
    </div>
  );
}

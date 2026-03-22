import { useRef } from 'react';
import Globe from 'react-globe.gl';
import { MapPin, Factory, Warehouse, Home } from 'lucide-react';
import type { SupplyChainStop } from '../utils/calculations';

interface SupplyChainMapProps {
  stops: SupplyChainStop[];
}

export function SupplyChainMap({ stops }: SupplyChainMapProps) {
  const globeEl = useRef<any>(null);

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
    globeEl.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 2.5 }, 1000);
  };

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'origin': return <MapPin className="w-4 h-4" />;
      case 'manufacturing': return <Factory className="w-4 h-4" />;
      case 'distribution': return <Warehouse className="w-4 h-4" />;
      case 'destination': return <Home className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStopColor = (type: string) => {
    switch (type) {
      case 'origin': return 'bg-green-100 text-green-700 border-green-300';
      case 'manufacturing': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'distribution': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'destination': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        <Globe
          ref={globeEl}
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

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl mb-4 text-gray-900">Supply Chain Journey</h3>
        <div className="space-y-4">
          {stops.map((stop, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStopColor(stop.type)}`}>
                  {getStopIcon(stop.type)}
                </div>
                {index < stops.length - 1 && <div className="w-0.5 h-full bg-gray-300 my-1" />}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-gray-900">{stop.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase">{stop.type}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {stop.type === 'origin' && 'Raw materials sourced'}
                  {stop.type === 'manufacturing' && 'Product manufactured and assembled'}
                  {stop.type === 'distribution' && 'Sorted and prepared for final delivery'}
                  {stop.type === 'destination' && 'Final delivery to customer'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-600 mb-1">Total Distance</p>
          <p className="text-2xl text-emerald-900">~{(stops.length * 3500).toLocaleString()} km</p>
          <p className="text-xs text-emerald-700 mt-1">Approximate shipping distance</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Supply Chain Stops</p>
          <p className="text-2xl text-blue-900">{stops.length}</p>
          <p className="text-xs text-blue-700 mt-1">Countries/regions involved</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 mb-1">Estimated Transit</p>
          <p className="text-2xl text-purple-900">~{Math.round(stops.length * 7)} days</p>
          <p className="text-xs text-purple-700 mt-1">From source to delivery</p>
        </div>
      </div>
    </div>
  );
}

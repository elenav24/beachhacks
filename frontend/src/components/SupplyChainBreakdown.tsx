import { Ship, Truck, Plane, Train, MapPin, ArrowDown } from 'lucide-react';
import type { SupplyChainStop, SupplyChainArc } from '../utils/calculations';

interface SupplyChainBreakdownProps {
  stops: SupplyChainStop[];
  arcs: SupplyChainArc[];
}

const modeIcon = (mode: string) => {
  if (mode === 'Ship') return <Ship className="w-3 h-3" />;
  if (mode === 'Air') return <Plane className="w-3 h-3" />;
  if (mode === 'Rail') return <Train className="w-3 h-3" />;
  return <Truck className="w-3 h-3" />;
};

const stopColor: Record<string, string> = {
  origin: 'text-emerald-400 border-emerald-400/40',
  manufacturing: 'text-cyan-400 border-cyan-400/40',
  distribution: 'text-blue-400 border-blue-400/40',
  destination: 'text-purple-400 border-purple-400/40',
};

export function SupplyChainBreakdown({ stops, arcs }: SupplyChainBreakdownProps) {
  const totalCo2 = arcs.reduce((s, a) => s + a.co2Kg, 0);
  const totalDist = arcs.reduce((s, a) => s + a.distanceKm, 0);
  const totalDays = arcs.reduce((s, a) => s + a.durationDays, 0);

  return (
    <div className="text-gray-100 font-mono text-sm space-y-4">
      <div className="text-center border-b border-white/10 pb-3">
        <h2 className="text-sm tracking-widest text-white">SUPPLY CHAIN</h2>
        <p className="text-gray-400 text-xs mt-1">Full Route Breakdown</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-red-400 text-base">{totalCo2.toFixed(2)}</div>
          <div className="text-gray-500 text-xs">kg CO₂</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-blue-400 text-base">{totalDist.toLocaleString()}</div>
          <div className="text-gray-500 text-xs">km total</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-amber-400 text-base">{totalDays}</div>
          <div className="text-gray-500 text-xs">days est.</div>
        </div>
      </div>

      {/* Stop + arc timeline */}
      <div className="space-y-1">
        {stops.map((stop, i) => (
          <div key={i}>
            {/* Stop node */}
            <div className={`flex items-start gap-2 p-2 rounded-lg border ${stopColor[stop.type]} bg-white/5`}>
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-white text-xs leading-tight truncate">{stop.name}</div>
                <div className="text-gray-500 text-xs uppercase">{stop.type}</div>
              </div>
            </div>

            {/* Arc connector */}
            {i < arcs.length && (
              <div className="ml-3 pl-3 border-l border-white/10 py-1">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <ArrowDown className="w-3 h-3 shrink-0" />
                  {modeIcon(arcs[i].transportMode)}
                  <span>{arcs[i].transportMode}</span>
                  <span className="text-gray-600">·</span>
                  <span>{arcs[i].distanceKm.toLocaleString()} km</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-red-400">{arcs[i].co2Kg} kg CO₂</span>
                </div>
                <div className="text-gray-600 text-xs ml-5">~{arcs[i].durationDays} day{arcs[i].durationDays !== 1 ? 's' : ''} transit</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Per-leg CO2 bar chart */}
      {arcs.length > 0 && (
        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="text-gray-400 text-xs tracking-wider">CO₂ PER LEG</div>
          {arcs.map((arc, i) => {
            const pct = totalCo2 > 0 ? (arc.co2Kg / totalCo2) * 100 : 0;
            return (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 truncate max-w-[160px]">
                    {arc.from.split(' - ')[1] ?? arc.from} → {arc.to.split(' - ')[1] ?? arc.to}
                  </span>
                  <span className="text-red-400 shrink-0 ml-1">{arc.co2Kg} kg</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

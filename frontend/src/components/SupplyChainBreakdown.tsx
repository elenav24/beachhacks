import { Ship, Truck, Plane, Train, MapPin } from 'lucide-react';
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
        <div className="text-gray-100 font-mono text-xs p-4">
            <div className="flex items-center gap-6 min-w-max">

                <div className="flex gap-3 shrink-0">
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                        <div className="text-red-400 text-sm">{totalCo2.toFixed(2)}</div>
                        <div className="text-gray-500 text-xs">kg CO₂</div>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                        <div className="text-blue-400 text-sm">{totalDist.toLocaleString()}</div>
                        <div className="text-gray-500 text-xs">km total</div>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                        <div className="text-amber-400 text-sm">{totalDays}</div>
                        <div className="text-gray-500 text-xs">days est.</div>
                    </div>
                </div>

                <div className="w-px h-20 bg-white/10 shrink-0" />

                <div className="flex items-center">
                    {stops.map((stop, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border ${stopColor[stop.type]} bg-white/5`}>
                                <MapPin className="w-3 h-3 shrink-0" />
                                <div className="text-white text-xs leading-tight text-center max-w-20 truncate">{stop.name}</div>
                                <div className="text-gray-500 text-xs uppercase">{stop.type}</div>
                            </div>

                            {i < arcs.length && (
                                <div className="flex flex-col items-center px-2 min-w-25">
                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        {modeIcon(arcs[i].transportMode)}
                                        <span>{arcs[i].transportMode}</span>
                                    </div>
                                    <div className="w-full h-px bg-white/20 my-0.5 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r border-t border-white/40 rotate-45" />
                                    </div>
                                    <div className="text-red-400 text-xs">{arcs[i].co2Kg} kg CO₂</div>
                                    <div className="text-gray-600 text-xs">{arcs[i].distanceKm.toLocaleString()} km</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

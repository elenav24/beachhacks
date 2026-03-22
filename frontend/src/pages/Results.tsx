import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { BreakdownReceipt } from '../components/BreakdownReceipt';
import { SupplyChainBreakdown } from '../components/SupplyChainBreakdown';
import { SupplyChainMap } from '../components/SupplyChainMap';
import { useReceipt, useManualReceipt, type ManualProduct } from '../hooks/useReceipt';
import {
  mapReceiptToMetrics,
  buildArcs,
  resolveDeliveryStop,
  type SupplyChainStop,
  type SupplyChainArc,
} from '../utils/calculations';

export default function Results() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [manualProduct, setManualProduct] = useState<ManualProduct | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [supplyChain, setSupplyChain] = useState<SupplyChainStop[]>([]);
  const [arcs, setArcs] = useState<SupplyChainArc[]>([]);

  useEffect(() => {
    const storedUrl = sessionStorage.getItem('receiptUrl');
    const storedManual = sessionStorage.getItem('manualProduct');

    if (!storedUrl && !storedManual) {
      navigate('/');
      return;
    }

    setDeliveryLocation(sessionStorage.getItem('deliveryLocation') ?? '');

    if (storedUrl) {
      setUrl(storedUrl);
    } else if (storedManual) {
      setManualProduct(JSON.parse(storedManual) as ManualProduct);
    }
  }, [navigate]);

  const urlQuery = useReceipt(url);
  const manualQuery = useManualReceipt(manualProduct);

  const { data: receipt, isLoading, isError, error } = url ? urlQuery : manualQuery;

  useEffect(() => {
    if (!receipt) return;

    const backendStops: SupplyChainStop[] = (receipt.supply_chain ?? []).map(s => ({
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      type: s.type as SupplyChainStop['type'],
    }));

    if (backendStops.length >= 2) {
      const raw = deliveryLocation.trim();
      if (raw) {
        // User specified a delivery location — override the destination stop
        resolveDeliveryStop(raw).then(destStop => {
          const stops = backendStops.filter(s => s.type !== 'destination');
          stops.push(destStop);
          setSupplyChain(stops);
          setArcs(buildArcs(stops));
        });
      } else {
        // Use backend stops exactly as returned — destination already set
        setSupplyChain(backendStops);
        setArcs(buildArcs(backendStops));
      }
    } else {
      // Fallback: no backend stops, build from receipt metadata
      resolveDeliveryStop(deliveryLocation).then(destStop => {
        const fallback: SupplyChainStop[] = [];
        if (receipt.origin_lat != null && receipt.origin_lng != null) {
          fallback.push({ name: receipt.emission_factor_region ?? 'Origin', lat: receipt.origin_lat, lng: receipt.origin_lng, type: 'origin' });
        }
        fallback.push({ name: 'Distribution - Los Angeles', lat: 34.0522, lng: -118.2437, type: 'distribution' });
        fallback.push(destStop);
        setSupplyChain(fallback);
        setArcs(buildArcs(fallback));
      });
    }
  }, [receipt, deliveryLocation]);

  if ((!url && !manualProduct) || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Analyzing environmental impact...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-red-400 text-lg">{(error as Error)?.message ?? 'Something went wrong'}</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!receipt) return null;

  const metrics = mapReceiptToMetrics(receipt);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-950 relative">

      <div className="absolute inset-0 -translate-x-67">
        <SupplyChainMap stops={supplyChain} arcs={arcs} />
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 -translate-y-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {receipt.product_name}
        </Button>
      </div>

        {/* Right sidebar — Breakdown Receipt */}
      <aside className="absolute right-12 top-[47%] -translate-y-1/2 w-122 max-h-[80vh] z-10 flex flex-col bg-slate-800/75 backdrop-blur-md border border-slate-600/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-y-auto p-5">
          <BreakdownReceipt metrics={metrics} receipt={receipt} />
        </div>
      </aside>

      {/* Bottom bar — Supply Chain Breakdown */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/80 backdrop-blur-md border-t border-slate-600/40 shadow-2xl">
        <div className="overflow-x-auto">
          <SupplyChainBreakdown stops={supplyChain} arcs={arcs} />
        </div>
      </div>
    </div>
  );
}

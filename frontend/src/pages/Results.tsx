import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { EnvironmentalGrade } from '../components/EnvironmentalGrade';
import { BreakdownReceipt } from '../components/BreakdownReceipt';
import { SupplyChainBreakdown } from '../components/SupplyChainBreakdown';
import { SupplyChainMap } from '../components/SupplyChainMap';
import { useReceipt, useManualReceipt, type ManualProduct } from '../hooks/useReceipt';
import {
  mapReceiptToMetrics,
  generateSupplyChain,
  buildArcs,
  type SupplyChainStop,
  type SupplyChainArc,
} from '../utils/calculations';

type RightTab = 'receipt' | 'supply';

export default function Results() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [manualProduct, setManualProduct] = useState<ManualProduct | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [supplyChain, setSupplyChain] = useState<SupplyChainStop[]>([]);
  const [arcs, setArcs] = useState<SupplyChainArc[]>([]);
  const [rightTab, setRightTab] = useState<RightTab>('receipt');

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
    generateSupplyChain(receipt, deliveryLocation).then(stops => {
      setSupplyChain(stops);
      setArcs(buildArcs(stops));
    });
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
      {/* Fullscreen Globe */}
      <SupplyChainMap stops={supplyChain} arcs={arcs} />

      {/* Back button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {receipt.product_name}
        </Button>
      </div>

      {/* Left card — Environmental Grade */}
      <aside className="absolute left-6 top-1/2 -translate-y-1/2 w-72 max-h-[80vh] z-10 overflow-y-auto bg-slate-800/75 backdrop-blur-md border border-slate-600/40 rounded-2xl p-5 shadow-2xl">
        <EnvironmentalGrade metrics={metrics} />
      </aside>

      {/* Right card — tabbed */}
      <aside className="absolute right-6 top-1/2 -translate-y-1/2 w-72 max-h-[80vh] z-10 flex flex-col bg-slate-800/75 backdrop-blur-md border border-slate-600/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-white/10 shrink-0">
          <button
            onClick={() => setRightTab('receipt')}
            className={`flex-1 py-2.5 text-xs tracking-wider font-mono transition-colors ${
              rightTab === 'receipt'
                ? 'text-white border-b-2 border-emerald-400 bg-white/5'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            RECEIPT
          </button>
          <button
            onClick={() => setRightTab('supply')}
            className={`flex-1 py-2.5 text-xs tracking-wider font-mono transition-colors ${
              rightTab === 'supply'
                ? 'text-white border-b-2 border-blue-400 bg-white/5'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            SUPPLY CHAIN
          </button>
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto p-5">
          {rightTab === 'receipt' ? (
            <BreakdownReceipt metrics={metrics} receipt={receipt} />
          ) : (
            <SupplyChainBreakdown stops={supplyChain} arcs={arcs} />
          )}
        </div>
      </aside>
    </div>
  );
}

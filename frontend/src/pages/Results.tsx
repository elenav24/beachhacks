import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { EnvironmentalGrade } from '../components/EnvironmentalGrade';
import { BreakdownReceipt } from '../components/BreakdownReceipt';
import { SupplyChainMap } from '../components/SupplyChainMap';
import { useReceipt } from '../hooks/useReceipt';
import { mapReceiptToMetrics, generateSupplyChain, type SupplyChainStop } from '../utils/calculations';

export default function Results() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [supplyChain, setSupplyChain] = useState<SupplyChainStop[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('receiptUrl');
    if (!stored) {
      navigate('/');
    } else {
      setUrl(stored);
      setDeliveryLocation(sessionStorage.getItem('deliveryLocation') ?? '');
    }
  }, [navigate]);

  const { data: receipt, isLoading, isError, error } = useReceipt(url);

  useEffect(() => {
    if (!receipt) return;
    generateSupplyChain(receipt, deliveryLocation).then(setSupplyChain);
  }, [receipt, deliveryLocation]);

  if (!url || isLoading) {
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
      <SupplyChainMap stops={supplyChain} />

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

      {/* Left sidebar — Environmental Grade */}
      <aside className="absolute top-0 left-0 h-full w-80 z-10 overflow-y-auto bg-black/50 backdrop-blur-md border-r border-white/10 p-4">
        <EnvironmentalGrade metrics={metrics} />
      </aside>

      {/* Right sidebar — Breakdown Receipt */}
      <aside className="absolute top-0 right-0 h-full w-80 z-10 overflow-y-auto bg-black/50 backdrop-blur-md border-l border-white/10 p-4">
        <BreakdownReceipt metrics={metrics} receipt={receipt} />
      </aside>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Award, Receipt, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EnvironmentalGrade } from '../components/EnvironmentalGrade';
import { BreakdownReceipt } from '../components/BreakdownReceipt';
import { SupplyChainMap } from '../components/SupplyChainMap';
import { useReceipt } from '../hooks/useReceipt';
import { mapReceiptToMetrics, generateSupplyChain } from '../utils/calculations';

export default function Results() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('receiptUrl');
    if (!stored) {
      navigate('/');
    } else {
      setUrl(stored);
    }
  }, [navigate]);

  const { data: receipt, isLoading, isError, error } = useReceipt(url);

  if (!url || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Analyzing environmental impact...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-red-600 text-lg">{(error as Error)?.message ?? 'Something went wrong'}</p>
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
  const supplyChain = generateSupplyChain(receipt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-medium text-gray-900 truncate max-w-lg">{receipt.product_name}</h1>
                <p className="text-sm text-gray-600">{receipt.brand} • {receipt.price != null ? `$${receipt.price.toFixed(2)}` : 'Price unavailable'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg">
              <span className="text-emerald-700">Grade:</span>
              <span className="text-2xl font-medium text-emerald-900">{metrics.grade}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="grade" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="grade" className="gap-2">
              <Award className="w-4 h-4" />
              Grade
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="gap-2">
              <Receipt className="w-4 h-4" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Globe className="w-4 h-4" />
              Supply Chain
            </TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <TabsContent value="grade" className="mt-0">
              <EnvironmentalGrade metrics={metrics} />
            </TabsContent>
            <TabsContent value="breakdown" className="mt-0">
              <BreakdownReceipt metrics={metrics} receipt={receipt} />
            </TabsContent>
            <TabsContent value="map" className="mt-0">
              <SupplyChainMap stops={supplyChain} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

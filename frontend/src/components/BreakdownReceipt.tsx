import { Factory, Truck, Package, Droplet, Leaf, Users, Timer } from 'lucide-react';
import type { EnvironmentalMetrics } from '../utils/calculations';
import type { EnvironmentalReceipt } from '../api/types';

interface BreakdownReceiptProps {
  metrics: EnvironmentalMetrics;
  receipt: EnvironmentalReceipt;
}

export function BreakdownReceipt({ metrics, receipt }: BreakdownReceiptProps) {
  const getHumanCostLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-400' };
    if (score >= 60) return { label: 'Good', color: 'text-emerald-400' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-400' };
    if (score >= 20) return { label: 'Poor', color: 'text-orange-400' };
    return { label: 'Very Poor', color: 'text-red-400' };
  };

  const humanCostStatus = getHumanCostLabel(metrics.humanCost);

  return (
    <div className="text-white font-mono text-sm space-y-4">
      <div className="text-center border-b border-white/20 pb-4">
        <h2 className="text-base tracking-widest text-white">ENVIRONMENTAL RECEIPT</h2>
        <p className="text-gray-400 text-xs mt-1">True Cost Analysis</p>
        <p className="text-gray-500 text-xs">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 shrink-0">PRODUCT:</span>
          <span className="text-white text-right truncate">{receipt.product_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">BRAND:</span>
          <span className="text-white">{receipt.brand}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">PRICE:</span>
          <span className="text-white">${(receipt.price ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-white/20 pt-4 space-y-2">
        <div className="flex items-center gap-2 text-green-400">
          <Leaf className="w-4 h-4" />
          <span className="tracking-wider">CO₂ EMISSIONS</span>
        </div>
        <div className="ml-6 space-y-1">
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-gray-400"><Factory className="w-3 h-3" /> Manufacturing</span>
            <span>{metrics.breakdown.manufacturing} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-gray-400"><Truck className="w-3 h-3" /> Shipping</span>
            <span>{metrics.breakdown.shipping} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-gray-400"><Package className="w-3 h-3" /> Materials</span>
            <span>{metrics.breakdown.materials} kg</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
            <span>TOTAL CO₂:</span>
            <span className="text-lg">{metrics.co2} kg</span>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-white/20 pt-4 space-y-2">
        <div className="flex items-center gap-2 text-blue-400">
          <Droplet className="w-4 h-4" />
          <span className="tracking-wider">WATER USAGE</span>
        </div>
        <div className="ml-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Consumed:</span>
            <span className="text-lg">{metrics.water.toLocaleString()} L</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">≈ {Math.round(metrics.water / 8)} days of drinking water</p>
        </div>
      </div>

      <div className="border-t border-dashed border-white/20 pt-4 space-y-2">
        <div className="flex items-center gap-2 text-purple-400">
          <Users className="w-4 h-4" />
          <span className="tracking-wider">HUMAN COST</span>
        </div>
        <div className="ml-6 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Labor Ethics:</span>
            <span className={`text-lg ${humanCostStatus.color}`}>{metrics.humanCost}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Rating:</span>
            <span className={`text-xs ${humanCostStatus.color}`}>{humanCostStatus.label}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-white/20 pt-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Timer className="w-4 h-4" />
          <span className="tracking-wider">DEGRADATION</span>
        </div>
        <div className="ml-6 flex justify-between">
          <span className="text-gray-400">Time to Decompose:</span>
          <span className="text-lg">
            {metrics.degradationTime >= 1000 ? '1000+ yrs' : `${metrics.degradationTime} yrs`}
          </span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4 bg-white/5 -mx-4 px-4 pb-4 rounded-b-lg">
        <div className="flex justify-between items-center">
          <span className="tracking-wider">GRADE:</span>
          <span className="text-4xl">{metrics.grade}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-400 text-xs">Overall Score:</span>
          <span className="text-gray-300">{metrics.gradeScore}/100</span>
        </div>
      </div>
    </div>
  );
}

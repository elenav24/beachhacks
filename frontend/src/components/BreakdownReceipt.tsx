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
    <div className="text-gray-100 font-mono text-sm space-y-4">
      <div className="text-center border-b border-white/10 pb-3">
        <h2 className="text-sm tracking-widest text-white">ENVIRONMENTAL RECEIPT</h2>
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

      <div className="border-t border-dashed border-white/10 pt-3 space-y-2">
        <div className="flex items-center gap-2 text-green-400">
          <Leaf className="w-4 h-4" />
          <span className="tracking-wider text-xs">CO₂ EMISSIONS</span>
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
            <span className="text-gray-300">TOTAL CO₂:</span>
            <span className="text-base text-white">{metrics.co2} kg</span>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-white/10 pt-3 space-y-2">
        <div className="flex items-center gap-2 text-blue-400">
          <Droplet className="w-4 h-4" />
          <span className="tracking-wider text-xs">WATER USAGE</span>
        </div>
        <div className="ml-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Consumed:</span>
            <span className="text-white">{metrics.water.toLocaleString()} L</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">≈ {Math.round(metrics.water / 8)} days of drinking water</p>
        </div>
      </div>

      <div className="border-t border-dashed border-white/10 pt-3 space-y-2">
        <div className="flex items-center gap-2 text-purple-400">
          <Users className="w-4 h-4" />
          <span className="tracking-wider text-xs">HUMAN COST</span>
        </div>
        <div className="ml-6 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Labor Ethics:</span>
            <span className={`text-base ${humanCostStatus.color}`}>{metrics.humanCost}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Rating:</span>
            <span className={`text-xs ${humanCostStatus.color}`}>{humanCostStatus.label}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-white/10 pt-3 space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Timer className="w-4 h-4" />
          <span className="tracking-wider text-xs">DEGRADATION</span>
        </div>
        <div className="ml-6 flex justify-between">
          <span className="text-gray-400">Time to Decompose:</span>
          <span className="text-base text-white">
            {metrics.degradationTime >= 1000 ? '1000+ yrs' : `${metrics.degradationTime} yrs`}
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-3 bg-white/5 -mx-5 px-5 pb-4 rounded-b-2xl">
        <div className="flex justify-between items-center">
          <span className="tracking-wider text-gray-300">GRADE:</span>
          <span className="text-4xl text-white">{metrics.grade}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-500 text-xs">Overall Score:</span>
          <span className="text-gray-300 text-lg">{metrics.gradeScore}/100</span>
        </div>
      </div>
    </div>
  );
}

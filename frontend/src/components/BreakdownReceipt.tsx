import { Factory, Truck, Package, Droplet, Leaf, Users, Timer } from 'lucide-react';
import type { EnvironmentalMetrics } from '../utils/calculations';
import type { EnvironmentalReceipt } from '../api/types';

interface BreakdownReceiptProps {
  metrics: EnvironmentalMetrics;
  receipt: EnvironmentalReceipt;
}

export function BreakdownReceipt({ metrics, receipt }: BreakdownReceiptProps) {
  const getHumanCostLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { label: 'Good', color: 'text-emerald-600' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600' };
    if (score >= 20) return { label: 'Poor', color: 'text-orange-600' };
    return { label: 'Very Poor', color: 'text-red-600' };
  };

  const humanCostStatus = getHumanCostLabel(metrics.humanCost);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 shadow-lg font-mono">
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-6">
          <h2 className="text-2xl mb-2">ENVIRONMENTAL RECEIPT</h2>
          <p className="text-sm text-gray-600">True Cost Analysis</p>
          <p className="text-xs text-gray-500 mt-2">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="mb-6 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">PRODUCT:</span>
            <span className="text-gray-900 text-right max-w-xs truncate">{receipt.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">BRAND:</span>
            <span className="text-gray-900">{receipt.brand}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">PRICE:</span>
            <span className="text-gray-900">${(receipt.price ?? 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-green-600" />
              <h3 className="text-lg">CO₂ EMISSIONS</h3>
            </div>
            <div className="space-y-2 ml-7">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Manufacturing</span>
                </div>
                <span className="text-gray-900">{metrics.breakdown.manufacturing} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Shipping</span>
                </div>
                <span className="text-gray-900">{metrics.breakdown.shipping} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Materials</span>
                </div>
                <span className="text-gray-900">{metrics.breakdown.materials} kg</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>TOTAL CO₂:</span>
                <span className="text-xl">{metrics.co2} kg</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300"></div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">WATER USAGE</h3>
            </div>
            <div className="flex justify-between ml-7">
              <span>Total Water Consumed:</span>
              <span className="text-xl">{metrics.water.toLocaleString()} L</span>
            </div>
            <p className="text-xs text-gray-500 ml-7 mt-2">
              Equivalent to {Math.round(metrics.water / 8)} days of drinking water
            </p>
          </div>

          <div className="border-t-2 border-dashed border-gray-300"></div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">HUMAN COST</h3>
            </div>
            <div className="ml-7 space-y-2">
              <div className="flex justify-between items-center">
                <span>Labor Ethics Score:</span>
                <span className={`text-xl ${humanCostStatus.color}`}>{metrics.humanCost}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rating:</span>
                <span className={`text-sm ${humanCostStatus.color}`}>{humanCostStatus.label}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300"></div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg">DEGRADATION TIME</h3>
            </div>
            <div className="ml-7">
              <div className="flex justify-between">
                <span>Time to Decompose:</span>
                <span className="text-xl">
                  {metrics.degradationTime >= 1000
                    ? '1000+ years'
                    : `${metrics.degradationTime} ${metrics.degradationTime === 1 ? 'year' : 'years'}`}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300"></div>

          <div className="bg-gray-50 -mx-8 -mb-8 mt-6 p-6 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl">ENVIRONMENTAL GRADE:</span>
              <span className="text-4xl">{metrics.grade}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Overall Score:</span>
              <span className="text-xl text-gray-900">{metrics.gradeScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h4 className="text-lg text-emerald-900 mb-2">Environmental Conclusion</h4>
        <p className="text-sm text-emerald-800">
          {metrics.grade === 'A+' || metrics.grade === 'A'
            ? 'This product demonstrates strong environmental stewardship with low emissions, reasonable water usage, and ethical labor practices.'
            : metrics.grade === 'B'
            ? 'This product has a moderate environmental impact. There is room for improvement in sustainability practices.'
            : 'This product carries a significant environmental burden. Exploring more sustainable alternatives would benefit our planet.'}
        </p>
      </div>
    </div>
  );
}

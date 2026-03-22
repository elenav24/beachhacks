import { Leaf, AlertTriangle, CheckCircle } from 'lucide-react';
import type { EnvironmentalMetrics } from '../utils/calculations';

interface EnvironmentalGradeProps {
  metrics: EnvironmentalMetrics;
}

export function EnvironmentalGrade({ metrics }: EnvironmentalGradeProps) {
  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 bg-green-50 border-green-600';
    if (grade === 'B') return 'text-emerald-600 bg-emerald-50 border-emerald-600';
    if (grade === 'C') return 'text-yellow-600 bg-yellow-50 border-yellow-600';
    if (grade === 'D') return 'text-orange-600 bg-orange-50 border-orange-600';
    return 'text-red-600 bg-red-50 border-red-600';
  };

  const getRecommendation = (grade: string) => {
    if (grade === 'A+' || grade === 'A') {
      return {
        icon: <CheckCircle className="w-6 h-6" />,
        title: 'Excellent Choice!',
        message: 'This product has a minimal environmental impact. Great sustainable choice!',
      };
    }
    if (grade === 'B') {
      return {
        icon: <Leaf className="w-6 h-6" />,
        title: 'Good Choice',
        message: 'This product has a moderate environmental impact. Consider alternatives for better sustainability.',
      };
    }
    return {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'High Impact',
      message: 'This product has a significant environmental impact. We recommend looking for more sustainable alternatives.',
    };
  };

  const recommendation = getRecommendation(metrics.grade);
  const iconColor =
    metrics.grade === 'A+' || metrics.grade === 'A'
      ? 'text-green-600'
      : metrics.grade === 'B'
      ? 'text-emerald-600'
      : metrics.grade === 'C'
      ? 'text-yellow-600'
      : metrics.grade === 'D'
      ? 'text-orange-600'
      : 'text-red-600';

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 mb-4">Environmental Grade</p>
        <div className={`w-48 h-48 rounded-full border-8 flex items-center justify-center ${getGradeColor(metrics.grade)}`}>
          <span className="text-7xl">{metrics.grade}</span>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">Overall Score</p>
          <p className="text-4xl text-gray-900">{metrics.gradeScore}/100</p>
        </div>
      </div>

      <div className={`p-6 rounded-lg border-l-4 ${getGradeColor(metrics.grade)}`}>
        <div className="flex items-start gap-4">
          <div className={iconColor}>{recommendation.icon}</div>
          <div>
            <h3 className="text-xl text-gray-900 mb-2">{recommendation.title}</h3>
            <p className="text-gray-700">{recommendation.message}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">CO₂ Emissions</p>
          <p className="text-2xl text-blue-900">{metrics.co2} kg</p>
        </div>
        <div className="bg-cyan-50 p-4 rounded-lg">
          <p className="text-sm text-cyan-600 mb-1">Water Usage</p>
          <p className="text-2xl text-cyan-900">{metrics.water.toLocaleString()} L</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Human Cost</p>
          <p className="text-2xl text-purple-900">{metrics.humanCost}/100</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-600 mb-1">Degradation</p>
          <p className="text-2xl text-amber-900">
            {metrics.degradationTime} {metrics.degradationTime === 1 ? 'yr' : 'yrs'}
          </p>
        </div>
      </div>
    </div>
  );
}

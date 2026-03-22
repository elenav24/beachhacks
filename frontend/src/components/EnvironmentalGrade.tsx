import { Leaf, AlertTriangle, CheckCircle } from 'lucide-react';
import type { EnvironmentalMetrics } from '../utils/calculations';

interface EnvironmentalGradeProps {
  metrics: EnvironmentalMetrics;
}

export function EnvironmentalGrade({ metrics }: EnvironmentalGradeProps) {
  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A' || grade === 'A-') return 'text-green-400 border-green-400';
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'text-emerald-400 border-emerald-400';
    if (grade === 'C+' || grade === 'C' || grade === 'C-') return 'text-yellow-400 border-yellow-400';
    if (grade === 'D+' || grade === 'D' || grade === 'D-') return 'text-orange-400 border-orange-400';
    return 'text-red-400 border-red-400';
  };

  const getRecommendation = (grade: string) => {
    if (grade.startsWith('A')) return {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Excellent Choice',
      message: 'Minimal environmental impact. Great sustainable choice.',
    };
    if (grade.startsWith('B')) return {
      icon: <Leaf className="w-5 h-5" />,
      title: 'Good Choice',
      message: 'Moderate impact. Consider alternatives for better sustainability.',
    };
    return {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'High Impact',
      message: 'Significant environmental burden. Look for more sustainable alternatives.',
    };
  };

  const rec = getRecommendation(metrics.grade);
  const gradeColor = getGradeColor(metrics.grade);

  return (
    <div className="space-y-5 text-gray-100">
      <div className="flex flex-col items-center py-4">
        <p className="text-gray-400 text-sm mb-3">Environmental Grade</p>
        <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center ${gradeColor}`}>
          <span className="text-5xl">{metrics.grade}</span>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">Overall Score</p>
          <p className="text-3xl text-white">{metrics.gradeScore}/100</p>
        </div>
      </div>

      <div className={`p-3 rounded-lg border-l-4 bg-white/5 ${gradeColor}`}>
        <div className="flex items-start gap-3">
          <div className={gradeColor.split(' ')[0]}>{rec.icon}</div>
          <div>
            <h3 className="text-white text-sm font-medium mb-0.5">{rec.title}</h3>
            <p className="text-gray-300 text-xs">{rec.message}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-blue-300 text-xs mb-1">CO₂ Emissions</p>
          <p className="text-white text-lg">{metrics.co2} kg</p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-cyan-300 text-xs mb-1">Water Usage</p>
          <p className="text-white text-lg">{metrics.water.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-purple-300 text-xs mb-1">Human Cost</p>
          <p className="text-white text-lg">{metrics.humanCost}/100</p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-amber-300 text-xs mb-1">Degradation</p>
          <p className="text-white text-lg">
            {metrics.degradationTime >= 1000 ? '1000+ yrs' : `${metrics.degradationTime} yrs`}
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

interface RiskGaugeProps {
  score: number; // 0.0 to 1.0
  level: 'low' | 'medium' | 'high' | 'critical';
}

const levelColors = {
  low: { text: 'text-emerald-600', ring: '#10b981', bg: 'bg-emerald-50' },
  medium: { text: 'text-amber-600', ring: '#f59e0b', bg: 'bg-amber-50' },
  high: { text: 'text-orange-600', ring: '#f97316', bg: 'bg-orange-50' },
  critical: { text: 'text-rose-600', ring: '#f43f5e', bg: 'bg-rose-50' },
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  const percentage = Math.round(score * 100);
  const config = levelColors[level] || levelColors.medium;

  // SVG circle calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score * circumference);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={config.ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-xs text-gray-500 font-medium">Risk Score</span>
        </div>
      </div>
      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${config.bg} ${config.text}`}>
        {level} risk
      </div>
    </div>
  );
};

import React from 'react';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

const styles = {
  low: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Low Risk',
  },
  medium: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Medium Risk',
  },
  high: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    label: 'High Risk',
  },
  critical: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Critical Risk',
  },
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1 font-medium',
  lg: 'text-sm px-3 py-1.5 font-medium',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const config = styles[level] || styles.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizes[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Contract } from '../types';
import { FileText, Calendar, Clock, ArrowRight, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface ContractCardProps {
  contract: Contract;
}

const statusConfig = {
  pending: {
    label: 'Ready to analyze',
    icon: Clock,
    badge: 'bg-gray-100 text-gray-700',
  },
  analyzing: {
    label: 'Analyzing...',
    icon: Loader2,
    badge: 'bg-teal-50 text-teal-700 animate-pulse',
  },
  completed: {
    label: 'Analyzed',
    icon: CheckCircle,
    badge: 'bg-emerald-50 text-emerald-700',
  },
  failed: {
    label: 'Analysis failed',
    icon: AlertTriangle,
    badge: 'bg-rose-50 text-rose-700',
  },
};

export const ContractCard: React.FC<ContractCardProps> = ({ contract }) => {
  const status = statusConfig[contract.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const formattedDate = new Date(contract.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/contracts/${contract.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all p-5"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 shrink-0 group-hover:bg-teal-100 transition-colors">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
              {contract.title}
            </h3>
            {contract.filename && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {contract.filename}
              </p>
            )}
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${status.badge}`}
        >
          <StatusIcon className={`h-3.5 w-3.5 ${contract.status === 'analyzing' ? 'animate-spin' : ''}`} />
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="uppercase tracking-wider font-medium text-gray-400">
            {contract.upload_type}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 font-medium text-teal-600 group-hover:translate-x-0.5 transition-transform">
          View details
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
};

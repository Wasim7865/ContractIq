import React, { useState } from 'react';
import { ClauseAnalysis } from '../types';
import { RiskBadge } from './RiskBadge';
import { ChevronDown, ChevronUp, AlertCircle, Quote } from 'lucide-react';

interface ClauseCardProps {
  clause: ClauseAnalysis;
  index: number;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
      >
        <div className="flex items-start gap-3.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {index + 1}
          </span>
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              {clause.clause_title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {clause.explanation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <RiskBadge level={clause.risk_level} size="sm" />
          <button className="text-gray-400 hover:text-gray-600 p-1">
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">
          {/* Full explanation */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-teal-600" />
              Detailed Analysis
            </h5>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              {clause.explanation}
            </p>
          </div>

          {/* Original clause text */}
          {clause.clause_text && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Quote className="h-3.5 w-3.5 text-gray-400" />
                Original Contract Text
              </h5>
              <div className="text-xs font-mono text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {clause.clause_text}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

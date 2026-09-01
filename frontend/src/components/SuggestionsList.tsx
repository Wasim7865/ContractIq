import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface SuggestionsListProps {
  suggestions: string[];
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Actionable Recommendations
          </h3>
          <p className="text-xs text-gray-500">
            AI-suggested next steps and negotiation points
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm text-gray-700 bg-amber-50/50 p-3.5 rounded-lg border border-amber-100"
          >
            <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

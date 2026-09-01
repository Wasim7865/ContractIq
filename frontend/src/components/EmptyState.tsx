import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No contracts yet',
  description = 'Upload your first contract to get an AI-powered risk analysis.',
  actionText = 'Upload a Contract',
  actionHref = '/new',
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto">
      <div className="mx-auto h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>
      {actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
};

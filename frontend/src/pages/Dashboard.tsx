import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Contract } from '../types';
import { ContractCard } from '../components/ContractCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { FileText, ShieldAlert, CheckCircle, Plus, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listContracts();
      setContracts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = contracts.filter((c) => c.status === 'completed').length;
  const pendingCount = contracts.filter((c) => c.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Contracts Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload, analyze, and manage your legal documents
          </p>
        </div>

        <Link
          to="/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Upload New Contract
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Contracts
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {contracts.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Analyzed
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {completedCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pending Analysis
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadContracts}
            className="underline font-medium hover:text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading your contracts..." />
      ) : contracts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
};

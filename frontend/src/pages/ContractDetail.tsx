import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { ContractDetail as IContractDetail } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { RiskBadge } from '../components/RiskBadge';
import { ClauseCard } from '../components/ClauseCard';
import { SuggestionsList } from '../components/SuggestionsList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  AlertTriangle,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<IContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'text'>('analysis');

  useEffect(() => {
    if (id) loadContract(parseInt(id, 10));
  }, [id]);

  const loadContract = async (contractId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getContract(contractId);
      setContract(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!contract) return;
    try {
      setAnalyzing(true);
      setError(null);
      await api.analyzeContract(contract.id);
      await loadContract(contract.id);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!contract || !window.confirm('Are you sure you want to delete this contract?')) return;
    try {
      await api.deleteContract(contract.id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete contract');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading contract details..." />;
  }

  if (!contract) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Contract not found.</p>
        <Link to="/" className="text-teal-600 hover:underline font-medium">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const analysis = contract.analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          {contract.status !== 'analyzing' && !analyzing && (
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              {analysis ? 'Re-Analyze Contract' : 'Run AI Analysis'}
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Delete contract"
            className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Contract Title & Meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              {analysis && (
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {analysis.contract_type}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Uploaded {new Date(contract.created_at).toLocaleDateString()}
              </span>
              {contract.filename && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {contract.filename}
                </span>
              )}
              {analysis?.analysis_duration_ms && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Analyzed in {(analysis.analysis_duration_ms / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'analysis'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          AI Analysis Breakdown
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'text'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Original Document Text
        </button>
      </div>

      {/* Analyzing state */}
      {analyzing && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <LoadingSpinner text="Analyzing contract with AI... This might take 10-30 seconds." size="lg" />
        </div>
      )}

      {/* Tab: Analysis */}
      {!analyzing && activeTab === 'analysis' && (
        <>
          {!analysis ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
              <div className="mx-auto h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No analysis yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Click below to extract clauses, score risks, and get actionable recommendations.
              </p>
              <button
                onClick={handleAnalyze}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Contract Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Executive Summary & Risk Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Gauge Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Overall Risk Rating
                  </h3>
                  <RiskGauge
                    score={analysis.overall_risk_score}
                    level={analysis.overall_risk_level}
                  />
                </div>

                {/* Summary Card */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Executive Summary
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100">
                    {analysis.parties && analysis.parties.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                          Identified Parties
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.parties.map((party, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium"
                            >
                              <Users className="h-3 w-3 text-gray-400" />
                              {party}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.key_dates && Object.keys(analysis.key_dates).length > 0 && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                          Key Dates
                        </span>
                        <div className="space-y-1">
                          {Object.entries(analysis.key_dates).map(([k, v]) => (
                            <div key={k} className="text-xs text-gray-600">
                              <span className="font-medium capitalize">
                                {k.replace(/_/g, ' ')}:
                              </span>{' '}
                              {String(v)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <SuggestionsList suggestions={analysis.suggestions} />

              {/* Clause Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Clause Breakdown ({analysis.clauses?.length || 0})
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      Sorted by appearance
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {analysis.clauses?.map((clause, idx) => (
                    <ClauseCard key={idx} clause={clause} index={idx} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Original Text */}
      {!analyzing && activeTab === 'text' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Document Text ({contract.content_text.length.toLocaleString()} characters)
            </h3>
          </div>
          <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 max-h-[600px] overflow-y-auto">
            {contract.content_text}
          </pre>
        </div>
      )}
    </div>
  );
};

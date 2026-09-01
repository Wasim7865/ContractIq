import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { FileUp, FileText, Sparkles, AlertCircle } from 'lucide-react';

const SAMPLES = [
  {
    title: 'Software Development Agreement',
    content: `SOFTWARE DEVELOPMENT AGREEMENT

This Agreement is entered into on January 15, 2025, between Acme Corp ("Client") and John Doe ("Developer").

1. SCOPE OF WORK
Developer agrees to build a mobile application according to the specifications in Exhibit A.

2. PAYMENT TERMS
Client shall pay Developer $15,000 upon completion. Payment is due within 60 days of invoice. Client reserves the right to withhold payment if deliverables do not meet Client's subjective satisfaction.

3. INTELLECTUAL PROPERTY
Developer hereby assigns all rights, title, and interest in all work product, inventions, and code created during the term of this Agreement to Client immediately upon creation, regardless of whether payment has been received.

4. NON-COMPETE
Developer agrees not to provide software development services to any entity in the technology sector worldwide for a period of 2 years following the termination of this Agreement.

5. LIABILITY & INDEMNIFICATION
Developer shall indemnify, defend, and hold harmless Client against any and all claims, damages, liabilities, and expenses arising from the work product. Developer's liability under this Agreement shall be unlimited.

6. TERMINATION
Client may terminate this Agreement at any time without cause upon 24 hours' notice. Developer may not terminate this Agreement prior to project completion.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.`,
  },
  {
    title: 'Standard Non-Disclosure Agreement (NDA)',
    content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made effective as of February 1, 2025, by and between Alpha Technologies Inc. and Beta Innovations LLC (each a "Party" and collectively the "Parties").

1. PURPOSE
The Parties wish to explore a potential business relationship regarding AI development.

2. CONFIDENTIAL INFORMATION
"Confidential Information" includes all technical, business, and financial information disclosed by one Party to the other, whether orally or in writing, marked as confidential or that reasonably should be understood to be confidential.

3. OBLIGATIONS
Each Party agrees to protect the other's Confidential Information with the same degree of care it uses for its own confidential information, but not less than reasonable care.

4. TERM & DURATION
This Agreement shall remain in effect for 2 years from the Effective Date. The confidentiality obligations shall survive for 3 years following termination.

5. REMEDIES
Both Parties acknowledge that a breach may cause irreparable harm for which monetary damages are inadequate, and agree that the non-breaching Party is entitled to seek injunctive relief.

6. GOVERNING LAW
Governed by the laws of the State of California.`,
  },
];

export const NewContract: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasteSample = (index: number) => {
    const sample = SAMPLES[index];
    setTitle(sample.title);
    setContent(sample.content);
    setActiveTab('text');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a contract title.');
      return;
    }

    try {
      setLoading(true);
      let contract;

      if (activeTab === 'text') {
        if (!content.trim()) {
          setError('Please paste the contract text.');
          setLoading(false);
          return;
        }
        contract = await api.uploadText({
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        if (!file) {
          setError('Please select a PDF file.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('file', file);
        contract = await api.uploadPdf(formData);
      }

      navigate(`/contracts/${contract.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload New Contract</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste text or upload a PDF to extract clauses and analyze legal risks.
        </p>
      </div>

      {/* Quick samples banner */}
      <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2 text-teal-800 text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          Try with sample contracts:
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePasteSample(idx)}
              className="text-xs bg-white text-teal-700 hover:bg-teal-100/50 border border-teal-300 font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              + {sample.title}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acme Corp Freelance Agreement"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Tab selection */}
        <div>
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Paste Plain Text
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'pdf'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileUp className="h-4 w-4" />
              Upload PDF
            </button>
          </div>

          {activeTab === 'text' ? (
            <div>
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the full text of your contract here..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                {content.length.toLocaleString()} characters
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-500 transition-colors">
              <input
                type="file"
                accept=".pdf"
                id="pdf-upload"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
                  }
                }}
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <FileUp className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {file ? file.name : 'Click to choose PDF file'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : 'PDF files up to 10MB'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            {loading ? 'Uploading...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

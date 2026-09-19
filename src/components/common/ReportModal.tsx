import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DatabaseService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'job' | 'user' | 'company' | 'message';
  targetId: string;
  targetTitleOrName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitleOrName,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<
    'fraud_scam' | 'misleading_salary' | 'harassment' | 'offensive_content' | 'discriminatory' | 'other'
  >('fraud_scam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setIsSubmitting(true);
    try {
      await DatabaseService.submitTrustReport({
        reporterId: user?.uid || 'anonymous_reporter',
        reporterEmail: user?.email || 'visitor@apollo.id',
        targetType,
        targetId,
        targetTitleOrName,
        reason,
        details: details.trim(),
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Trust & Safety Report</h3>
              <p className="text-xs text-slate-500">Report suspicious or non-compliant content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Report Submitted</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
              Thank you for keeping the Apollo ecosystem trustworthy. Our Trust & Safety team reviews all incident tickets within 24 hours.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setDetails('');
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Target: </span>
              <span className="capitalize">{targetType}</span> — <span className="font-medium text-slate-900">{targetTitleOrName}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="fraud_scam">Fraudulent Listing / Financial Scam / Phishing</option>
                <option value="misleading_salary">Misleading Compensation or Working Terms</option>
                <option value="harassment">Harassment / Unprofessional Conduct</option>
                <option value="offensive_content">Inappropriate / Offensive Content</option>
                <option value="discriminatory">Discriminatory Requirements (Race, Gender, Age)</option>
                <option value="other">Other Violation of Employment Guidelines</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Explanation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide specific context or links to assist our safety auditors..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !details.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium shadow-sm transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Confidential Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

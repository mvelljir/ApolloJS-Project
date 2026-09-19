import React, { useState } from 'react';
import { X, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { DatabaseService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { FileUpload } from './FileUpload';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile } = useAuth();
  const [targetType, setTargetType] = useState<'company' | 'professional' | 'certification'>(
    user?.role === 'employer' ? 'company' : 'professional'
  );
  const [targetName, setTargetName] = useState(
    user?.companyName || user?.displayName || ''
  );
  const [documentType, setDocumentType] = useState(
    user?.role === 'employer' ? 'Company Tax ID / NPWP / SIUP' : 'Government Identity / Professional ID'
  );
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<{ url: string; name: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await DatabaseService.submitVerificationRequest({
        applicantId: user.uid,
        applicantName: user.displayName,
        applicantRole: user.role,
        targetType,
        targetName,
        documentType,
        documentNumber,
        documentUrl: documentFile?.url,
        notes,
      });

      // Update user verification status to pending
      await updateProfile({ verificationStatus: 'pending' });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to submit verification request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Apollo Verification Center</h3>
              <p className="text-xs text-slate-500">Official accreditation and identity integrity review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Application Under Review</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
              Your verification dossier has been securely logged. Once approved by the compliance officer, your account will display the verified credential badge.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Verification Track
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('company');
                    setDocumentType('Company Tax ID / NPWP / SIUP');
                  }}
                  className={`p-3 rounded-xl text-left border transition-all text-xs ${
                    targetType === 'company'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-semibold">Employer / Corporate</p>
                  <p className="text-slate-500 mt-0.5">Validate registered corporate business entity</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('professional');
                    setDocumentType('Government ID / Professional License');
                  }}
                  className={`p-3 rounded-xl text-left border transition-all text-xs ${
                    targetType === 'professional'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-semibold">Individual Professional</p>
                  <p className="text-slate-500 mt-0.5">Validate identity & certified qualifications</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Entity / Full Legal Name
              </label>
              <input
                type="text"
                required
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. PT Apollo Nusantara or Alexander Wong"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Documentation Type
              </label>
              <input
                type="text"
                required
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Registration / Credential ID Number
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. NPWP 01.234.567.8-901.000 or Cert #8821"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Official Credential Scan/PDF Upload */}
            <FileUpload
              id="verification-doc-upload"
              label="Attach Official Credential / Registration Scan"
              subLabel="PDF, PNG, JPG up to 10MB • Certified documentation scan"
              accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
              value={documentFile?.url}
              fileName={documentFile?.name}
              onChange={(file) => setDocumentFile(file)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Supporting Reference Notes / Public Registry URL
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include link to Ministry of Law & Human Rights (AHU) registry or institutional credential verification URL..."
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
                disabled={isSubmitting || !targetName || !documentNumber}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium shadow-sm transition-all"
              >
                {isSubmitting ? 'Submitting Dossier...' : 'Submit for Accreditation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Send, Building2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { FileUpload } from '../common/FileUpload';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted?: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplicationSubmitted,
}) => {
  const { user } = useAuth();
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || user?.linkedinUrl || '');
  const [uploadedResume, setUploadedResume] = useState<{ url: string; name: string } | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [expectedSalary, setExpectedSalary] = useState<string>(job?.salaryMin ? String(job.salaryMin) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverNote.trim()) {
      setErrorMessage('Please include a brief note explaining your relevant background.');
      return;
    }

    const finalResume = uploadedResume?.url || resumeUrl.trim();
    if (!finalResume) {
      setErrorMessage('Please either upload your resume or provide a profile/resume link.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await DatabaseService.submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        jobLocation: job.location,
        jobWorkplaceType: job.workplaceType,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        employerId: job.employerId,
        applicantId: user?.uid || 'guest_applicant_' + Date.now(),
        applicantName: user?.displayName || 'Applicant',
        applicantEmail: user?.email || 'applicant@apollo.id',
        applicantHeadline: user?.headline || 'Professional Candidate',
        applicantPhoto: user?.photoURL,
        applicantLocation: user?.location || 'Indonesia',
        applicantSkills: user?.skills || job.requiredSkills.slice(0, 3),
        coverNote: coverNote.trim(),
        resumeUrl: finalResume,
        portfolioUrl: portfolioUrl.trim(),
        expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
      });

      setSubmitted(true);
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      setErrorMessage(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{job.title}</h3>
              <p className="text-xs text-slate-500">{job.companyName} • {job.location}</p>
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
          <div className="p-8 text-center my-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
              Your application has been safely transmitted to the hiring team at <span className="font-semibold text-slate-900">{job.companyName}</span>. You can track recruitment status in your dashboard.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setCoverNote('');
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Applicant identification banner */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Applying as: </span>
                <span className="font-bold text-slate-800">{user?.displayName || 'Alexander Wong'}</span>
                <span className="text-slate-500"> ({user?.email || 'applicant@apollo.id'})</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Seeker</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Brief Introduction / Why You're a Match <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Highlight 2-3 specific achievements or projects directly matching the job requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* File Upload for CV/Resume */}
            <FileUpload
              id="apply-resume-upload"
              label="Upload CV / Resume Document"
              subLabel="PDF, DOC, DOCX up to 10MB • Drag & drop or browse"
              value={uploadedResume?.url}
              fileName={uploadedResume?.name}
              onChange={(file) => setUploadedResume(file)}
            />

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">or provide direct link</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resume / LinkedIn Profile URL {!uploadedResume && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Portfolio / GitHub Link (Optional)
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/yourhandle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Expected Monthly Compensation ({job.currency})
              </label>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder={String(job.salaryMin)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !coverNote.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

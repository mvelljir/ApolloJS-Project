import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  Calendar,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Send,
  Share2,
  Flag,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Job } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { useAuth } from '../../context/AuthContext';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onOpenApply: (job: Job) => void;
  onOpenReport: (targetId: string, title: string) => void;
  onContactEmployer: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onOpenApply,
  onOpenReport,
  onContactEmployer,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Competitive Compensation';
    if (currency === 'IDR') {
      const minM = (min / 1000000).toFixed(0);
      const maxM = (max / 1000000).toFixed(0);
      return `Rp ${minM}M - ${maxM}M / month`;
    }
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / month`;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job Reference:</span>
            <span className="text-xs font-mono text-slate-700 font-semibold">{job.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Share job URL"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenReport(job.id, job.title)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {copied && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center">
              Job link copied to clipboard
            </div>
          )}

          {/* Job Overview & Company Intro */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-700">{job.companyName}</span>
                  <VerificationBadge status={job.companyVerificationStatus} size="sm" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{job.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{job.department} • Posted {new Date(job.postedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions for Header */}
            <div className="flex items-center gap-2 shrink-0 self-start">
              <button
                onClick={() => onToggleSave(job.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Job is saved' : 'Save this job'}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-5 h-5" />}
              </button>
              <button
                onClick={() => onOpenApply(job)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Apply Now
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Salary Range</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Workplace</span>
              </div>
              <p className="text-xs font-bold text-slate-900 capitalize">
                {job.workplaceType} ({job.location})
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Employment</span>
              </div>
              <p className="text-xs font-bold text-slate-900 capitalize">
                {job.employmentType} ({job.experienceLevel})
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Deadline</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Ongoing Review'}
              </p>
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Required Core Competencies</h4>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">Key Responsibilities</h4>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">Candidate Requirements</h4>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits & Perks */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2">Compensation & Perks</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-indigo-900">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Apollo verified job posting. Employers are prohibited from charging candidate fees.</span>
            </div>
          </div>
        </div>

        {/* Footer sticky CTAs */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            onClick={() => onContactEmployer(job)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Message Hiring Team</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onOpenApply(job)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Apply for this Position</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

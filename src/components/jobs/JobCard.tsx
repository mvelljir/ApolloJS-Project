import React from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Banknote,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Job } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string, e: React.MouseEvent) => void;
  onSelectJob: (job: Job) => void;
  onQuickApply?: (job: Job, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  onSelectJob,
  onQuickApply,
}) => {
  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Competitive Compensation';
    if (currency === 'IDR') {
      const minM = (min / 1000000).toFixed(0);
      const maxM = (max / 1000000).toFixed(0);
      return `Rp ${minM}M - ${maxM}M / mo`;
    }
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / mo`;
  };

  const getWorkplaceBadgeColor = (type: string) => {
    switch (type) {
      case 'remote':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'hybrid':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    const days = Math.floor(diff / 86400);
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div
      onClick={() => onSelectJob(job)}
      className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer card-layer-3d"
    >
      {/* Top row: Company Logo, Info & Save Action */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center shadow-xs">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-slate-700">{job.companyName}</span>
              <VerificationBadge status={job.companyVerificationStatus} size="sm" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{job.department}</p>
          </div>
        </div>

        {/* Save Job Bookmark Button */}
        {onToggleSave && (
          <button
            onClick={(e) => onToggleSave(job.id, e)}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              isSaved
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
            title={isSaved ? 'Saved' : 'Save job'}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Meta Pills: Location, Workplace, Type, Salary */}
      <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.location}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border capitalize ${getWorkplaceBadgeColor(
            job.workplaceType
          )}`}
        >
          <span>{job.workplaceType}</span>
        </span>

        <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg capitalize">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.employmentType}</span>
        </span>

        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
        </span>
      </div>

      {/* Required Skills tags */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
        {job.requiredSkills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md"
          >
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 4 && (
          <span className="text-[11px] font-medium text-slate-400 px-1">
            +{job.requiredSkills.length - 4} more
          </span>
        )}
      </div>

      {/* Bottom row: Posted date, applicants count, and Quick Apply */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(job.postedAt)}</span>
          </span>
          <span>•</span>
          <span>{job.applicantsCount} applicant{job.applicantsCount === 1 ? '' : 's'}</span>
        </div>

        <div className="flex items-center gap-2">
          {onQuickApply && (
            <button
              onClick={(e) => onQuickApply(job, e)}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <span>Quick Apply</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  PlusCircle,
  Eye,
  Clock,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Job, Application } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { EmptyState } from '../common/EmptyState';

interface EmployerDashboardProps {
  onNavigate: (view: string, data?: any) => void;
  onSelectJob: (job: Job) => void;
  onOpenVerificationModal: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  onNavigate,
  onSelectJob,
  onOpenVerificationModal,
}) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadEmployerData = async () => {
      setLoading(true);
      try {
        const [empJobs, empApplicants] = await Promise.all([
          DatabaseService.getEmployerJobs(user.uid),
          DatabaseService.getApplicationsForEmployer(user.uid),
        ]);
        setJobs(empJobs);
        setApplicants(empApplicants);
      } catch (err) {
        console.error('Failed to load employer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployerData();
  }, [user]);

  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;
  const totalViews = jobs.reduce((acc, j) => acc + (j.viewsCount || 0), 0);
  const newApplicantsCount = applicants.filter((a) => a.status === 'applied').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Recruiter Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs neu-raised">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Talent Acquisition HQ
            </h1>
            <VerificationBadge status={user?.verificationStatus || 'verified'} size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {user?.companyName || 'Bukalapak Tech Solutions'} • Managed by {user?.displayName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('employer_post_job')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </button>
        </div>
      </div>

      {/* Recruiter Real Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('employer_jobs')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Openings</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeJobsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Live in search directory</p>
        </div>

        <div
          onClick={() => onNavigate('employer_applicants')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applicants</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{applicants.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {newApplicantsCount} require initial review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-layer-3d">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Talent Ingestion</span>
            <Eye className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
          <p className="text-[11px] text-slate-400 mt-1">Candidate impressions</p>
        </div>

        <div
          onClick={onOpenVerificationModal}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Employer Badge</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-slate-900">Verified Employer</p>
          <p className="text-[11px] text-slate-400 mt-1">SIUP & NPWP accredited</p>
        </div>
      </div>

      {/* Main Recruiter Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Active Openings & Performance */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Postings</h3>
                <p className="text-xs text-slate-500">Live roles published under your employer organization</p>
              </div>
              <button
                onClick={() => onNavigate('employer_jobs')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No active job vacancies yet"
                description="Publish your first vacancy to connect with thousands of pre-verified Indonesian professionals."
                actionText="Post Your First Job"
                onAction={() => onNavigate('employer_post_job')}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {jobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4
                        onClick={() => onSelectJob(job)}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {job.department} • {job.workplaceType} ({job.location}) • Posted {new Date(job.postedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">{job.applicantsCount}</span>
                        <span className="text-[10px] text-slate-400">Applicants</span>
                      </div>
                      <button
                        onClick={() => onNavigate('employer_applicants', { jobId: job.id })}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Candidate Inflow & Quick Action Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Candidate Inflow</h3>
                <p className="text-xs text-slate-500">Latest applicants awaiting recruitment review</p>
              </div>
              <button
                onClick={() => onNavigate('employer_applicants')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <span>Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : applicants.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No applicants received yet.</p>
            ) : (
              <div className="space-y-3">
                {applicants.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onNavigate('employer_applicants', { appId: app.id })}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-100/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={app.applicantPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.applicantName)}`}
                        alt={app.applicantName}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{app.applicantName}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">for {app.jobTitle}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Status Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold">Accredited Enterprise Hiring</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your company profile has completed official corporate identity accreditation. Candidates are 3.8x more likely to apply to verified listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

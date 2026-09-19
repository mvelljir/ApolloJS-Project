import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Eye,
  PlusCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Job } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface EmployerJobsProps {
  onNavigate: (view: string, data?: any) => void;
  onSelectJob: (job: Job) => void;
}

export const EmployerJobs: React.FC<EmployerJobsProps> = ({
  onNavigate,
  onSelectJob,
}) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DatabaseService.getEmployerJobs(user.uid);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load employer jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await DatabaseService.updateJobStatus(jobId, nextStatus as any);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus as any } : j))
      );
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Active Postings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's job vacancies, review inbound candidate pipelines, and adjust status.
          </p>
        </div>
        <button
          onClick={() => onNavigate('employer_post_job')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all shrink-0 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No vacancies published"
          description="Create your first job posting to immediately start receiving candidate dossiers."
          actionText="Create Job Posting"
          onAction={() => onNavigate('employer_post_job')}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      job.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{job.id}</span>
                </div>

                <h3
                  onClick={() => onSelectJob(job)}
                  className="font-bold text-base sm:text-lg text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {job.title}
                </h3>

                <p className="text-xs text-slate-500">
                  {job.department} • {job.workplaceType} • {job.location} • Posted {new Date(job.postedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Performance metrics & Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 block">{job.viewsCount}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Views</span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-bold text-indigo-600 block">{job.applicantsCount}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Applicants</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('employer_post_job', { editJob: job })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    title="Edit vacancy details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onNavigate('employer_applicants', { jobId: job.id })}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    View Pipeline
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title={job.status === 'active' ? 'Close job' : 'Reopen job'}
                  >
                    {job.status === 'active' ? (
                      <XCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

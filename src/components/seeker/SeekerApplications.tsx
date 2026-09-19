import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  Ban,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Application, ApplicationStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface SeekerApplicationsProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenChat: (employerId: string, employerName: string, jobTitle: string) => void;
}

export const SeekerApplications: React.FC<SeekerApplicationsProps> = ({
  onNavigate,
  onOpenChat,
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'interview' | 'offer' | 'closed'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DatabaseService.getApplicationsForUser(user.uid);
      setApplications(data);
      if (data.length > 0 && !selectedApp) {
        setSelectedApp(data[0]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you wish to withdraw this application? The hiring manager will be notified.')) return;
    try {
      await DatabaseService.updateApplicationStatus(appId, 'withdrawn', 'Candidate withdrew application.');
      await fetchApplications();
    } catch (err) {
      console.error('Failed to withdraw application:', err);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['applied', 'under_review', 'shortlisted'].includes(app.status);
    if (filter === 'interview') return app.status === 'interview';
    if (filter === 'offer') return app.status === 'offer';
    if (filter === 'closed') return ['rejected', 'withdrawn'].includes(app.status);
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Application Submitted</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Shortlisted</span>;
      case 'interview':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Interview Scheduled</span>;
      case 'offer':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Job Offer Received</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Not Selected</span>;
      case 'withdrawn':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">Withdrawn</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your candidacies, employer feedback, interview stages, and status changes in one place.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        {[
          { label: 'All Applications', value: 'all' },
          { label: 'Active Pipeline', value: 'active' },
          { label: 'Interviews', value: 'interview' },
          { label: 'Offers', value: 'offer' },
          { label: 'Archived / Closed', value: 'closed' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === t.value
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="You haven't applied to any roles yet"
          description="Explore verified listings and submit your application with a personalized note to get noticed by top hiring teams."
          actionText="Explore Open Jobs"
          onAction={() => onNavigate('search')}
        />
      ) : filteredApps.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          No applications match this filter tab.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications list (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedApp?.id === app.id
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">{app.companyName}</span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{app.jobTitle}</h3>
                    <p className="text-xs text-slate-400">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Application Detail Timeline (7 cols) */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">{selectedApp.companyName}</span>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedApp.jobTitle}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedApp.jobLocation} • {selectedApp.jobWorkplaceType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat(selectedApp.employerId, selectedApp.companyName, selectedApp.jobTitle)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span>Message Recruiter</span>
                    </button>
                    {!['withdrawn', 'rejected'].includes(selectedApp.status) && (
                      <button
                        onClick={() => handleWithdraw(selectedApp.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Withdraw Application"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Callout */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Current Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                  </div>
                  {selectedApp.expectedSalary && (
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Your Requested Salary:</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        Rp {selectedApp.expectedSalary.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Timeline History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Progress Timeline
                  </h4>
                  <div className="space-y-4 border-l-2 border-indigo-100 pl-4 ml-2">
                    {selectedApp.statusHistory.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 capitalize">
                            {step.status.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {new Date(step.changedAt).toLocaleString()}
                          </span>
                          {step.note && (
                            <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              {step.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cover Note Submitted */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Cover Note Submitted
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.coverNote}
                  </p>
                </div>

                {/* Submitted Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  {selectedApp.resumeUrl && (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Submitted Resume Dossier</span>
                    </a>
                  )}
                  {selectedApp.portfolioUrl && (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Portfolio Site</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select an application to view status history
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

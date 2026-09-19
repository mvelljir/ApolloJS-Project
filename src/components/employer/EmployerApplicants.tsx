import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Filter,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Application, ApplicationStatus, Job } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface EmployerApplicantsProps {
  initialJobId?: string;
  initialAppId?: string;
  onOpenChat: (seekerId: string, seekerName: string, jobTitle: string) => void;
}

export const EmployerApplicants: React.FC<EmployerApplicantsProps> = ({
  initialJobId,
  initialAppId,
  onOpenChat,
}) => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchApplicants = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [apps, empJobs] = await Promise.all([
        DatabaseService.getApplicationsForEmployer(user.uid),
        DatabaseService.getEmployerJobs(user.uid),
      ]);
      setApplicants(apps);
      setJobs(empJobs);

      if (initialAppId) {
        const found = apps.find((a) => a.id === initialAppId);
        if (found) setSelectedApp(found);
      } else if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [user]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    try {
      const note = statusNote.trim() || `Status updated to ${newStatus.replace('_', ' ')} by recruiter`;
      await DatabaseService.updateApplicationStatus(selectedApp.id, newStatus, note);
      
      // Update local states
      const updated = {
        ...selectedApp,
        status: newStatus,
        statusHistory: [
          ...selectedApp.statusHistory,
          { status: newStatus, changedAt: new Date().toISOString(), note },
        ],
      };
      setSelectedApp(updated);
      setApplicants((prev) => prev.map((a) => (a.id === selectedApp.id ? updated : a)));
      setStatusNote('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (selectedJobId !== 'all' && app.jobId !== selectedJobId) return false;
    if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Candidate Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review credentials, update candidate recruitment stages, and coordinate interviews directly.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter by Vacancy:</span>
        </div>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="all">All Vacancies ({jobs.length})</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        <span className="text-slate-300">|</span>

        <span className="text-xs font-semibold text-slate-600">Pipeline Stage:</span>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="all">All Stages</option>
          <option value="applied">Applied (New)</option>
          <option value="under_review">Under Review</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>

        <span className="ml-auto text-xs text-slate-500 font-semibold">
          {filteredApplicants.length} candidate{filteredApplicants.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates in pipeline"
          description="Candidates who apply to your posted jobs will appear here for review, evaluation, and interviewing."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Candidates List Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredApplicants.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedApp?.id === app.id
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={app.applicantPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.applicantName)}`}
                    alt={app.applicantName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{app.applicantName}</h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 font-medium truncate mt-0.5">{app.jobTitle}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Candidate Dossier Detail (7 cols) */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedApp.applicantPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedApp.applicantName)}`}
                      alt={selectedApp.applicantName}
                      className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{selectedApp.applicantName}</h2>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified Candidate
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">{selectedApp.applicantHeadline}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedApp.applicantEmail} • {selectedApp.applicantLocation}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenChat(selectedApp.applicantId, selectedApp.applicantName, selectedApp.jobTitle)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all shrink-0 self-start"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Direct Chat</span>
                  </button>
                </div>

                {/* Applied For & Requested Compensation */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500">Target Role:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedApp.jobTitle}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Expected Monthly Salary:</span>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      {selectedApp.expectedSalary
                        ? `Rp ${selectedApp.expectedSalary.toLocaleString()}`
                        : 'Open to negotiation'}
                    </p>
                  </div>
                </div>

                {/* Candidate Pitch / Cover Note */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Applicant Introduction & Pitch
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.coverNote}
                  </p>
                </div>

                {/* Skills tags */}
                {selectedApp.applicantSkills && selectedApp.applicantSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Reported Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.applicantSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  {selectedApp.resumeUrl && (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Review Candidate Resume</span>
                    </a>
                  )}
                  {selectedApp.portfolioUrl && (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Candidate Portfolio Site</span>
                    </a>
                  )}
                </div>

                {/* Stage Progression Action Panel */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Advance Recruitment Stage
                  </h4>

                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional feedback or instruction note for candidate..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleStatusChange('under_review')}
                      disabled={isUpdatingStatus || selectedApp.status === 'under_review'}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleStatusChange('shortlisted')}
                      disabled={isUpdatingStatus || selectedApp.status === 'shortlisted'}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusChange('interview')}
                      disabled={isUpdatingStatus || selectedApp.status === 'interview'}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 disabled:opacity-50"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => handleStatusChange('offer')}
                      disabled={isUpdatingStatus || selectedApp.status === 'offer'}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Make Offer
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={isUpdatingStatus || selectedApp.status === 'rejected'}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select a candidate to review their application details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

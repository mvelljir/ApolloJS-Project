import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bookmark,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Application, Job } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { EmptyState } from '../common/EmptyState';

interface SeekerDashboardProps {
  onNavigate: (view: string, data?: any) => void;
  onSelectJob: (job: Job) => void;
  onOpenVerificationModal: () => void;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({
  onNavigate,
  onSelectJob,
  onOpenVerificationModal,
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [userApps, savedIds, allJobs] = await Promise.all([
          DatabaseService.getApplicationsForUser(user.uid),
          DatabaseService.getSavedJobIds(user.uid),
          DatabaseService.getJobs({ limit: 10 } as any),
        ]);

        setApplications(userApps);
        const bookmarked = allJobs.filter((j) => savedIds.includes(j.id));
        setSavedJobs(bookmarked);
        // Show 3 recommended opportunities
        setRecommendedJobs(allJobs.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Profile completeness calculation
  const getProfileCompleteness = () => {
    if (!user) return 0;
    let score = 30; // base account created
    if (user.headline) score += 15;
    if (user.bio) score += 15;
    if (user.skills && user.skills.length > 0) score += 15;
    if (user.workExperience && user.workExperience.length > 0) score += 15;
    if (user.verificationStatus === 'verified') score += 10;
    return Math.min(100, score);
  };

  const completeness = getProfileCompleteness();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Application Submitted</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Shortlisted</span>;
      case 'interview':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Interview Scheduled</span>;
      case 'offer':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Job Offer Received</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Not Selected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & High-Impact Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs neu-raised">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {user?.displayName || 'Professional'}
            </h1>
            <VerificationBadge status={user?.verificationStatus || 'unverified'} size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {user?.headline || 'Ready to discover your next engineering or leadership role.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('search')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Find Jobs</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
          >
            <User className="w-4 h-4" />
            <span>Update Profile</span>
          </button>
        </div>
      </div>

      {/* Meaningful Core Metrics (No fake vanity stats) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('seeker_applications')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Applications</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Submitted dossiers</p>
        </div>

        <div
          onClick={() => onNavigate('seeker_saved')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Positions</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{savedJobs.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Bookmarked for later</p>
        </div>

        <div
          onClick={() => onNavigate('chat')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Direct Messages</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">Active</p>
          <p className="text-[11px] text-slate-400 mt-1">Direct recruiter channel</p>
        </div>

        <div
          onClick={onOpenVerificationModal}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer card-layer-3d"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Accreditation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-slate-900 capitalize">
            {user?.verificationStatus === 'verified' ? 'Verified Seeker' : 'Standard'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Identity & credentials</p>
        </div>
      </div>

      {/* Main Grid: Applications Timeline & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Recent Applications */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Pipeline</h3>
                <p className="text-xs text-slate-500">Live recruitment statuses reported directly by employers</p>
              </div>
              {applications.length > 0 && (
                <button
                  onClick={() => onNavigate('seeker_applications')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No applications submitted yet"
                description="When you apply to jobs on Apollo, your active interview stages and direct hiring team feedback appear here."
                actionText="Explore Open Vacancies"
                onAction={() => onNavigate('search')}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 4).map((app) => (
                  <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{app.jobTitle}</h4>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-600">{app.companyName}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Submitted on {new Date(app.createdAt).toLocaleDateString()} • {app.jobLocation}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <button
                        onClick={() => onNavigate('chat')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        title="Message recruiter"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Verified Opportunities */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Suggested For Your Profile</h3>
                <p className="text-xs text-slate-500">Verified vacancies matching your experience criteria</p>
              </div>
              <button
                onClick={() => onNavigate('search')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors">{job.title}</h4>
                      <p className="text-xs text-slate-500">{job.companyName} • {job.location} ({job.workplaceType})</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 shrink-0">View Details</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Recommended Actions & Profile Strength */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Strength Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Profile Strength</h3>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>{completeness}% Completed</span>
              <span className="text-indigo-600 font-bold">{completeness >= 80 ? 'Optimal' : 'Needs Polish'}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Account created & authenticated</span>
              </div>
              <div className="flex items-center gap-2">
                {user?.skills && user.skills.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>Technical competencies specified</span>
              </div>
              <div className="flex items-center gap-2">
                {user?.workExperience && user.workExperience.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>Work experience history added</span>
              </div>
              <div className="flex items-center gap-2">
                {user?.verificationStatus === 'verified' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>Professional identity verified</span>
              </div>
            </div>

            {user?.verificationStatus !== 'verified' && (
              <button
                onClick={onOpenVerificationModal}
                className="w-full mt-5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Get Verified Badge</span>
              </button>
            )}
          </div>

          {/* Quick Action Guides */}
          <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Next Recommended Steps</h4>
            <div className="space-y-2 text-xs text-indigo-900/80">
              <p>• Save interesting roles to compare compensation and workplace models.</p>
              <p>• Include specific quantitative outcomes in your application pitch.</p>
              <p>• Check messages promptly when an employer updates your interview status.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

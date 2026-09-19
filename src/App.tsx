/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseService } from './services/db';
import { Job, UserRole } from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { JobSearch } from './components/jobs/JobSearch';
import { JobDetailModal } from './components/jobs/JobDetailModal';
import { ApplyModal } from './components/jobs/ApplyModal';
import { SeekerDashboard } from './components/seeker/SeekerDashboard';
import { SeekerApplications } from './components/seeker/SeekerApplications';
import { SeekerSavedJobs } from './components/seeker/SeekerSavedJobs';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { EmployerJobs } from './components/employer/EmployerJobs';
import { EmployerApplicants } from './components/employer/EmployerApplicants';
import { EmployerPostJob } from './components/employer/EmployerPostJob';
import { ChatView } from './components/chat/ChatView';
import { ProfileView } from './components/profile/ProfileView';
import { CompanyDirectory } from './components/companies/CompanyDirectory';
import { AuthModal } from './components/auth/AuthModal';
import { VerificationModal } from './components/common/VerificationModal';
import { ReportModal } from './components/common/ReportModal';
import { AccessDenied } from './components/common/AccessDenied';

function MainApp() {
  const { user, role } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [navigationData, setNavigationData] = useState<any>(null);

  // Job and Modals State
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preferredRole, setPreferredRole] = useState<UserRole>('jobSeeker');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [jobForApply, setJobForApply] = useState<Job | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string }>({
    id: '',
    title: '',
  });

  // Chat Parameters
  const [chatParams, setChatParams] = useState<{
    recipientId?: string;
    recipientName?: string;
    jobTitle?: string;
  }>({});

  // Sync initial jobs and saved bookmarks
  useEffect(() => {
    DatabaseService.getJobs().then((jobs) => setFeaturedJobs(jobs));
  }, []);

  useEffect(() => {
    if (user) {
      DatabaseService.getSavedJobIds(user.uid).then((ids) => setSavedJobIds(ids));
      // Auto-route new sign-ins if on landing
      if (currentView === 'landing') {
        setCurrentView(role === 'employer' ? 'employer_dashboard' : 'seeker_dashboard');
      }
    } else {
      setSavedJobIds([]);
    }
  }, [user, role]);

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view);
    setNavigationData(data || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (prefRole: UserRole = 'jobSeeker') => {
    setPreferredRole(prefRole);
    setAuthModalOpen(true);
  };

  const handleToggleSave = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      handleOpenAuth('jobSeeker');
      return;
    }
    const isSaved = savedJobIds.includes(jobId);
    if (isSaved) {
      await DatabaseService.unsaveJob(user.uid, jobId);
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    } else {
      await DatabaseService.saveJob(user.uid, jobId);
      setSavedJobIds((prev) => [...prev, jobId]);
    }
  };

  const handleOpenApply = (job: Job) => {
    if (!user) {
      handleOpenAuth('jobSeeker');
      return;
    }
    setJobForApply(job);
    setApplyModalOpen(true);
  };

  const handleOpenReport = (targetId: string, title: string) => {
    setReportTarget({ id: targetId, title });
    setReportModalOpen(true);
  };

  const handleOpenChatWithUser = (
    recipientId: string,
    recipientName: string,
    jobTitle: string
  ) => {
    if (!user) {
      handleOpenAuth();
      return;
    }
    setChatParams({
      recipientId,
      recipientName,
      jobTitle,
    });
    setSelectedJob(null);
    setCurrentView('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Universal Sticky Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuthModal={handleOpenAuth}
        onOpenVerificationModal={() => setVerificationModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            featuredJobs={featuredJobs}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenVerificationModal={() => setVerificationModalOpen(true)}
          />
        )}

        {currentView === 'search' && (
          <JobSearch
            onSelectJob={(job) => setSelectedJob(job)}
            onQuickApply={handleOpenApply}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSave}
          />
        )}

        {currentView === 'seeker_dashboard' && (
          !user || role !== 'jobSeeker' ? (
            <AccessDenied
              requiredRole="jobSeeker"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <SeekerDashboard
              onNavigate={handleNavigate}
              onSelectJob={(job) => setSelectedJob(job)}
              onOpenVerificationModal={() => setVerificationModalOpen(true)}
            />
          )
        )}

        {currentView === 'seeker_applications' && (
          !user || role !== 'jobSeeker' ? (
            <AccessDenied
              requiredRole="jobSeeker"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <SeekerApplications
              onNavigate={handleNavigate}
              onOpenChat={(empId, empName, jTitle) =>
                handleOpenChatWithUser(empId, empName, jTitle)
              }
            />
          )
        )}

        {currentView === 'seeker_saved' && (
          !user || role !== 'jobSeeker' ? (
            <AccessDenied
              requiredRole="jobSeeker"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <SeekerSavedJobs
              onNavigate={handleNavigate}
              onSelectJob={(job) => setSelectedJob(job)}
              onQuickApply={handleOpenApply}
              savedJobIds={savedJobIds}
              onToggleSave={handleToggleSave}
            />
          )
        )}

        {currentView === 'employer_dashboard' && (
          !user || role !== 'employer' ? (
            <AccessDenied
              requiredRole="employer"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmployerDashboard
              onNavigate={handleNavigate}
              onSelectJob={(job) => setSelectedJob(job)}
              onOpenVerificationModal={() => setVerificationModalOpen(true)}
            />
          )
        )}

        {currentView === 'employer_jobs' && (
          !user || role !== 'employer' ? (
            <AccessDenied
              requiredRole="employer"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmployerJobs
              onNavigate={handleNavigate}
              onSelectJob={(job) => setSelectedJob(job)}
            />
          )
        )}

        {currentView === 'employer_post_job' && (
          !user || role !== 'employer' ? (
            <AccessDenied
              requiredRole="employer"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmployerPostJob
              jobToEdit={navigationData?.editJob}
              onJobCreated={() => {
                DatabaseService.getJobs().then((jobs) => setFeaturedJobs(jobs));
                handleNavigate('employer_jobs');
              }}
              onCancel={() => handleNavigate('employer_dashboard')}
            />
          )
        )}

        {currentView === 'employer_applicants' && (
          !user || role !== 'employer' ? (
            <AccessDenied
              requiredRole="employer"
              currentRole={role}
              isAuthenticated={!!user}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmployerApplicants
              initialJobId={navigationData?.jobId}
              initialAppId={navigationData?.appId}
              onOpenChat={(seekerId, seekerName, jTitle) =>
                handleOpenChatWithUser(seekerId, seekerName, jTitle)
              }
            />
          )
        )}

        {currentView === 'chat' && (
          !user ? (
            <AccessDenied
              isAuthenticated={false}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <ChatView
              initialRecipientId={chatParams.recipientId}
              initialRecipientName={chatParams.recipientName}
              initialJobTitle={chatParams.jobTitle}
              onOpenReport={handleOpenReport}
            />
          )
        )}

        {currentView === 'profile' && (
          !user ? (
            <AccessDenied
              isAuthenticated={false}
              onOpenAuthModal={handleOpenAuth}
              onNavigate={handleNavigate}
            />
          ) : (
            <ProfileView
              onOpenVerificationModal={() => setVerificationModalOpen(true)}
            />
          )
        )}

        {currentView === 'companies' && (
          <CompanyDirectory
            onSelectCompanyJobs={(companyName) => {
              handleNavigate('search');
            }}
            onOpenVerificationModal={() => setVerificationModalOpen(true)}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenVerificationModal={() => setVerificationModalOpen(true)}
      />

      {/* Global Modals */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleSave={(id) => handleToggleSave(id)}
        onOpenApply={(job) => {
          setSelectedJob(null);
          handleOpenApply(job);
        }}
        onOpenReport={handleOpenReport}
        onContactEmployer={(job) => {
          handleOpenChatWithUser(job.employerId, job.companyName, job.title);
        }}
      />

      <ApplyModal
        job={jobForApply}
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setJobForApply(null);
        }}
        onApplicationSubmitted={() => {
          DatabaseService.getJobs().then((jobs) => setFeaturedJobs(jobs));
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={preferredRole}
        onSuccess={() => {
          setCurrentView(
            preferredRole === 'employer' ? 'employer_dashboard' : 'seeker_dashboard'
          );
        }}
      />

      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onSuccess={() => {
          // Trigger updates
        }}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="job"
        targetId={reportTarget.id}
        targetTitleOrName={reportTarget.title}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

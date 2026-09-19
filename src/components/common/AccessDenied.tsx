import React from 'react';
import { ShieldAlert, LogIn, ArrowRight, RefreshCw, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AccessDeniedProps {
  requiredRole?: UserRole;
  currentRole?: UserRole | null;
  isAuthenticated: boolean;
  onOpenAuthModal: (preferredRole?: UserRole) => void;
  onNavigate: (view: string) => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  currentRole,
  isAuthenticated,
  onOpenAuthModal,
  onNavigate,
}) => {
  const { switchRole } = useAuth();

  const isRoleMismatch = isAuthenticated && requiredRole && currentRole !== requiredRole;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
        {isRoleMismatch
          ? `${requiredRole === 'employer' ? 'Recruiter' : 'Job Seeker'} Access Required`
          : 'Authentication Required'}
      </h2>

      <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
        {isRoleMismatch
          ? `This area contains secure management workflows restricted to verified ${
              requiredRole === 'employer' ? 'employers & talent partners' : 'job candidates'
            }. You are currently browsing with a ${
              currentRole === 'employer' ? 'Recruiter' : 'Job Seeker'
            } workspace.`
          : 'Please sign in or create an accredited Apollo profile to access your pipeline, messages, and confidential records.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {isRoleMismatch ? (
          <button
            onClick={() => switchRole(requiredRole!)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Switch to {requiredRole === 'employer' ? 'Recruiter' : 'Job Seeker'} Workspace</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuthModal(requiredRole)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Continue</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('search')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Explore Open Jobs</span>
        </button>
      </div>
    </div>
  );
};

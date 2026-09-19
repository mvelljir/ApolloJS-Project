import React, { useState } from 'react';
import { X, Briefcase, UserCheck, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'jobSeeker',
  onSuccess,
}) => {
  const { signInWithGoogle, isFirebaseConfigured } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle(selectedRole);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMessage(
        err.message || 'Unable to authenticate with Google. Please check popup permissions and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img
              src="https://cdn.phototourl.com/free/2026-09-19-5780a3ee-8ef0-482b-8d85-ff8616f60d28.png"
              alt="Apollo"
              className="h-7 w-7 object-contain"
            />
            <h3 className="font-bold text-slate-900 text-base">Sign in to Apollo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Job Seeker Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('jobSeeker')}
                className={`p-4 rounded-xl text-left border transition-all relative ${
                  selectedRole === 'jobSeeker'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 text-indigo-950'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 w-fit mb-2">
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="font-bold text-sm">Job Seeker</p>
                <p className="text-xs text-slate-500 mt-1 leading-tight">
                  Explore jobs, apply, & track status
                </p>
              </button>

              {/* Employer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('employer')}
                className={`p-4 rounded-xl text-left border transition-all relative ${
                  selectedRole === 'employer'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 text-indigo-950'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-100/80 text-blue-700 w-fit mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <p className="font-bold text-sm">Employer</p>
                <p className="text-xs text-slate-500 mt-1 leading-tight">
                  Post openings & review talent
                </p>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Button: Google Authentication */}
          <div className="pt-2">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting Google Account...' : `Continue with Google as ${selectedRole === 'employer' ? 'Recruiter' : 'Job Seeker'}`}</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by Firebase Authentication & OAuth 2.0</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

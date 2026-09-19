import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { VerificationStatus } from '../../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showDetails = true,
}) => {
  if (status === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
        }`}
        title="Verified by Apollo Trust & Safety Team"
      >
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
        <span>{label || 'Verified'}</span>
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
        title="Verification documentation currently under review"
      >
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>{label || 'Verification Pending'}</span>
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
        title="Verification was unsuccessful or required documents were missing"
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>{label || 'Verification Incomplete'}</span>
      </span>
    );
  }

  if (!showDetails) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-normal rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      title="Standard unverified account"
    >
      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
      <span>{label || 'Standard Profile'}</span>
    </span>
  );
};

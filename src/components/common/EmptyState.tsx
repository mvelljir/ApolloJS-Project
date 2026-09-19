import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  children?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-slate-200/90 bg-white/70 backdrop-blur-sm neu-raised max-w-xl mx-auto my-6">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">{description}</p>
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm active:scale-98"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all active:scale-98"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

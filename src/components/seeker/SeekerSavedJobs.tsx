import React, { useState, useEffect } from 'react';
import { Bookmark, Building2, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Job } from '../../types';
import { JobCard } from '../jobs/JobCard';
import { EmptyState } from '../common/EmptyState';

interface SeekerSavedJobsProps {
  onNavigate: (view: string) => void;
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
  savedJobIds: string[];
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
}

export const SeekerSavedJobs: React.FC<SeekerSavedJobsProps> = ({
  onNavigate,
  onSelectJob,
  onQuickApply,
  savedJobIds,
  onToggleSave,
}) => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      try {
        const allJobs = await DatabaseService.getJobs();
        const filtered = allJobs.filter((j) => savedJobIds.includes(j.id));
        setSavedJobs(filtered);
      } catch (err) {
        console.error('Failed to load saved jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [savedJobIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Saved Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review saved positions, track changes in compensation, and apply when you're ready.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved positions yet"
          description="Bookmark jobs while browsing search results to organize and compare opportunities before applying."
          actionText="Find Jobs to Save"
          onAction={() => onNavigate('search')}
        />
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={true}
              onToggleSave={onToggleSave}
              onSelectJob={onSelectJob}
              onQuickApply={(j, e) => {
                e.stopPropagation();
                onQuickApply(j);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

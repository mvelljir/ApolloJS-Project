import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  X,
  Building2,
  RefreshCw,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Job, WorkplaceType, EmploymentType, ExperienceLevel } from '../../types';
import { DatabaseService } from '../../services/db';
import { JobCard } from './JobCard';
import { EmptyState } from '../common/EmptyState';

interface JobSearchProps {
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
  savedJobIds: string[];
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({
  onSelectJob,
  onQuickApply,
  savedJobIds,
  onToggleSave,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Search filter states
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | 'all'>('all');
  const [employmentType, setEmploymentType] = useState<EmploymentType | 'all'>('all');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | 'all'>('all');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sort, setSort] = useState<'newest' | 'salary_high' | 'relevance'>('newest');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const results = await DatabaseService.getJobs({
        keyword,
        location,
        workplaceType,
        employmentType,
        experienceLevel,
        minSalary: minSalary > 0 ? minSalary : undefined,
        sort,
      });
      setJobs(results);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workplaceType, employmentType, experienceLevel, minSalary, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setWorkplaceType('all');
    setEmploymentType('all');
    setExperienceLevel('all');
    setMinSalary(0);
    setSort('newest');
  };

  const activeFiltersCount =
    (workplaceType !== 'all' ? 1 : 0) +
    (employmentType !== 'all' ? 1 : 0) +
    (experienceLevel !== 'all' ? 1 : 0) +
    (minSalary > 0 ? 1 : 0) +
    (location ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header Banner */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Explore Verified Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover vetted professional roles across top Indonesian & Southeast Asian tech enterprises.
        </p>
      </div>

      {/* Main Search Input Controls */}
      <form onSubmit={handleSearchSubmit} className="p-2 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm mb-6 neu-raised">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title, skills, or company..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-slate-50 transition-colors"
            />
          </div>

          {/* Location Input */}
          <div className="md:col-span-4 relative flex items-center border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, region, or 'Remote'..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-slate-50 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="md:col-span-3 flex items-center gap-2 pt-2 md:pt-0">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
            <button
              type="submit"
              className="flex-1 md:w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Find Jobs</span>
            </button>
          </div>
        </div>
      </form>

      {/* Main Layout: Sidebar Filters + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Left Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Refine Search</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Workplace Policy */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Workplace Model
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Models', value: 'all' },
                  { label: 'Remote', value: 'remote' },
                  { label: 'Hybrid', value: 'hybrid' },
                  { label: 'On-site', value: 'onsite' },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="workplaceType"
                      checked={workplaceType === item.value}
                      onChange={() => setWorkplaceType(item.value as any)}
                      className="text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Levels', value: 'all' },
                  { label: 'Entry Level / Graduate', value: 'entry' },
                  { label: 'Mid Level (2-4 yrs)', value: 'mid' },
                  { label: 'Senior (5+ yrs)', value: 'senior' },
                  { label: 'Staff / Lead', value: 'lead' },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="experienceLevel"
                      checked={experienceLevel === item.value}
                      onChange={() => setExperienceLevel(item.value as any)}
                      className="text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Employment Contract
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Types', value: 'all' },
                  { label: 'Full-time', value: 'full-time' },
                  { label: 'Contract', value: 'contract' },
                  { label: 'Part-time', value: 'part-time' },
                  { label: 'Internship', value: 'internship' },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="employmentType"
                      checked={employmentType === item.value}
                      onChange={() => setEmploymentType(item.value as any)}
                      className="text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Salary Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Min. Salary (IDR)
                </label>
                <span className="text-xs font-bold text-indigo-600">
                  {minSalary === 0 ? 'Any' : `Rp ${(minSalary / 1000000).toFixed(0)}M+`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000000"
                step="5000000"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Any</span>
                <span>Rp 25M</span>
                <span>Rp 50M+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search Results */}
        <div className="lg:col-span-9 space-y-4">
          {/* Results bar header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              {loading ? 'Searching opportunities...' : `${jobs.length} Verified Position${jobs.length === 1 ? '' : 's'} Found`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Highest Salary</option>
                <option value="relevance">Best Match</option>
              </select>
            </div>
          </div>

          {/* Job List items */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs found matching your criteria"
              description="Try adjusting your keywords, workplace model, or salary filters to uncover more opportunities."
              actionText="Reset All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="space-y-3.5">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
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
      </div>
    </div>
  );
};

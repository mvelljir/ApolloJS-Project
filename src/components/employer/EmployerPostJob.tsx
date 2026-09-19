import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  Banknote,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { WorkplaceType, EmploymentType, ExperienceLevel, Job } from '../../types';

interface EmployerPostJobProps {
  jobToEdit?: Job | null;
  onJobCreated: () => void;
  onCancel: () => void;
}

export const EmployerPostJob: React.FC<EmployerPostJobProps> = ({
  jobToEdit,
  onJobCreated,
  onCancel,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields - Pre-populated if editing
  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [department, setDepartment] = useState(jobToEdit?.department || 'Engineering');
  const [companyName, setCompanyName] = useState(jobToEdit?.companyName || user?.companyName || 'Apollo Partner Organization');
  const [location, setLocation] = useState(jobToEdit?.location || 'Jakarta, Indonesia');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(jobToEdit?.workplaceType || 'hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(jobToEdit?.employmentType || 'full-time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(jobToEdit?.experienceLevel || 'mid');
  const [currency, setCurrency] = useState(jobToEdit?.currency || 'IDR');
  const [salaryMin, setSalaryMin] = useState<string>(jobToEdit ? String(jobToEdit.salaryMin) : '20000000');
  const [salaryMax, setSalaryMax] = useState<string>(jobToEdit ? String(jobToEdit.salaryMax) : '35000000');
  const [workingHours, setWorkingHours] = useState(jobToEdit?.workingHours || 'Monday - Friday, 09:00 - 18:00 WIB (Flexible)');
  const [deadline, setDeadline] = useState(jobToEdit?.deadline || '2026-11-30');

  // Dynamic Lists
  const [skills, setSkills] = useState<string[]>(
    jobToEdit?.requiredSkills || ['TypeScript', 'React', 'Node.js', 'System Architecture']
  );
  const [skillInput, setSkillInput] = useState('');

  const [responsibilities, setResponsibilities] = useState<string[]>(
    jobToEdit?.responsibilities || [
      'Design and maintain scalable, resilient microservices handling high traffic workloads.',
      'Collaborate closely with cross-functional product, UX, and security teams.',
      'Conduct comprehensive code reviews and mentor junior engineering peers.',
    ]
  );
  const [respInput, setRespInput] = useState('');

  const [requirements, setRequirements] = useState<string[]>(
    jobToEdit?.requirements || [
      'Minimum 3+ years in professional modern web and backend development.',
      'Deep familiarity with relational and document databases.',
      'Proven track record delivering reliable cloud production applications.',
    ]
  );
  const [reqInput, setReqInput] = useState('');

  const [benefits, setBenefits] = useState<string[]>(
    jobToEdit?.benefits || [
      'Comprehensive BPJS & Private International Medical Coverage',
      'Annual learning and conference allowance',
      'Generous home office equipment stipend',
    ]
  );
  const [benInput, setBenInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleAddResp = () => {
    if (respInput.trim()) {
      setResponsibilities([...responsibilities, respInput.trim()]);
      setRespInput('');
    }
  };

  const handleAddReq = () => {
    if (reqInput.trim()) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleAddBenefit = () => {
    if (benInput.trim()) {
      setBenefits([...benefits, benInput.trim()]);
      setBenInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a job title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (jobToEdit) {
        // Update existing job
        await DatabaseService.updateJob(jobToEdit.id, {
          title: title.trim(),
          department: department.trim(),
          companyName: companyName.trim(),
          location: location.trim(),
          workplaceType,
          employmentType,
          experienceLevel,
          salaryMin: Number(salaryMin) || 0,
          salaryMax: Number(salaryMax) || 0,
          currency,
          requiredSkills: skills,
          responsibilities,
          requirements,
          benefits,
          workingHours,
          deadline,
        });
      } else {
        // Create new job
        await DatabaseService.createJob({
          title: title.trim(),
          department: department.trim(),
          companyId: user?.companyId || 'comp_' + (user?.uid || 'custom'),
          companyName: companyName.trim(),
          companyLogo: user?.photoURL || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
          employerId: user?.uid || 'recruiter_emp_01',
          location: location.trim(),
          workplaceType,
          employmentType,
          experienceLevel,
          salaryMin: Number(salaryMin) || 0,
          salaryMax: Number(salaryMax) || 0,
          currency,
          salaryPeriod: 'monthly',
          status: 'active',
          requiredSkills: skills,
          responsibilities,
          requirements,
          benefits,
          workingHours,
          deadline,
          companyVerificationStatus: user?.verificationStatus || 'verified',
        });
      }

      onJobCreated();
    } catch (err: any) {
      console.error('Failed to submit job:', err);
      setErrorMessage(err.message || 'Failed to submit job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {jobToEdit ? 'Edit Vacancy Dossier' : 'Publish a Verified Job Opening'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {jobToEdit
            ? `Update requirements, compensation bands, or role specifications for ${jobToEdit.title}.`
            : 'Post an accredited vacancy to connect with vetted candidates. Apollo verified postings attract 3.8x higher qualified response rates.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        {/* Basic Role Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department / Business Unit <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Core Infrastructure / Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Company and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Entity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jakarta Capital Region, Indonesia"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Workplace, Contract, & Seniority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Workplace Model
            </label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contract Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="full-time">Full-Time</option>
              <option value="contract">Contract</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Staff / Lead</option>
            </select>
          </div>
        </div>

        {/* Salary Specification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none"
            >
              <option value="IDR">IDR (Indonesian Rupiah)</option>
              <option value="USD">USD ($)</option>
              <option value="SGD">SGD (S$)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Minimum Monthly Salary
            </label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="e.g. 20000000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Maximum Monthly Salary
            </label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="e.g. 35000000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Working Hours & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Working Hours / Schedule
            </label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="e.g. Mon-Fri 09:00 - 18:00 WIB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Required Technical Skills
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. PostgreSQL) and press Enter"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                  className="text-indigo-400 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Key Responsibilities
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddResp();
                }
              }}
              placeholder="Add responsibility bullet and press Enter"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddResp}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Add
            </button>
          </div>
          <ul className="space-y-1.5">
            {responsibilities.map((r, i) => (
              <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span>• {r}</span>
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-rose-600 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Candidate Qualifications
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddReq();
                }
              }}
              placeholder="Add qualification bullet and press Enter"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddReq}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Add
            </button>
          </div>
          <ul className="space-y-1.5">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span>• {r}</span>
                <button
                  type="button"
                  onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-rose-600 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Perks & Compensation Details
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={benInput}
              onChange={(e) => setBenInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBenefit();
                }
              }}
              placeholder="Add perk (e.g. Full BPJS health coverage) and press Enter"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddBenefit}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Add
            </button>
          </div>
          <ul className="space-y-1.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span>✓ {b}</span>
                <button
                  type="button"
                  onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-rose-600 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (jobToEdit ? 'Updating...' : 'Publishing...')
                : (jobToEdit ? 'Save Changes' : 'Publish Job Opening')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

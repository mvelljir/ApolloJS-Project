import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Building2,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Lock,
  MessageSquare,
  Users,
  Sparkles,
} from 'lucide-react';
import { Job, UserRole } from '../../types';
import { JobCard } from '../jobs/JobCard';

interface LandingPageProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenAuth: (preferredRole?: UserRole) => void;
  featuredJobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenVerificationModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAuth,
  featuredJobs,
  onSelectJob,
  onOpenVerificationModal,
}) => {
  const [quickKeyword, setQuickKeyword] = useState('');
  const [quickLocation, setQuickLocation] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search');
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-100 bg-linear-to-b from-white via-indigo-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Accreditation Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs animate-in fade-in slide-in-from-top-2 duration-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Indonesia's Verified Employment Infrastructure</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 font-display leading-[1.15]">
              Connecting Verified Talent with Accredited Enterprise Hiring
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Eliminate recruitment fraud and ghost listings. Apollo delivers transparent salary bands, real-time application pipelines, and certified corporate credentials.
            </p>

            {/* Hero Quick Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 shadow-lg neu-raised max-w-2xl mx-auto text-left"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={quickKeyword}
                    onChange={(e) => setQuickKeyword(e.target.value)}
                    placeholder="Role title, skills (e.g. React, Go, Product)..."
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="relative w-full sm:w-48 flex items-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
                  <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={quickLocation}
                    onChange={(e) => setQuickLocation(e.target.value)}
                    placeholder="Jakarta, Remote..."
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Fast Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Zero Fake Postings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transparent Compensation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct Recruiter Chat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Enterprise Employers Logo Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Vetted by Hiring Teams Across Leading Indonesian Tech Brands
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          {[
            { name: 'Bukalapak', desc: 'Enterprise E-Commerce' },
            { name: 'Traveloka', desc: 'Lifestyle Superapp' },
            { name: 'GoTo Group', desc: 'Ecosystem Leader' },
            { name: 'Blibli', desc: 'Omnichannel Commerce' },
            { name: 'Fintech ID', desc: 'Licensed Payment Gateway' },
            { name: 'Bank Jago', desc: 'Digital Banking' },
          ].map((c, i) => (
            <div
              key={i}
              onClick={() => onNavigate('companies')}
              className="p-3 text-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
            >
              <span className="font-bold text-sm text-slate-800 block">{c.name}</span>
              <span className="text-[10px] text-slate-400">{c.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Verified Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Verified Openings
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Latest High-Impact Career Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Directly posted by accredited human resources teams with audited compensation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
          >
            <span>View All Vacancies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredJobs.slice(0, 6).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelectJob={onSelectJob}
            />
          ))}
        </div>
      </section>

      {/* Pillars of Apollo Verification Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Trust & Safety Protocol
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold mt-2">
              How Apollo Solves the Employment Trust Deficit
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Traditional job portals are plagued by phantom listings, recruitment phishing, and unvetted candidates. Apollo enforces dual-sided identity validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Corporate Credential Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Employers must submit valid SIUP, NIB, and NPWP regulatory documentation before posting openings to prevent fee-charging scam operations.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Candidate Dossier Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Job seekers verify government identity and verified professional portfolios, ensuring employers interview genuine engineers and domain experts.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Encrypted Direct Channels</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Candidates communicate directly with verified corporate hiring managers inside Apollo, keeping personal contact details protected.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Learn about our regulatory compliance and reporting standards.
            </span>
            <button
              onClick={onOpenVerificationModal}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all"
            >
              Open Verification Portal
            </button>
          </div>
        </div>
      </section>

      {/* Dual CTA Conversion: Job Seeker vs Recruiter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seeker CTA */}
          <div className="p-8 rounded-3xl bg-linear-to-br from-indigo-50 to-white border border-indigo-100 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">For Professionals</span>
            <h3 className="text-2xl font-bold text-slate-900">Take Your Career to the Next Level</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore verified roles with real salary disclosure. Create your verified portfolio and connect directly with hiring managers.
            </p>
            <button
              onClick={() => onOpenAuth('jobSeeker')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Get Started as Job Seeker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Employer CTA */}
          <div className="p-8 rounded-3xl bg-linear-to-br from-slate-50 to-white border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">For Hiring Teams</span>
            <h3 className="text-2xl font-bold text-slate-900">Hire Verified Top-Tier Talent</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Publish openings, manage candidate pipelines, and coordinate technical interviews with pre-vetted Indonesian specialists.
            </p>
            <button
              onClick={() => onOpenAuth('employer')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Post Jobs as an Employer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

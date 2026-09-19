import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { VerificationBadge } from '../common/VerificationBadge';

interface CompanyDirectoryProps {
  onSelectCompanyJobs: (companyName: string) => void;
  onOpenVerificationModal: () => void;
}

interface CompanyItem {
  name: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  logo: string;
  openJobs: number;
  verificationStatus: 'verified';
  website: string;
}

const COMPANIES: CompanyItem[] = [
  {
    name: 'Bukalapak Tech Solutions',
    industry: 'E-Commerce & Digital Services',
    location: 'Jakarta Selatan, Indonesia',
    size: '1,000 - 5,000 employees',
    description: 'One of Southeast Asia’s premier technology companies empowering millions of MSMEs and digital consumers through inclusive commerce infrastructure.',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    openJobs: 3,
    verificationStatus: 'verified',
    website: 'https://bukalapak.com',
  },
  {
    name: 'Traveloka Southeast Asia',
    industry: 'Lifestyle & Travel Superapp',
    location: 'Tangerang, Banten, Indonesia',
    size: '1,000 - 5,000 employees',
    description: 'Leading Southeast Asian lifestyle superapp offering booking solutions for flights, accommodations, experiences, and consumer financial services.',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=80',
    openJobs: 2,
    verificationStatus: 'verified',
    website: 'https://traveloka.com',
  },
  {
    name: 'GoTo Digital Ecosystem',
    industry: 'On-Demand Mobility & FinTech',
    location: 'Jakarta Selatan, Indonesia',
    size: '5,000+ employees',
    description: 'The largest digital ecosystem in Indonesia combining on-demand services, payments, financial services, and digital marketplace.',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
    openJobs: 4,
    verificationStatus: 'verified',
    website: 'https://gotocompany.com',
  },
  {
    name: 'Blibli Global Digital Niaga',
    industry: 'Omnichannel Commerce',
    location: 'Jakarta Pusat, Indonesia',
    size: '1,000 - 5,000 employees',
    description: 'Pioneering Indonesian omnichannel commerce platform focusing on customer satisfaction, authentic goods, and seamless logistics.',
    logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    openJobs: 2,
    verificationStatus: 'verified',
    website: 'https://blibli.com',
  },
  {
    name: 'Bank Jago Technology',
    industry: 'Digital Banking & Financial Services',
    location: 'Jakarta Selatan, Indonesia',
    size: '500 - 1,000 employees',
    description: 'Tech-based bank dedicated to enhancing the growth of millions through digital financial solutions embedded into daily lifestyle apps.',
    logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
    openJobs: 3,
    verificationStatus: 'verified',
    website: 'https://jago.com',
  },
  {
    name: 'Nusantara Cloud Infrastructure',
    industry: 'Enterprise SaaS & Cloud',
    location: 'Bandung, Jawa Barat, Indonesia',
    size: '200 - 500 employees',
    description: 'High-availability sovereign data architecture and developer platform empowering Indonesian engineering teams.',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
    openJobs: 1,
    verificationStatus: 'verified',
    website: 'https://nusantara-cloud.id',
  },
];

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({
  onSelectCompanyJobs,
  onOpenVerificationModal,
}) => {
  const [search, setSearch] = useState('');

  const filteredCompanies = COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Accredited Corporate Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified enterprise employers operating with confirmed legal identity and audited salary commitments.
          </p>
        </div>

        <button
          onClick={onOpenVerificationModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors self-start"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Employer Accreditation Standards</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mb-8">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company name or industry..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((c) => (
          <div
            key={c.name}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between card-layer-3d"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center shadow-2xs">
                  <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                    <VerificationBadge status={c.verificationStatus} size="sm" />
                  </div>
                  <p className="text-xs text-indigo-700 font-medium mt-0.5">{c.industry}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {c.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.size}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {c.openJobs} Verified Position{c.openJobs === 1 ? '' : 's'}
              </span>
              <button
                onClick={() => onSelectCompanyJobs(c.name)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <span>View Jobs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

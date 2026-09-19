import React from 'react';
import { ShieldCheck, Mail, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenVerificationModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenVerificationModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.phototourl.com/free/2026-09-19-5780a3ee-8ef0-482b-8d85-ff8616f60d28.png"
                alt="Apollo"
                className="h-8 w-8 object-contain brightness-110"
              />
              <span className="text-xl font-bold tracking-tight text-white font-display">Apollo</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A modern professional ecosystem connecting verified job seekers and enterprise employers across Indonesia and Southeast Asia.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-fraud compliance verification</span>
            </div>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">For Job Seekers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">
                  Explore Verified Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('companies')} className="hover:text-white transition-colors">
                  Company Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seeker_applications')} className="hover:text-white transition-colors">
                  Track Application Status
                </button>
              </li>
              <li>
                <button onClick={onOpenVerificationModal} className="hover:text-white transition-colors">
                  Professional Identity Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">For Employers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('employer_post_job')} className="hover:text-white transition-colors">
                  Post a Verified Job
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('employer_dashboard')} className="hover:text-white transition-colors">
                  Candidate Pipeline Management
                </button>
              </li>
              <li>
                <button onClick={onOpenVerificationModal} className="hover:text-white transition-colors">
                  Corporate Credential Accreditation
                </button>
              </li>
              <li>
                <span className="text-slate-500">Applicant Tracking Architecture</span>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Trust, Safety & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Jakarta Capital Region, Indonesia</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>trust@apollo.id</span>
              </li>
              <li className="pt-2 text-slate-500">
                Data protected under strict attribute-based role access rules and encryption standards.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with mandatory copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Apollo Indonesia. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Employment Service</span>
            <span className="hover:text-slate-400 transition-colors">Security Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

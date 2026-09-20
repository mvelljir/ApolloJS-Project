import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  AlertTriangle,
  LifeBuoy,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Trash2,
  KeyRound,
  Eye,
  Send,
  ExternalLink,
  Lock,
  Sparkles,
  RefreshCw,
  FileText,
  BadgeAlert,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import {
  VerificationRequest,
  TrustReport,
  SupportTicket,
  StaffMember,
  StaffDivision,
  TicketStatus,
} from '../../types';

interface AdminPortalProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigate }) => {
  const { user, isSuperAdmin, adminDivision } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'verifications' | 'support' | 'reports' | 'staff'
  >('verifications');

  // Data states
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<TrustReport[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [verifFilter, setVerifFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [verifTypeFilter, setVerifTypeFilter] = useState<'all' | 'company' | 'professional' | 'certification'>('all');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [reportFilter, setReportFilter] = useState<'all' | 'received' | 'investigating' | 'resolved'>('all');

  // Selected for inspection modal
  const [selectedVerif, setSelectedVerif] = useState<VerificationRequest | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [processingVerif, setProcessingVerif] = useState(false);

  // Selected ticket for support thread
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [supportReplyText, setSupportReplyText] = useState('');
  const [sendingSupportReply, setSendingSupportReply] = useState(false);

  // Selected report for moderation
  const [selectedReport, setSelectedReport] = useState<TrustReport | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [processingReport, setProcessingReport] = useState(false);

  // New Staff Member Form (Master Admin only)
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffDivision, setNewStaffDivision] = useState<'staff' | 'moderator' | 'support'>('staff');
  const [newStaffRoleTitle, setNewStaffRoleTitle] = useState('');
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [verifData, reportData, ticketData, staffData] = await Promise.all([
        DatabaseService.getVerificationRequests(),
        DatabaseService.getTrustReports(),
        DatabaseService.getSupportTickets(),
        DatabaseService.getStaffMembers(),
      ]);
      setVerifications(verifData);
      setReports(reportData);
      setTickets(ticketData);
      setStaffList(staffData);

      // Keep selected ticket refreshed
      if (selectedTicket) {
        const refreshed = ticketData.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (err) {
      console.error('Failed to load admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Verifications ---
  const handleApproveVerification = async (req: VerificationRequest) => {
    setProcessingVerif(true);
    try {
      await DatabaseService.updateVerificationStatus(
        req.id,
        'approved',
        'Dokumen dan identitas telah diverifikasi resmi oleh Super Admin.',
        user?.displayName || 'Marvel Maximilian'
      );
      await loadAllAdminData();
      setSelectedVerif(null);
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setProcessingVerif(false);
    }
  };

  const handleRejectVerification = async (req: VerificationRequest) => {
    if (!rejectionFeedback.trim()) {
      alert('Mohon berikan alasan penolakan agar pemohon dapat memperbaiki dokumen.');
      return;
    }
    setProcessingVerif(true);
    try {
      await DatabaseService.updateVerificationStatus(
        req.id,
        'rejected',
        rejectionFeedback.trim(),
        user?.displayName || 'Marvel Maximilian'
      );
      await loadAllAdminData();
      setSelectedVerif(null);
      setRejectionFeedback('');
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setProcessingVerif(false);
    }
  };

  // --- Handlers for Support Tickets ---
  const handleSendSupportReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !supportReplyText.trim()) return;

    setSendingSupportReply(true);
    try {
      await DatabaseService.addTicketReply(selectedTicket.id, {
        senderId: user?.uid || 'staff_admin',
        senderName: `${user?.displayName || 'Tim Support'} (${isSuperAdmin ? 'Super Admin' : 'Customer Support'})`,
        senderRole: isSuperAdmin ? 'admin' : 'support',
        message: supportReplyText.trim(),
      });
      setSupportReplyText('');
      await loadAllAdminData();
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingSupportReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      await DatabaseService.updateTicketStatus(
        ticketId,
        status,
        user?.displayName || 'Support Agent',
        isSuperAdmin ? 'super_admin' : 'support'
      );
      await loadAllAdminData();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  // --- Handlers for Layanan Aduan (Reports) ---
  const handleResolveReport = async (
    reportId: string,
    action: 'warning_issued' | 'job_suspended' | 'user_suspended' | 'dismissed'
  ) => {
    setProcessingReport(true);
    try {
      await DatabaseService.updateTrustReportStatus(
        reportId,
        action === 'dismissed' ? 'dismissed' : 'resolved',
        moderatorNotes || 'Laporan telah diinvestigasi dan diselesaikan sesuai panduan platform.',
        action,
        user?.displayName || 'Website Moderator'
      );
      await loadAllAdminData();
      setSelectedReport(null);
      setModeratorNotes('');
    } catch (err) {
      console.error('Failed to resolve report:', err);
    } finally {
      setProcessingReport(false);
    }
  };

  // --- Handlers for Staff Management ---
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !newStaffPassword.trim() || !newStaffName.trim()) return;

    setCreatingStaff(true);
    try {
      const titles = {
        staff: 'Operations & Verification Staff',
        moderator: 'Website & Content Moderator',
        support: 'Customer Support Specialist',
      };

      await DatabaseService.createStaffMember({
        email: newStaffEmail.trim().toLowerCase(),
        passwordHash: newStaffPassword.trim(),
        displayName: newStaffName.trim(),
        division: newStaffDivision,
        roleTitle: newStaffRoleTitle.trim() || titles[newStaffDivision],
        status: 'active',
        createdBy: user?.email || 'marvelmaximilian@gmail.com',
      });

      setStaffSuccessMsg(`Staff ${newStaffName} (${newStaffEmail}) berhasil ditambahkan ke divisi ${newStaffDivision.toUpperCase()}!`);
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffName('');
      setNewStaffRoleTitle('');
      await loadAllAdminData();

      setTimeout(() => {
        setStaffSuccessMsg('');
        setShowAddStaffModal(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to create staff member:', err);
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun staff ini?')) {
      await DatabaseService.deleteStaffMember(staffId);
      await loadAllAdminData();
    }
  };

  const handleToggleStaffStatus = async (staff: StaffMember) => {
    const nextStatus = staff.status === 'active' ? 'inactive' : 'active';
    await DatabaseService.updateStaffMember(staff.id, { status: nextStatus });
    await loadAllAdminData();
  };

  // Filtered lists
  const filteredVerifications = verifications.filter((v) => {
    if (verifFilter !== 'all' && v.status !== verifFilter) return false;
    if (verifTypeFilter !== 'all' && v.targetType !== verifTypeFilter) return false;
    return true;
  });

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter !== 'all' && t.status !== ticketFilter) return false;
    return true;
  });

  const filteredReports = reports.filter((r) => {
    if (reportFilter !== 'all' && r.status !== reportFilter) return false;
    return true;
  });

  // Division permissions
  const canAccessVerifications = isSuperAdmin || adminDivision === 'staff';
  const canAccessSupport = isSuperAdmin || adminDivision === 'support';
  const canAccessModeration = isSuperAdmin || adminDivision === 'moderator';
  const canAccessStaffManagement = isSuperAdmin;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20 transition-colors duration-200">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Portal Eksekutif & Staf Apollo</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider">
                  {isSuperAdmin ? 'Master Super Admin' : `Divisi ${adminDivision?.toUpperCase()}`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pusat verifikasi perusahaan, layanan Customer Support, moderasi aduan, dan manajemen staf.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('search')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <span>Lihat Web Pengguna</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={loadAllAdminData}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {canAccessVerifications && (
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Verifikasi Akun & Perusahaan</span>
              {verifications.filter((v) => v.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  {verifications.filter((v) => v.status === 'pending').length}
                </span>
              )}
            </button>
          )}

          {canAccessSupport && (
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Customer Support & Tiket</span>
              {tickets.filter((t) => t.status === 'open').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {tickets.filter((t) => t.status === 'open').length}
                </span>
              )}
            </button>
          )}

          {canAccessModeration && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Layanan Aduan & Moderasi</span>
              {reports.filter((r) => r.status === 'received').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                  {reports.filter((r) => r.status === 'received').length}
                </span>
              )}
            </button>
          )}

          {canAccessStaffManagement && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen Staf & Divisi</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {staffList.length}
              </span>
            </button>
          )}
        </div>

        {/* TAB 1: VERIFIKASI AKUN & PERUSAHAAN */}
        {activeTab === 'verifications' && (
          <div className="mt-6 space-y-6">
            {/* Control bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setVerifFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      verifFilter === st
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'pending'
                      ? 'Menunggu Review'
                      : st === 'approved'
                      ? 'Disetujui'
                      : st === 'rejected'
                      ? 'Ditolak'
                      : 'Semua'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tipe Berkas:</span>
                <select
                  value={verifTypeFilter}
                  onChange={(e) => setVerifTypeFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">Semua Tipe Target</option>
                  <option value="company">Perusahaan (NIB / SIUP / NPWP)</option>
                  <option value="professional">Identitas Pelamar (KTP / Paspor)</option>
                  <option value="certification">Sertifikasi Keahlian</option>
                </select>
              </div>
            </div>

            {/* Verification Requests Grid */}
            {filteredVerifications.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tidak ada permohonan verifikasi pada filter ini
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Semua permohonan yang diajukan oleh pengguna atau perusahaan akan tampil di sini untuk ditinjau.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVerifications.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {req.status === 'pending'
                            ? 'Menunggu Review'
                            : req.status === 'approved'
                            ? 'Terverifikasi Resmi ✓'
                            : 'Ditolak'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(req.submittedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5">
                        {req.targetType === 'company' ? (
                          <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {req.targetName}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Pemohon: <strong>{req.applicantName}</strong> ({req.applicantRole === 'employer' ? 'Pemberi Kerja' : 'Pencari Kerja'})
                      </p>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-800 mb-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">Tipe Dokumen:</span> {req.documentType}
                        </div>
                        {req.documentNumber && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">Nomor ID/NIB:</span>{' '}
                            <code className="bg-white dark:bg-slate-700 px-1 py-0.5 rounded text-[11px] font-mono">
                              {req.documentNumber}
                            </code>
                          </div>
                        )}
                        {req.notes && (
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] italic mt-1">
                            "{req.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedVerif(req)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Tinjau Berkas</span>
                      </button>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApproveVerification(req)}
                            disabled={processingVerif}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOMER SUPPORT & TIKET */}
        {activeTab === 'support' && (
          <div className="mt-6 space-y-6">
            {/* Top stats & filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Tiket Masuk</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{tickets.length}</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-amber-500 font-semibold">Tiket Terbuka (Open)</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {tickets.filter((t) => t.status === 'open').length}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-emerald-500 font-semibold">Terselesaikan (Resolved)</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Tiket:</span>
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    ticketFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st === 'all'
                    ? 'Semua'
                    : st === 'open'
                    ? 'Terbuka'
                    : st === 'in_progress'
                    ? 'Diproses'
                    : 'Selesai'}
                </button>
              ))}
            </div>

            {/* Ticket Management Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Ticket List */}
              <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    Tidak ada tiket pada status ini.
                  </div>
                ) : (
                  filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedTicket?.id === t.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            t.status === 'open'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(t.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        Dari: <strong>{t.userName}</strong> ({t.userEmail})
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>Prioritas: <strong>{t.priority.toUpperCase()}</strong></span>
                        <span>{t.replies?.length || 1} pesan</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right Active Conversation / Details */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between min-h-[500px]">
                {selectedTicket ? (
                  <>
                    <div>
                      {/* Ticket Header */}
                      <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400">ID: #{selectedTicket.id}</span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                            {selectedTicket.subject}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>Pengguna: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail})</span>
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                          >
                            Tandai Proses
                          </button>
                          <button
                            onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                          >
                            Tandai Selesai ✓
                          </button>
                        </div>
                      </div>

                      {/* Reply thread */}
                      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                        {selectedTicket.replies?.map((rep) => {
                          const isSupport = rep.senderRole === 'support' || rep.senderRole === 'admin';
                          return (
                            <div
                              key={rep.id}
                              className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                                isSupport
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 ml-6'
                                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-6'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 text-[11px]">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {rep.senderName}
                                  {isSupport && (
                                    <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded-md font-semibold">
                                      Internal Staff
                                    </span>
                                  )}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {rep.message}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reply input */}
                    <form onSubmit={handleSendSupportReply} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis balasan resmi Customer Support kepada pengguna..."
                        value={supportReplyText}
                        onChange={(e) => setSupportReplyText(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={sendingSupportReply || !supportReplyText.trim()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Kirim Balasan</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="py-24 text-center text-xs text-slate-400">
                    Pilih salah satu tiket di sebelah kiri untuk melihat pesan dan membalas langsung.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LAYANAN ADUAN (TRUST, SAFETY & MODERASI) */}
        {activeTab === 'reports' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Pusat Moderasi & Layanan Aduan Pengguna
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Laporan fraud scam, gaji misleading, pelecehan, dan lowongan mencurigakan yang dilaporkan komunitas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['received', 'investigating', 'resolved', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      reportFilter === st
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {st === 'received'
                      ? 'Baru Masuk'
                      : st === 'investigating'
                      ? 'Investigasi'
                      : st === 'resolved'
                      ? 'Selesai'
                      : 'Semua'}
                  </button>
                ))}
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Semua aduan bersih! Tidak ada laporan mencurigakan.
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            rep.status === 'received'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : rep.status === 'investigating'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">
                          Alasan: {rep.reason.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">• {new Date(rep.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Target yang Dilaporkan: <span className="underline">{rep.targetTitleOrName}</span>
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                        "{rep.details}"
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Pelapor: {rep.reporterEmail} (ID: #{rep.reporterId})
                      </p>
                    </div>

                    {/* Moderator quick actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'job_suspended')}
                        disabled={processingReport}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Bekukan Lowongan/Akun</span>
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'warning_issued')}
                        disabled={processingReport}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kirim Peringatan Keras</span>
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        disabled={processingReport}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Tolak Aduan (Tidak Valid)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MANAJEMEN STAF & DIVISI (SUPER ADMIN ONLY) */}
        {activeTab === 'staff' && canAccessStaffManagement && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Direktori Staf & Divisi Resmi Apollo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Akun Master: <strong>marvelmaximilian@gmail.com</strong>. Anda memiliki otoritas penuh menambah staf baru dengan memasukkan email staf dan membuat password secara manual.
                </p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Staf / Admin Baru</span>
              </button>
            </div>

            {/* Division Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Divisi Staff</span>
                <p className="text-[11px] text-blue-900/80 dark:text-blue-400/80 mt-0.5">
                  Menangani verifikasi dokumen legalitas perusahaan dan sertifikasi pelamar.
                </p>
              </div>
              <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Divisi Website Moderator</span>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-400/80 mt-0.5">
                  Mengelola Layanan Aduan, menindak penipuan / misleading salary, dan pembekuan akun.
                </p>
              </div>
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Divisi Customer Support</span>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-400/80 mt-0.5">
                  Merespon tiket kendala pengguna, chat bantuan interaktif, dan resolusi masalah.
                </p>
              </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-4">Staf & Akun Email</th>
                      <th className="p-4">Divisi Kerja</th>
                      <th className="p-4">Jabatan / Role</th>
                      <th className="p-4">Password Akses</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {staffList.map((st) => {
                      const isMaster = st.email.includes('marvelmaximilian');
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                                {st.displayName[0]?.toUpperCase() || 'S'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {st.displayName}
                                  {isMaster && (
                                    <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded text-[9px]">
                                      FOUNDER
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{st.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                                st.division === 'staff'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : st.division === 'moderator'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {st.division === 'staff'
                                ? 'Staff'
                                : st.division === 'moderator'
                                ? 'Website Moderator'
                                : 'Customer Support'}
                            </span>
                          </td>

                          <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                            {st.roleTitle}
                          </td>

                          <td className="p-4">
                            <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                              {st.passwordHash ? '••••••••' : 'Sistem Google'}
                            </code>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                st.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {st.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            {!isMaster ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleStaffStatus(st)}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                  {st.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(st.id)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Staf"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Akun Utama</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Tambah Staf Baru (Input Email & Manual Buat Password) */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                Tambah Staf / Admin Baru
              </h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            {staffSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{staffSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Staf <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Hidayat"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Staf <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff.rian@apollo.id atau email staf gmail"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Buat Password Manual <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tentukan password login untuk staf ini..."
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Staf akan login menggunakan email dan password manual ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Divisi Penugasan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStaffDivision}
                  onChange={(e) => setNewStaffDivision(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="staff">Staff (Operasional & Verifikasi Berkas)</option>
                  <option value="moderator">Website Moderator (Moderasi Konten & Layanan Aduan)</option>
                  <option value="support">Customer Support (Layanan Tiket & Bantuan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Jabatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Verification Specialist"
                  value={newStaffRoleTitle}
                  onChange={(e) => setNewStaffRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingStaff || !newStaffEmail.trim() || !newStaffPassword.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan & Daftarkan Staf</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tinjau Berkas Verifikasi Detail */}
      {selectedVerif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Tinjauan Berkas Verifikasi Resmi
              </h3>
              <button
                onClick={() => setSelectedVerif(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Nama Entitas / Pemohon:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedVerif.targetName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tipe Verifikasi:</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">{selectedVerif.targetType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tipe Dokumen Legal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedVerif.documentType}</span>
              </div>
              {selectedVerif.documentNumber && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Nomor Registrasi / NIB / KTP:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedVerif.documentNumber}</span>
                </div>
              )}

              {selectedVerif.documentUrl && (
                <div className="mt-2">
                  <span className="text-slate-500 block mb-1">Lampiran Dokumen:</span>
                  <a
                    href={selectedVerif.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden group"
                  >
                    <img
                      src={selectedVerif.documentUrl}
                      alt="Bukti Dokumen"
                      className="w-full h-36 object-cover rounded-lg group-hover:scale-102 transition-transform"
                    />
                    <div className="mt-1 text-center text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center justify-center gap-1">
                      <span>Buka Dokumen Resolusi Penuh</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </a>
                </div>
              )}

              {/* Rejection reason input */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Catatan Reviewer / Alasan Penolakan (Jika Berkas Tidak Lengkap):
                </label>
                <textarea
                  rows={2}
                  placeholder="Tulis alasan jika menolak, contoh: Nomor NIB tidak terdaftar pada OSS atau foto KTP buram..."
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVerif(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={processingVerif}
                onClick={() => handleRejectVerification(selectedVerif)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tolak Berkas</span>
              </button>
              <button
                type="button"
                disabled={processingVerif}
                onClick={() => handleApproveVerification(selectedVerif)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Setujui & Beri Badge ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

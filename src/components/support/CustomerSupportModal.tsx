import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  X,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { SupportTicket, TicketCategory, TicketPriority } from '../../types';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal?: () => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenReportModal,
}) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'new_ticket' | 'my_tickets' | 'faq'>('new_ticket');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('general_inquiry');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserTickets();
    }
  }, [isOpen, user?.uid]);

  const loadUserTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const list = await DatabaseService.getUserSupportTickets(user.uid);
      setTickets(list);
      if (selectedTicket) {
        const refreshed = list.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const created = await DatabaseService.createSupportTicket({
        userId: user.uid,
        userName: user.displayName || 'Pengguna Apollo',
        userEmail: user.email || '',
        userRole: role || 'jobSeeker',
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
      });

      setSubmittedSuccess(true);
      setSubject('');
      setDescription('');
      await loadUserTickets();
      setSelectedTicket(created);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setActiveTab('my_tickets');
      }, 1500);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await DatabaseService.addTicketReply(selectedTicket.id, {
        senderId: user.uid,
        senderName: user.displayName || 'Saya',
        senderRole: 'user',
        message: replyText.trim(),
      });
      setReplyText('');
      await loadUserTickets();
    } catch (err) {
      console.error('Failed to add reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  if (!isOpen) return null;

  const categoryLabels: Record<TicketCategory, string> = {
    account_verification: 'Verifikasi Akun & Identitas',
    company_verification: 'Verifikasi Perusahaan & Legalitas',
    job_posting: 'Kendala Lowongan Pekerjaan',
    applicant_issue: 'Kendala Pelamar / Rekrutmen',
    technical_bug: 'Laporan Bug & Masalah Teknis',
    trust_safety_aduan: 'Layanan Aduan & Keamanan Platform',
    billing_subscription: 'Billing & Akun Enterprise',
    general_inquiry: 'Pertanyaan Umum',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Pusat Bantuan & Customer Support
                <span className="text-[11px] font-medium px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                  Apollo Support
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Layanan bantuan tiket, verifikasi, kendala teknis, dan aduan resmi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => {
              setActiveTab('new_ticket');
              setSelectedTicket(null);
            }}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'new_ticket'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Tiket Bantuan</span>
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'my_tickets'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tiket Saya</span>
            {tickets.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-bold">
                {tickets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('faq');
              setSelectedTicket(null);
            }}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ & Panduan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40 dark:bg-slate-900/40">
          {activeTab === 'new_ticket' && (
            <div>
              {submittedSuccess ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tiket Berhasil Dikirim!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                    Tim Customer Support Apollo telah menerima laporan Anda dan akan segera merespons.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4 max-w-2xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subjek Tiket / Judul Kendala <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bantuan verifikasi legalitas perusahaan Bukalapak..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kategori Layanan
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.entries(categoryLabels).map(([catKey, label]) => (
                          <option key={catKey} value={catKey}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tingkat Prioritas
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TicketPriority)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="low">Rendah (Pertanyaan santai)</option>
                        <option value="normal">Normal (Standar 1x24 jam)</option>
                        <option value="high">Tinggi (Mendesak / Proses Rekrutmen)</option>
                        <option value="urgent">Kritis (Akun Terkunci / Penipuan)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi Masalah / Pertanyaan Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Jelaskan secara rinci detail kendala yang dialami, sertakan tautan lowongan atau nama dokumen jika relevan..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-indigo-900 dark:text-indigo-300">
                      Customer Support Apollo siap melayani pada hari kerja (08:00 - 18:00 WIB). Anda dapat memantau balasan langsung di tab <strong>Tiket Saya</strong>.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !subject.trim() || !description.trim()}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Mengirim Tiket...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim ke Customer Support</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'my_tickets' && (
            <div className="space-y-4">
              {selectedTicket ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      ← Kembali ke Daftar Tiket
                    </button>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          selectedTicket.status === 'open'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : selectedTicket.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {selectedTicket.status === 'open'
                          ? 'Terbuka (Menunggu Review)'
                          : selectedTicket.status === 'in_progress'
                          ? 'Sedang Ditangani Support'
                          : 'Selesai (Resolved)'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Kategori: <strong>{categoryLabels[selectedTicket.category] || selectedTicket.category}</strong></span>
                      <span>•</span>
                      <span>Prioritas: <strong>{selectedTicket.priority.toUpperCase()}</strong></span>
                      <span>•</span>
                      <span>ID: #{selectedTicket.id.slice(-6)}</span>
                    </div>
                  </div>

                  {/* Reply Thread */}
                  <div className="mt-6 space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedTicket.replies?.map((rep) => {
                      const isMe = rep.senderRole === 'user';
                      return (
                        <div
                          key={rep.id}
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                            isMe
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 ml-6'
                              : 'bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {rep.senderName}
                              {!isMe && (
                                <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded-md font-semibold">
                                  Official Support
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

                  {/* Reply input */}
                  {selectedTicket.status !== 'closed' && (
                    <form onSubmit={handleSendReply} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik balasan atau informasi tambahan..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={sendingReply || !replyText.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Balas</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Riwayat Tiket ({tickets.length})
                    </span>
                    <button
                      onClick={loadUserTickets}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingTickets ? (
                    <div className="py-12 text-center text-xs text-slate-400">Memuat riwayat tiket...</div>
                  ) : tickets.length === 0 ? (
                    <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                      <LifeBuoy className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada tiket bantuan yang diajukan.</p>
                      <button
                        onClick={() => setActiveTab('new_ticket')}
                        className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Buat Tiket Bantuan Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="space-y-1 max-w-md">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  t.status === 'open'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    : t.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {t.status}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {categoryLabels[t.category] || t.category}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {t.subject}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {t.replies?.[t.replies.length - 1]?.message || t.description}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Bagaimana Proses Verifikasi Akun & Perusahaan Bekerja?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pencari kerja dapat mengajukan verifikasi KTP/Identitas dan sertifikasi. Perusahaan mengunggah NIB/SIUP/NPWP. Tim verifikasi resmi Apollo (Divisi Staff & Master Admin) akan memeriksa keabsahan berkas dalam waktu 1x24 jam kerja.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Bagaimana Cara Menggunakan Layanan Aduan Jika Menemukan Penipuan?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  Jika Anda menemukan lowongan yang meminta uang pendaftaran, gaji yang menyesatkan, atau perusahaan palsu, segera gunakan Layanan Aduan Apollo agar Tim Website Moderator menindak tegas dan membekukan postingan terkait.
                </p>
                {onOpenReportModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReportModal();
                    }}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    Buka Formulir Layanan Aduan Sekarang →
                  </button>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Berapa Lama Respon Customer Support?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tim Customer Support Apollo merespon tiket kategori Normal dalam 1-2 jam pada hari kerja, dan tiket kategori Prioritas Tinggi/Kritis dalam kurang dari 30 menit.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

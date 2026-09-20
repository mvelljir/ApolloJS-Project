import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  MessageSquare,
  Bell,
  Bookmark,
  FileText,
  User,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Users,
  Layers,
  LifeBuoy,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { ApolloNotification, UserRole } from '../../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuthModal: (preferredRole?: UserRole) => void;
  onOpenVerificationModal: () => void;
  onOpenSupportModal?: () => void;
  onOpenReportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuthModal,
  onOpenVerificationModal,
  onOpenSupportModal,
  onOpenReportModal,
}) => {
  const { user, role, isSuperAdmin, adminDivision, signOut, switchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApolloNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const unsubscribe = DatabaseService.subscribeToNotifications(user.uid, (items) => {
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const handleNotificationClick = async (notif: ApolloNotification) => {
    await DatabaseService.markNotificationRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotificationsOpen(false);
    if (notif.link) {
      if (notif.link.includes('applications')) {
        onNavigate(role === 'employer' ? 'employer_applicants' : 'seeker_applications');
      } else if (notif.link.includes('chat') || notif.link.includes('message')) {
        onNavigate('chat');
      }
    }
  };

  const hasStaffOrAdminAccess = isSuperAdmin || role === 'admin' || role === 'staff';

  return (
    <header className="sticky top-0 z-40 w-full glass-header bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => onNavigate(user ? (role === 'employer' ? 'employer_dashboard' : 'seeker_dashboard') : 'landing')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <img
                src="https://cdn.phototourl.com/free/2026-09-19-5780a3ee-8ef0-482b-8d85-ff8616f60d28.png"
                alt="Apollo Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">Apollo</span>
                  {user && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isSuperAdmin
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : role === 'employer'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                          : role === 'admin' || role === 'staff'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {isSuperAdmin
                        ? 'Super Admin'
                        : role === 'admin'
                        ? 'Admin'
                        : role === 'staff'
                        ? 'Staff'
                        : role === 'employer'
                        ? 'Recruiter'
                        : 'Seeker'}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Main Navigation">
              {/* Common Search for all */}
              <button
                onClick={() => onNavigate('search')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'search'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Eksplor Lowongan</span>
              </button>

              {user ? (
                role === 'jobSeeker' ? (
                  <>
                    <button
                      onClick={() => onNavigate('seeker_dashboard')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'seeker_dashboard'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => onNavigate('seeker_applications')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'seeker_applications'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Lamaran Saya</span>
                    </button>
                    <button
                      onClick={() => onNavigate('seeker_saved')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'seeker_saved'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Disimpan</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('employer_dashboard')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'employer_dashboard'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Overview Rekrutmen</span>
                    </button>
                    <button
                      onClick={() => onNavigate('employer_jobs')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'employer_jobs'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Lowongan Saya</span>
                    </button>
                    <button
                      onClick={() => onNavigate('employer_applicants')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'employer_applicants'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Pelamar</span>
                    </button>
                    <button
                      onClick={() => onNavigate('employer_post_job')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Pasang Loker</span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('companies')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      currentView === 'companies'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Perusahaan</span>
                  </button>
                  <button
                    onClick={onOpenVerificationModal}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Pusat Verifikasi</span>
                  </button>
                </>
              )}

              {/* Portal Eksekutif & Staf Apollo Link */}
              {hasStaffOrAdminAccess && (
                <button
                  onClick={() => onNavigate('admin_portal')}
                  className={`ml-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'admin_portal'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Portal Staf</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Customer Support Button (Opens Support Hub Modal) */}
            {onOpenSupportModal && (
              <button
                onClick={onOpenSupportModal}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Pusat Bantuan & Customer Support"
              >
                <LifeBuoy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden lg:inline">Support</span>
              </button>
            )}

            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {user ? (
              <>
                {/* Real-time Messaging Button */}
                <button
                  onClick={() => onNavigate('chat')}
                  className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    currentView === 'chat' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400' : ''
                  }`}
                  aria-label="Direct Messages"
                  title="Direct Messages"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Notifications"
                    title="Notifikasi"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Notifikasi</span>
                        <span className="text-[11px] text-slate-400">{notifications.length} total</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            Belum ada notifikasi baru
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 ${
                                !notif.read ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                              }`}
                            >
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 shrink-0 opacity-80" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.body}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile & Role Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                  >
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName)}`}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                        {user.displayName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Profile Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Role Switcher Button */}
                      <button
                        onClick={() => {
                          const nextRole = role === 'employer' ? 'jobSeeker' : 'employer';
                          switchRole(nextRole);
                          onNavigate(nextRole === 'employer' ? 'employer_dashboard' : 'seeker_dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors mb-1.5 flex items-center justify-between cursor-pointer"
                      >
                        <span>Ubah Tampilan ke {role === 'employer' ? 'Pelamar' : 'Recruiter'}</span>
                        <span className="text-[10px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">Switch</span>
                      </button>

                      {hasStaffOrAdminAccess && (
                        <button
                          onClick={() => {
                            onNavigate('admin_portal');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-2 mb-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Portal Eksekutif & Staf</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profil Saya</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenVerificationModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Pusat Verifikasi</span>
                      </button>

                      {onOpenSupportModal && (
                        <button
                          onClick={() => {
                            onOpenSupportModal();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LifeBuoy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Pusat Bantuan & Support</span>
                        </button>
                      )}

                      {onOpenReportModal && (
                        <button
                          onClick={() => {
                            onOpenReportModal();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Layanan Aduan Platform</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setProfileDropdownOpen(false);
                            onNavigate('landing');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar (Sign Out)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuthModal('jobSeeker')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuthModal('employer')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
                >
                  Untuk Perusahaan
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {hasStaffOrAdminAccess && (
            <button
              onClick={() => {
                onNavigate('admin_portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Portal Eksekutif & Staf Apollo</span>
            </button>
          )}

          <button
            onClick={() => {
              onNavigate('search');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Eksplor Lowongan</span>
          </button>

          {user ? (
            role === 'jobSeeker' ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('seeker_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Dashboard Pelamar</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('seeker_applications');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Lamaran Saya</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('seeker_saved');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Lowongan Disimpan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('employer_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Overview Rekrutmen</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('employer_jobs');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Lowongan Aktif</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('employer_applicants');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Review Pelamar</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('employer_post_job');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Pasang Lowongan Baru</span>
                </button>
              </>
            )
          ) : (
            <>
              <button
                onClick={() => {
                  onNavigate('companies');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Direktori Perusahaan</span>
              </button>
              <button
                onClick={() => {
                  onOpenVerificationModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pusat Verifikasi</span>
              </button>
            </>
          )}

          {onOpenSupportModal && (
            <button
              onClick={() => {
                onOpenSupportModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <LifeBuoy className="w-4 h-4 text-indigo-600" />
              <span>Pusat Bantuan & Customer Support</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Mode Tampilan:</span>
            <ThemeToggle compact />
          </div>
        </div>
      )}
    </header>
  );
};


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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { ApolloNotification, UserRole } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuthModal: (preferredRole?: UserRole) => void;
  onOpenVerificationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuthModal,
  onOpenVerificationModal,
}) => {
  const { user, role, signOut, switchRole } = useAuth();
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

  return (
    <header className="sticky top-0 z-40 w-full glass-header shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate(user ? (role === 'employer' ? 'employer_dashboard' : 'seeker_dashboard') : 'landing')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <img
                src="https://cdn.phototourl.com/free/2026-09-19-5780a3ee-8ef0-482b-8d85-ff8616f60d28.png"
                alt="Apollo Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Apollo</span>
                  {user && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        role === 'employer'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {role === 'employer' ? 'Recruiter' : 'Seeker'}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main Navigation">
              {/* Common Search for all */}
              <button
                onClick={() => onNavigate('search')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'search'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Explore Jobs</span>
              </button>

              {user ? (
                role === 'jobSeeker' ? (
                  <>
                    <button
                      onClick={() => onNavigate('seeker_dashboard')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentView === 'seeker_dashboard'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => onNavigate('seeker_applications')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentView === 'seeker_applications'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>My Applications</span>
                    </button>
                    <button
                      onClick={() => onNavigate('seeker_saved')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentView === 'seeker_saved'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Saved</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('employer_dashboard')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentView === 'employer_dashboard'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Hiring Overview</span>
                    </button>
                    <button
                      onClick={() => onNavigate('employer_jobs')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentView === 'employer_jobs'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Active Jobs</span>
                    </button>
                    <button
                      onClick={() => onNavigate('employer_applicants')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentView === 'employer_applicants'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Applicants</span>
                    </button>
                    <button
                      onClick={() => onNavigate('employer_post_job')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post Job</span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('companies')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      currentView === 'companies'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Companies</span>
                  </button>
                  <button
                    onClick={onOpenVerificationModal}
                    className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verification Center</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                {/* Real-time Messaging Button */}
                <button
                  onClick={() => onNavigate('chat')}
                  className={`relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                    currentView === 'chat' ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                  aria-label="Direct Messages"
                  title="Direct Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        <span className="text-xs text-slate-500">{notifications.length} total</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                                !notif.read ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 shrink-0 opacity-80" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
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
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName)}`}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                        {user.displayName}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">{role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Profile Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Role Switcher Button */}
                      <button
                        onClick={() => {
                          const nextRole = role === 'employer' ? 'jobSeeker' : 'employer';
                          switchRole(nextRole);
                          onNavigate(nextRole === 'employer' ? 'employer_dashboard' : 'seeker_dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-colors mb-1.5 flex items-center justify-between"
                      >
                        <span>Switch to {role === 'employer' ? 'Job Seeker' : 'Recruiter'} View</span>
                        <span className="text-[10px] bg-white text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-200">Switch</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile & Resume</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenVerificationModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Verification Center</span>
                      </button>

                      <div className="border-t border-slate-100 my-1 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setProfileDropdownOpen(false);
                            onNavigate('landing');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('jobSeeker')}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('employer')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
                >
                  For Employers
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => {
              onNavigate('search');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Explore Jobs</span>
          </button>

          {user ? (
            role === 'jobSeeker' ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('seeker_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Job Seeker Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('seeker_applications');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>My Applications</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('seeker_saved');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Saved Jobs</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('employer_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Recruiter Overview</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('employer_jobs');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Active Jobs</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('employer_applicants');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Review Applicants</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('employer_post_job');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a New Job</span>
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
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Companies</span>
              </button>
              <button
                onClick={() => {
                  onOpenVerificationModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification Center</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { ApolloUser, UserRole, StaffDivision } from '../types';
import { DatabaseService } from '../services/db';

interface AuthContextType {
  user: ApolloUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  isSuperAdmin: boolean;
  adminDivision?: StaffDivision;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: (preferredRole: UserRole) => Promise<void>;
  signInWithEmail: (email: string, password?: string, preferredRole?: UserRole) => Promise<void>;
  staffSignIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ApolloUser>) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  demoSignIn: (role: UserRole) => void;
  demoStaffSignIn: (division: StaffDivision) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'apollo_active_user_v1';

const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === 'marvelmaximilian@gmail.com' ||
    clean === 'marvelmaximilianos@gmail.com' ||
    clean.startsWith('marvelmaximilian') ||
    clean === 'admin@apollo.id'
  );
};

const getStaffDivisionForEmail = (email?: string | null): StaffDivision | null => {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  if (isSuperAdminEmail(clean)) return 'super_admin';
  if (clean.includes('moderator') || clean.includes('diana')) return 'moderator';
  if (clean.includes('support') || clean.includes('budi') || clean.includes('cs')) return 'support';
  if (clean.includes('staff') || clean.includes('andi')) return 'staff';
  return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApolloUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to ensure admin or staff privileges are assigned
  const enrichUserWithAdminPrivileges = (u: ApolloUser): ApolloUser => {
    if (isSuperAdminEmail(u.email)) {
      return {
        ...u,
        role: 'admin',
        isSuperAdmin: true,
        adminDivision: 'super_admin',
        verificationStatus: 'verified',
        verificationBadgeDetails: 'Executive Master Administrator',
      };
    }
    const staffDiv = getStaffDivisionForEmail(u.email);
    if (staffDiv) {
      return {
        ...u,
        role: 'staff',
        isSuperAdmin: false,
        adminDivision: staffDiv,
        verificationStatus: 'verified',
        verificationBadgeDetails: `Internal Apollo Staff — Divisi ${staffDiv.toUpperCase()}`,
      };
    }
    return u;
  };

  // Initialize from Firebase Auth or Local Session
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const profile = await DatabaseService.getUserProfile(fbUser.uid);
          if (profile) {
            const enriched = enrichUserWithAdminPrivileges(profile);
            setUser(enriched);
            localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(enriched));
          } else if (isSuperAdminEmail(fbUser.email)) {
            // Auto-provision Super Admin
            const now = new Date().toISOString();
            const superUser: ApolloUser = {
              uid: fbUser.uid,
              email: fbUser.email || 'marvelmaximilian@gmail.com',
              displayName: fbUser.displayName || 'Marvel Maximilian',
              role: 'admin',
              isSuperAdmin: true,
              adminDivision: 'super_admin',
              photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              headline: 'Platform Founder & Master Administrator',
              bio: 'Full executive privileges across verifications, moderation, and customer support.',
              skills: ['Executive Operations', 'Trust & Safety', 'Regulatory Compliance'],
              workExperience: [],
              education: [],
              certifications: [],
              verificationStatus: 'verified',
              verificationBadgeDetails: 'Executive Master Administrator',
              createdAt: now,
              updatedAt: now,
            };
            await DatabaseService.saveUserProfile(superUser);
            setUser(superUser);
            localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(superUser));
          }
        } else {
          // If logged out from Firebase, check local fallback session
          const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setUser(enrichUserWithAdminPrivileges(parsed));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
    } else {
      // Offline / Pre-config mode: restore cached user session if any
      const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(enrichUserWithAdminPrivileges(parsed));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (preferredRole: UserRole) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const cleanEmail = (fbUser.email || '').trim().toLowerCase();
        let profile = await DatabaseService.getUserProfile(fbUser.uid);

        const isAdminEmail = isSuperAdminEmail(cleanEmail);
        const staffDiv = getStaffDivisionForEmail(cleanEmail);

        let resolvedRole: UserRole = preferredRole;
        if (isAdminEmail) {
          resolvedRole = 'admin';
        } else if (staffDiv) {
          resolvedRole = 'staff';
        }

        if (!profile) {
          // Create initial user profile
          const now = new Date().toISOString();
          profile = {
            uid: fbUser.uid,
            email: cleanEmail,
            displayName: fbUser.displayName || (isAdminEmail ? 'Marvel Maximilian' : 'Professional'),
            role: resolvedRole,
            isSuperAdmin: isAdminEmail,
            adminDivision: isAdminEmail ? 'super_admin' : staffDiv || undefined,
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'User')}`,
            headline: isAdminEmail
              ? 'Platform Founder & Master Administrator'
              : staffDiv
              ? `Internal Apollo Staff (Divisi: ${staffDiv.toUpperCase()})`
              : preferredRole === 'employer'
              ? 'Talent Acquisition & Hiring Partner'
              : 'Software Professional & Explorer',
            bio: '',
            location: 'Jakarta, Indonesia',
            skills: isAdminEmail
              ? ['Executive Operations', 'Trust & Safety', 'Regulatory Compliance']
              : preferredRole === 'employer'
              ? ['Talent Acquisition', 'Recruiting', 'Executive Search']
              : ['TypeScript', 'React.js', 'System Architecture'],
            workExperience: [],
            education: [],
            certifications: [],
            verificationStatus: (isAdminEmail || staffDiv) ? 'verified' : 'unverified',
            verificationBadgeDetails: isAdminEmail
              ? 'Executive Master Administrator'
              : staffDiv
              ? `Internal Apollo Staff — Divisi ${staffDiv.toUpperCase()}`
              : undefined,
            createdAt: now,
            updatedAt: now,
          };
          await DatabaseService.saveUserProfile(profile);
        } else {
          profile = enrichUserWithAdminPrivileges(profile);
        }

        setUser(profile);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      } else {
        // Safe interactive fallback
        demoSignIn(preferredRole);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      demoSignIn(preferredRole);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password?: string, preferredRole: UserRole = 'jobSeeker') => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    try {
      // 1. Check if Super Admin Email
      if (isSuperAdminEmail(cleanEmail)) {
        const masterUser: ApolloUser = {
          uid: 'usr_master_marvel',
          email: cleanEmail,
          displayName: 'Marvel Maximilian',
          role: 'admin',
          isSuperAdmin: true,
          adminDivision: 'super_admin',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          headline: 'Platform Founder & Master Administrator',
          bio: 'Super Admin with full executive authority over verification, customer support, trust & safety moderation, and staff management.',
          location: 'Jakarta, Indonesia',
          skills: ['Executive Operations', 'Trust & Safety', 'Platform Management', 'Compliance'],
          workExperience: [],
          education: [],
          certifications: [],
          verificationStatus: 'verified',
          verificationBadgeDetails: 'Executive Master Administrator',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: now,
        };
        setUser(masterUser);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(masterUser));
        await DatabaseService.saveUserProfile(masterUser);
        return;
      }

      // 2. Check if Staff Member (from registered staff list or known staff emails)
      const staffList = await DatabaseService.getStaffMembers();
      const foundStaff = staffList.find((s) => s.email.toLowerCase() === cleanEmail);
      const staffDiv = foundStaff?.division || getStaffDivisionForEmail(cleanEmail);

      if (foundStaff || staffDiv) {
        const div = foundStaff ? foundStaff.division : staffDiv!;
        const displayName = foundStaff ? foundStaff.displayName : cleanEmail.split('@')[0];
        const staffUser: ApolloUser = {
          uid: foundStaff ? 'usr_' + foundStaff.id : 'usr_staff_' + Math.random().toString(36).substring(7),
          email: cleanEmail,
          displayName: displayName,
          role: 'staff',
          adminDivision: div,
          isSuperAdmin: false,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
          headline: `${foundStaff?.roleTitle || 'Internal Staff'} (Divisi: ${div.toUpperCase()})`,
          location: 'Jakarta, Indonesia',
          skills: ['Operations', 'Platform Review'],
          workExperience: [],
          education: [],
          certifications: [],
          verificationStatus: 'verified',
          verificationBadgeDetails: `Internal Apollo Staff — Divisi ${div.toUpperCase()}`,
          createdAt: foundStaff?.createdAt || now,
          updatedAt: now,
        };
        setUser(staffUser);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(staffUser));
        await DatabaseService.saveUserProfile(staffUser);
        return;
      }

      // 3. Regular Public User (Job Seeker or Employer)
      let profile = await DatabaseService.getUserProfile(cleanEmail);
      if (!profile) {
        const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');

        profile = {
          uid: 'usr_' + Math.random().toString(36).substring(2, 10),
          email: cleanEmail,
          displayName: formattedName || (preferredRole === 'employer' ? 'Hiring Partner' : 'Talent User'),
          role: preferredRole,
          isSuperAdmin: false,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName || 'User')}`,
          headline: preferredRole === 'employer' ? 'Talent Acquisition Partner' : 'Professional Talent',
          bio: '',
          location: 'Jakarta, Indonesia',
          skills: preferredRole === 'employer' ? ['Recruiting', 'Talent Search'] : ['Communication', 'Teamwork'],
          workExperience: [],
          education: [],
          certifications: [],
          verificationStatus: 'unverified',
          createdAt: now,
          updatedAt: now,
        };
        await DatabaseService.saveUserProfile(profile);
      }
      setUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const staffSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await DatabaseService.staffLogin(email, password);
      setUser(result.user);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(result.user));
    } finally {
      setLoading(false);
    }
  };

  const demoStaffSignIn = (division: StaffDivision) => {
    const now = new Date().toISOString();
    let staffUser: ApolloUser;

    if (division === 'super_admin') {
      staffUser = {
        uid: 'usr_master_marvel',
        email: 'marvelmaximilian@gmail.com',
        displayName: 'Marvel Maximilian',
        role: 'admin',
        isSuperAdmin: true,
        adminDivision: 'super_admin',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'Platform Founder & Master Administrator',
        bio: 'Super Admin with full executive authority over verification, customer support, trust & safety moderation, and staff management.',
        location: 'Jakarta, Indonesia',
        skills: ['Executive Operations', 'Trust & Safety', 'Platform Management', 'Compliance'],
        workExperience: [],
        education: [],
        certifications: [],
        verificationStatus: 'verified',
        verificationBadgeDetails: 'Executive Master Administrator',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: now,
      };
    } else if (division === 'moderator') {
      staffUser = {
        uid: 'usr_mod_diana',
        email: 'moderator.diana@apollo.id',
        displayName: 'Diana Safitri',
        role: 'staff',
        isSuperAdmin: false,
        adminDivision: 'moderator',
        photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        headline: 'Website & Content Moderator (Divisi: Moderator)',
        bio: 'Responsible for reviewing trust and safety reports, fraudulent postings, and user conduct.',
        location: 'Jakarta, Indonesia',
        skills: ['Trust & Safety', 'Fraud Detection', 'Content Moderation'],
        workExperience: [],
        education: [],
        certifications: [],
        verificationStatus: 'verified',
        verificationBadgeDetails: 'Internal Apollo Staff — Website Moderator',
        createdAt: '2024-02-15T09:30:00Z',
        updatedAt: now,
      };
    } else if (division === 'support') {
      staffUser = {
        uid: 'usr_cs_budi',
        email: 'support.budi@apollo.id',
        displayName: 'Budi Santoso',
        role: 'staff',
        isSuperAdmin: false,
        adminDivision: 'support',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'Senior Customer Support Specialist (Divisi: Customer Support)',
        bio: 'Resolving user tickets, applicant inquiries, and platform assistance.',
        location: 'Jakarta, Indonesia',
        skills: ['Customer Support', 'Help Desk', 'Issue Resolution', 'Ticket Triage'],
        workExperience: [],
        education: [],
        certifications: [],
        verificationStatus: 'verified',
        verificationBadgeDetails: 'Internal Apollo Staff — Customer Support',
        createdAt: '2024-02-20T10:00:00Z',
        updatedAt: now,
      };
    } else {
      // staff (general / verification)
      staffUser = {
        uid: 'usr_staff_andi',
        email: 'staff.andi@apollo.id',
        displayName: 'Andi Setiawan',
        role: 'staff',
        isSuperAdmin: false,
        adminDivision: 'staff',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        headline: 'Operations & Verification Officer (Divisi: Staff)',
        bio: 'Validating employer credentials, business licenses, and candidate certifications.',
        location: 'Jakarta, Indonesia',
        skills: ['Document Verification', 'Operations', 'Compliance Verification'],
        workExperience: [],
        education: [],
        certifications: [],
        verificationStatus: 'verified',
        verificationBadgeDetails: 'Internal Apollo Staff — Operations Staff',
        createdAt: '2024-02-10T08:00:00Z',
        updatedAt: now,
      };
    }

    setUser(staffUser);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(staffUser));
    DatabaseService.saveUserProfile(staffUser);
  };

  const demoSignIn = (role: UserRole) => {
    if (role === 'admin') {
      demoStaffSignIn('super_admin');
      return;
    }
    if (role === 'staff') {
      demoStaffSignIn('staff');
      return;
    }

    const isEmp = role === 'employer';
    const dummyUser: ApolloUser = {
      uid: isEmp ? 'usr_emp_sarah' : 'usr_dev_alex',
      email: isEmp ? 'sarah.pratama@bukalapak.tech' : 'alexander.wong@outlook.com',
      displayName: isEmp ? 'Sarah Pratama' : 'Alexander Wong',
      role,
      isSuperAdmin: false,
      photoURL: isEmp
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      headline: isEmp
        ? 'Senior Technical Recruiter & Engineering Hiring at Bukalapak Tech'
        : 'Senior Frontend Engineer | React, TypeScript & Scalable Systems',
      bio: isEmp
        ? 'Connecting world-class technical talent with high-impact engineering squads across Southeast Asia.'
        : 'Passionate frontend engineer with 5 years of experience crafting accessible, responsive web products.',
      location: 'Jakarta Selatan, Indonesia',
      phone: '+62 812-3456-7890',
      skills: isEmp
        ? ['Technical Recruitment', 'Engineering Hiring', 'Candidate Experience', 'Talent Pipeline']
        : ['TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'GraphQL', 'State Management'],
      workExperience: [
        {
          id: 'exp_1',
          company: isEmp ? 'Bukalapak' : 'Tokopedia Ecosystem',
          title: isEmp ? 'Senior Talent Partner' : 'Frontend Engineer',
          location: 'Jakarta Selatan',
          startDate: '2022-01',
          current: true,
          description: isEmp
            ? 'Leading tech hiring initiatives for core commerce and merchant engineering groups.'
            : 'Built accessible, high-performance checkout and payments flows for millions of shoppers.',
        },
      ],
      education: [
        {
          id: 'edu_1',
          school: 'University of Indonesia (Universitas Indonesia)',
          degree: 'Bachelor of Computer Science',
          field: 'Information Systems',
          startYear: '2016',
          endYear: '2020',
        },
      ],
      certifications: [
        {
          id: 'cert_1',
          name: 'Certified Professional Scrum Developer',
          issuingOrg: 'Scrum.org',
          credentialId: 'PSD-2023-8821',
          issueDate: '2023-04-10',
          verificationStatus: 'verified',
        },
      ],
      companyId: isEmp ? 'comp_bukalapak' : undefined,
      companyName: isEmp ? 'Bukalapak Tech Solutions' : undefined,
      companyRoleTitle: isEmp ? 'Head of Tech Talent Acquisition' : undefined,
      verificationStatus: 'verified',
      verificationBadgeDetails: isEmp ? 'Verified Enterprise Employer' : 'Verified Professional Identity',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    setUser(dummyUser);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(dummyUser));
    DatabaseService.saveUserProfile(dummyUser);
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn('Firebase signout error:', err);
      }
    }
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
  };

  const updateProfile = async (data: Partial<ApolloUser>) => {
    if (!user) return;
    const updated: ApolloUser = { ...user, ...data, updatedAt: new Date().toISOString() };
    const enriched = enrichUserWithAdminPrivileges(updated);
    setUser(enriched);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(enriched));
    await DatabaseService.saveUserProfile(enriched);
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) {
      demoSignIn(newRole);
      return;
    }
    if (isSuperAdminEmail(user.email)) {
      // Super admin can switch roles to inspect platform as jobSeeker, employer, or back to admin
      await updateProfile({ role: newRole });
      return;
    }
    await updateProfile({ role: newRole });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role: user ? user.role : null,
        isSuperAdmin: user?.isSuperAdmin ?? isSuperAdminEmail(user?.email),
        adminDivision: user?.adminDivision,
        loading,
        isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        staffSignIn,
        signOut,
        updateProfile,
        switchRole,
        demoSignIn,
        demoStaffSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

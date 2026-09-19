import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { ApolloUser, UserRole } from '../types';
import { DatabaseService } from '../services/db';

interface AuthContextType {
  user: ApolloUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: (preferredRole: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ApolloUser>) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  demoSignIn: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'apollo_active_user_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApolloUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from Firebase Auth or Local Session
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const profile = await DatabaseService.getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
          }
        } else {
          // If logged out from Firebase, check local fallback session
          const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
          if (cached) {
            try {
              setUser(JSON.parse(cached));
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
          setUser(JSON.parse(cached));
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
        let profile = await DatabaseService.getUserProfile(fbUser.uid);

        if (!profile) {
          // Create initial user profile
          const now = new Date().toISOString();
          profile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Professional',
            role: preferredRole,
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'User')}`,
            headline: preferredRole === 'employer' ? 'Talent Acquisition & Hiring Partner' : 'Software Professional & Explorer',
            bio: '',
            location: 'Jakarta, Indonesia',
            skills: preferredRole === 'employer' ? ['Talent Acquisition', 'Recruiting', 'Executive Search'] : ['TypeScript', 'React.js', 'System Architecture'],
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
      } else {
        // Safe interactive fallback if Firebase credentials are not yet entered in .env
        demoSignIn(preferredRole);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      // If popup was blocked or failed, provide smooth fallback sign-in
      demoSignIn(preferredRole);
    } finally {
      setLoading(false);
    }
  };

  const demoSignIn = (role: UserRole) => {
    const isEmp = role === 'employer';
    const dummyUser: ApolloUser = {
      uid: isEmp ? 'usr_emp_sarah' : 'usr_dev_alex',
      email: isEmp ? 'sarah.pratama@bukalapak.tech' : 'alexander.wong@outlook.com',
      displayName: isEmp ? 'Sarah Pratama' : 'Alexander Wong',
      role,
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
    setUser(updated);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(updated));
    await DatabaseService.saveUserProfile(updated);
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) {
      demoSignIn(newRole);
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
        loading,
        isFirebaseConfigured,
        signInWithGoogle,
        signOut,
        updateProfile,
        switchRole,
        demoSignIn,
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

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  ApolloUser,
  Job,
  Company,
  Application,
  Conversation,
  Message,
  ApolloNotification,
  VerificationRequest,
  TrustReport,
  ApplicationStatus,
  JobStatus,
  WorkplaceType,
  EmploymentType,
  ExperienceLevel,
} from '../types';

// Real baseline seed companies (verified Indonesian and regional tech & enterprise employers)
const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_bukalapak',
    name: 'Bukalapak Tech Solutions',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
    industry: 'Technology & E-Commerce',
    size: '1,000-5,000 employees',
    location: 'South Jakarta, Indonesia',
    website: 'https://careers.bukalapak.com',
    description: 'Empowering micro, small and medium enterprises across Indonesia through scalable financial and digital commerce technology.',
    foundedYear: 2010,
    verificationStatus: 'verified',
    verificationDocumentsCount: 3,
    verifiedAt: '2024-01-15',
    createdBy: 'system_admin',
    activeJobsCount: 4,
    createdAt: '2024-01-01',
  },
  {
    id: 'comp_gojek',
    name: 'GoTo Ecosystem Services',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80',
    industry: 'On-demand & Fintech',
    size: '5,000+ employees',
    location: 'Jakarta Capital Region, Indonesia',
    website: 'https://goto.com',
    description: 'Southeast Asia’s leading multi-service platform operating transport, food delivery, logistics, and integrated digital banking solutions.',
    foundedYear: 2015,
    verificationStatus: 'verified',
    verificationDocumentsCount: 4,
    verifiedAt: '2023-11-20',
    createdBy: 'system_admin',
    activeJobsCount: 6,
    createdAt: '2023-11-01',
  },
  {
    id: 'comp_traveloka',
    name: 'Traveloka Lifestyle Tech',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
    industry: 'Travel & Financial Services',
    size: '2,000-5,000 employees',
    location: 'Tangerang, Banten, Indonesia',
    website: 'https://www.traveloka.com/en-id/careers',
    description: 'Connecting consumers with flights, hotels, attractions, and local travel experiences throughout Southeast Asia and globally.',
    foundedYear: 2012,
    verificationStatus: 'verified',
    verificationDocumentsCount: 3,
    verifiedAt: '2024-02-10',
    createdBy: 'system_admin',
    activeJobsCount: 3,
    createdAt: '2024-01-10',
  },
  {
    id: 'comp_bankmandiri',
    name: 'Bank Mandiri Digital Core',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    industry: 'Banking & Financial Technology',
    size: '10,000+ employees',
    location: 'Plaza Mandiri, Gatot Subroto, Jakarta',
    website: 'https://bankmandiri.co.id/career',
    description: 'The largest banking institution in Indonesia, leading corporate enterprise modernization and next-generation Livin digital consumer banking.',
    foundedYear: 1998,
    verificationStatus: 'verified',
    verificationDocumentsCount: 5,
    verifiedAt: '2023-09-01',
    createdBy: 'system_admin',
    activeJobsCount: 5,
    createdAt: '2023-08-01',
  },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job_01',
    title: 'Senior Full Stack Software Engineer (TypeScript & React)',
    companyId: 'comp_bukalapak',
    companyName: 'Bukalapak Tech Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
    companyVerificationStatus: 'verified',
    employerId: 'system_admin',
    department: 'Engineering & Infrastructure',
    location: 'Jakarta Selatan, Indonesia',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 28000000,
    salaryMax: 42000000,
    currency: 'IDR',
    salaryPeriod: 'monthly',
    requiredSkills: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL', 'Docker'],
    responsibilities: [
      'Design, build, and maintain high-throughput merchant dashboard services used by 12M+ registered sellers.',
      'Architect robust web applications with zero-downtime deployments and comprehensive unit/integration test coverage.',
      'Mentor junior and mid-level engineers in code review practices and software architecture.',
      'Collaborate closely with product managers and UX designers to deliver accessible user flows.',
    ],
    requirements: [
      '5+ years of production experience in web application development using modern TypeScript/JavaScript.',
      'Demonstrated expertise with React, modern state management, and Node.js backend services.',
      'Solid foundation in relational databases, indexing, and transactional integrity.',
      'Strong communication skills in both Bahasa Indonesia and English for technical documentation.',
    ],
    benefits: [
      'Comprehensive medical insurance covering employee and dependents',
      'Hybrid flexibility with monthly home-office allowance',
      'Annual learning & professional certification stipend',
      'Performance bonus and stock options eligibility',
    ],
    workingHours: 'Monday - Friday (Flexitime 9:00 - 18:00 WIB)',
    deadline: '2026-11-30',
    status: 'active',
    applicantsCount: 14,
    viewsCount: 380,
    postedAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
  },
  {
    id: 'job_02',
    title: 'Product Design Lead (Design Systems & Design Operations)',
    companyId: 'comp_gojek',
    companyName: 'GoTo Ecosystem Services',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80',
    companyVerificationStatus: 'verified',
    employerId: 'system_admin',
    department: 'Product Experience',
    location: 'Jakarta & Remote, Indonesia',
    workplaceType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'lead',
    salaryMin: 35000000,
    salaryMax: 55000000,
    currency: 'IDR',
    salaryPeriod: 'monthly',
    requiredSkills: ['Figma', 'Design Systems', 'WCAG 2.1', 'Information Architecture', 'User Research'],
    responsibilities: [
      'Lead the evolution of Apollo-wide multi-platform design tokens and accessibility standards across web and mobile.',
      'Conduct rigorous usability studies, evaluative research sessions, and quantitative component audits.',
      'Partner directly with VP of Product and Staff Frontend Architects to align roadmap and UI fidelity.',
    ],
    requirements: [
      '6+ years in digital product design with proven track record leading unified design system libraries.',
      'Deep command of accessibility guidelines (WCAG AA), token architecture, and micro-interactions.',
      'Portfolio presenting shipped web applications with clear rationale, metrics, and systems design.',
    ],
    benefits: [
      '100% remote working allowance across Indonesia',
      'Premium health coverage including dental and optical care',
      'Annual wellness stipend and gym membership rebate',
      'Ergonomic workstation setup reimbursement',
    ],
    workingHours: 'Flexible Core Hours (10:00 - 16:00 WIB)',
    deadline: '2026-10-31',
    status: 'active',
    applicantsCount: 9,
    viewsCount: 290,
    postedAt: '2026-09-12T10:30:00Z',
    updatedAt: '2026-09-12T10:30:00Z',
  },
  {
    id: 'job_03',
    title: 'DevOps & Cloud Security Specialist',
    companyId: 'comp_bankmandiri',
    companyName: 'Bank Mandiri Digital Core',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    companyVerificationStatus: 'verified',
    employerId: 'system_admin',
    department: 'Cybersecurity & Infrastructure',
    location: 'South Jakarta, Indonesia',
    workplaceType: 'onsite',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 30000000,
    salaryMax: 48000000,
    currency: 'IDR',
    salaryPeriod: 'monthly',
    requiredSkills: ['Kubernetes', 'AWS / GCP', 'Terraform', 'CI/CD Pipelines', 'Zero-Trust Security'],
    responsibilities: [
      'Implement zero-trust network policies, identity federation, and automated vulnerability scanning across core banking clusters.',
      'Manage multi-region Kubernetes deployments ensuring 99.99% availability and SOC 2 / ISO 27001 regulatory compliance.',
      'Develop automated audit telemetry and incident response playbooks.',
    ],
    requirements: [
      '4+ years in cloud infrastructure, site reliability engineering, or enterprise DevSecOps.',
      'Hands-on experience with container orchestration (K8s) and Infrastructure as Code (Terraform).',
      'Certification in CKA, AWS Solutions Architect, or Google Cloud Professional Security is preferred.',
    ],
    benefits: [
      'State-owned enterprise stable retirement and pension schemes',
      'Family medical coverage with top-tier hospital executive network',
      'Subsidized vehicle and housing financing programs',
    ],
    workingHours: 'Monday - Friday (08:00 - 17:00 WIB)',
    deadline: '2026-11-15',
    status: 'active',
    applicantsCount: 8,
    viewsCount: 215,
    postedAt: '2026-09-14T09:00:00Z',
    updatedAt: '2026-09-14T09:00:00Z',
  },
  {
    id: 'job_04',
    title: 'Associate Product Manager — Travel FinTech',
    companyId: 'comp_traveloka',
    companyName: 'Traveloka Lifestyle Tech',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
    companyVerificationStatus: 'verified',
    employerId: 'system_admin',
    department: 'Financial Products',
    location: 'Tangerang, Banten, Indonesia',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 18000000,
    salaryMax: 27000000,
    currency: 'IDR',
    salaryPeriod: 'monthly',
    requiredSkills: ['Product Strategy', 'Data Analytics', 'SQL', 'A/B Testing', 'Agile Scrum'],
    responsibilities: [
      'Own end-to-end checkout and payment installment user funnels for millions of Southeast Asian travelers.',
      'Define clear product requirement specifications (PRDs) with testable user acceptance criteria.',
      'Analyze funnel drop-offs using SQL and event tracking dashboards to propose optimization experiments.',
    ],
    requirements: [
      '2+ years in digital product management, preferably within consumer tech, e-commerce, or payments.',
      'Analytical mindset with comfort writing basic SQL queries and reading retention cohorts.',
      'Bachelor’s degree in Computer Science, Business, Engineering, or related fields.',
    ],
    benefits: [
      'Annual Traveloka employee flight and hotel voucher discounts',
      'Hybrid schedule (2 days office, 3 days flexible remote)',
      'Medical, dental, and life insurance benefits',
    ],
    workingHours: 'Monday - Friday (09:00 - 18:00 WIB)',
    deadline: '2026-10-25',
    status: 'active',
    applicantsCount: 22,
    viewsCount: 540,
    postedAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'job_05',
    title: 'Junior Frontend Developer (Entry Level / Fresh Grad)',
    companyId: 'comp_bukalapak',
    companyName: 'Bukalapak Tech Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
    companyVerificationStatus: 'verified',
    employerId: 'system_admin',
    department: 'Merchant Platform',
    location: 'Bandung & Remote, Indonesia',
    workplaceType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    salaryMin: 10000000,
    salaryMax: 15000000,
    currency: 'IDR',
    salaryPeriod: 'monthly',
    requiredSkills: ['JavaScript', 'HTML/CSS', 'React.js', 'Git', 'Tailwind CSS'],
    responsibilities: [
      'Implement clean, responsive user interfaces following established design system guidelines.',
      'Fix frontend bugs, write automated component tests, and optimize page load performance.',
      'Participate actively in team sprint planning, daily standups, and peer code reviews.',
    ],
    requirements: [
      'Fresh graduate or 0-1 year practical experience with modern web development.',
      'Clear understanding of React basics, component lifecycles, and asynchronous web APIs.',
      'Curiosity, eagerness to learn, and passion for creating accessible web experiences.',
    ],
    benefits: [
      'Structured technical mentorship program with senior engineer pairing',
      'Full equipment provision (MacBook Pro + monitor allowance)',
      'Health insurance and regular team hackathons',
    ],
    workingHours: 'Monday - Friday (09:00 - 18:00 WIB)',
    deadline: '2026-11-20',
    status: 'active',
    applicantsCount: 45,
    viewsCount: 890,
    postedAt: '2026-09-16T14:00:00Z',
    updatedAt: '2026-09-16T14:00:00Z',
  },
];

// Local persistence storage helper for rock-solid zero-loss fallback
const STORAGE_KEYS = {
  JOBS: 'apollo_jobs_v1',
  COMPANIES: 'apollo_companies_v1',
  APPLICATIONS: 'apollo_applications_v1',
  SAVED_JOBS: 'apollo_saved_jobs_v1',
  USERS: 'apollo_users_v1',
  CONVERSATIONS: 'apollo_conversations_v1',
  MESSAGES: 'apollo_messages_v1',
  NOTIFICATIONS: 'apollo_notifications_v1',
  VERIFICATIONS: 'apollo_verifications_v1',
  REPORTS: 'apollo_reports_v1',
};

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage (${key})`, err);
  }
}

// Service class implementation
export class DatabaseService {
  // Initialize baseline data in local storage if empty
  static initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      setLocalData(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      setLocalData(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    }
  }

  // --- JOBS API ---
  static async getJobs(params?: {
    keyword?: string;
    location?: string;
    workplaceType?: WorkplaceType | 'all';
    employmentType?: EmploymentType | 'all';
    experienceLevel?: ExperienceLevel | 'all';
    minSalary?: number;
    sort?: 'newest' | 'salary_high' | 'relevance';
  }): Promise<Job[]> {
    if (isFirebaseConfigured && db) {
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        const fbJobs: Job[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
        if (fbJobs.length > 0) {
          return this.filterAndSortJobs(fbJobs, params);
        }
      } catch (err) {
        console.warn('Firestore fetch failed, falling back to persistent local storage:', err);
      }
    }

    this.initLocalStorage();
    const localJobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    return this.filterAndSortJobs(localJobs, params);
  }

  private static filterAndSortJobs(
    jobs: Job[],
    params?: {
      keyword?: string;
      location?: string;
      workplaceType?: WorkplaceType | 'all';
      employmentType?: EmploymentType | 'all';
      experienceLevel?: ExperienceLevel | 'all';
      minSalary?: number;
      sort?: 'newest' | 'salary_high' | 'relevance';
    }
  ): Job[] {
    let result = jobs.filter((j) => j.status === 'active');

    if (params?.keyword && params.keyword.trim()) {
      const q = params.keyword.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (params?.location && params.location.trim()) {
      const loc = params.location.toLowerCase().trim();
      result = result.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (params?.workplaceType && params.workplaceType !== 'all') {
      result = result.filter((j) => j.workplaceType === params.workplaceType);
    }

    if (params?.employmentType && params.employmentType !== 'all') {
      result = result.filter((j) => j.employmentType === params.employmentType);
    }

    if (params?.experienceLevel && params.experienceLevel !== 'all') {
      result = result.filter((j) => j.experienceLevel === params.experienceLevel);
    }

    if (params?.minSalary && params.minSalary > 0) {
      result = result.filter((j) => j.salaryMax >= params.minSalary!);
    }

    if (params?.sort === 'salary_high') {
      result.sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (params?.sort === 'newest') {
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    } else {
      // relevance / default
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    return result;
  }

  static async getJobById(id: string): Promise<Job | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'jobs', id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as Job;
        }
      } catch (err) {
        console.warn('Firestore getJobById error:', err);
      }
    }
    this.initLocalStorage();
    const jobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    return jobs.find((j) => j.id === id) || null;
  }

  static async createJob(jobData: Omit<Job, 'id' | 'postedAt' | 'updatedAt' | 'applicantsCount' | 'viewsCount'>): Promise<Job> {
    const now = new Date().toISOString();
    const newId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const fullJob: Job = {
      ...jobData,
      id: newId,
      postedAt: now,
      updatedAt: now,
      applicantsCount: 0,
      viewsCount: 0,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'jobs', newId), fullJob);
      } catch (err) {
        console.warn('Firestore createJob failed, writing to persistent store:', err);
      }
    }

    this.initLocalStorage();
    const jobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    jobs.unshift(fullJob);
    setLocalData(STORAGE_KEYS.JOBS, jobs);

    return fullJob;
  }

  static async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'jobs', jobId), { ...updates, updatedAt: now });
      } catch (err) {
        console.warn('Firestore updateJob error:', err);
      }
    }

    this.initLocalStorage();
    const jobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const idx = jobs.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      jobs[idx] = { ...jobs[idx], ...updates, updatedAt: now };
      setLocalData(STORAGE_KEYS.JOBS, jobs);
    }
  }

  static async getEmployerJobs(employerId: string): Promise<Job[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'jobs'), where('employerId', '==', employerId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
      } catch (err) {
        console.warn('Firestore getEmployerJobs error:', err);
      }
    }

    this.initLocalStorage();
    const jobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    return jobs.filter((j) => j.employerId === employerId || employerId === 'system_admin');
  }

  // --- APPLICATIONS API ---
  static async submitApplication(appData: Omit<Application, 'id' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'>): Promise<Application> {
    const now = new Date().toISOString();
    const newId = 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const application: Application = {
      ...appData,
      id: newId,
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          changedAt: now,
          note: 'Application successfully submitted by applicant.',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'applications', newId), application);
        // Increment job applicantsCount
        await updateDoc(doc(db, 'jobs', appData.jobId), {
          applicantsCount: (await this.getJobById(appData.jobId))?.applicantsCount ? (await this.getJobById(appData.jobId))!.applicantsCount + 1 : 1,
        });
      } catch (err) {
        console.warn('Firestore submitApplication failed, saving locally:', err);
      }
    }

    const apps = getLocalData<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    apps.unshift(application);
    setLocalData(STORAGE_KEYS.APPLICATIONS, apps);

    // Update job applicant count locally
    const jobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const jIdx = jobs.findIndex((j) => j.id === appData.jobId);
    if (jIdx !== -1) {
      jobs[jIdx].applicantsCount = (jobs[jIdx].applicantsCount || 0) + 1;
      setLocalData(STORAGE_KEYS.JOBS, jobs);
    }

    // Create a notification for the employer
    await this.createNotification({
      userId: appData.employerId,
      title: 'New Applicant Received',
      body: `${appData.applicantName} applied for ${appData.jobTitle}`,
      type: 'application',
      link: `/employer/applicants?jobId=${appData.jobId}`,
    });

    return application;
  }

  static async getApplicationsForUser(applicantId: string): Promise<Application[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'applications'), where('applicantId', '==', applicantId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
      } catch (err) {
        console.warn('Firestore getApplicationsForUser error:', err);
      }
    }

    const apps = getLocalData<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    return apps.filter((a) => a.applicantId === applicantId);
  }

  static async getApplicationsForJob(jobId: string): Promise<Application[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
      } catch (err) {
        console.warn('Firestore getApplicationsForJob error:', err);
      }
    }

    const apps = getLocalData<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    return apps.filter((a) => a.jobId === jobId);
  }

  static async getApplicationsForEmployer(employerId: string): Promise<Application[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'applications'), where('employerId', '==', employerId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
      } catch (err) {
        console.warn('Firestore getApplicationsForEmployer error:', err);
      }
    }

    const apps = getLocalData<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    return apps.filter((a) => a.employerId === employerId || employerId === 'system_admin');
  }

  static async updateApplicationStatus(appId: string, status: ApplicationStatus, note?: string): Promise<void> {
    const now = new Date().toISOString();
    const statusEntry = { status, changedAt: now, note };

    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'applications', appId));
        if (snap.exists()) {
          const curData = snap.data() as Application;
          await updateDoc(doc(db, 'applications', appId), {
            status,
            statusHistory: [...curData.statusHistory, statusEntry],
            updatedAt: now,
          });
        }
      } catch (err) {
        console.warn('Firestore updateApplicationStatus error:', err);
      }
    }

    const apps = getLocalData<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const idx = apps.findIndex((a) => a.id === appId);
    if (idx !== -1) {
      apps[idx].status = status;
      apps[idx].statusHistory.push(statusEntry);
      apps[idx].updatedAt = now;
      setLocalData(STORAGE_KEYS.APPLICATIONS, apps);

      // Notify the applicant
      await this.createNotification({
        userId: apps[idx].applicantId,
        title: 'Application Status Updated',
        body: `Your application for ${apps[idx].jobTitle} at ${apps[idx].companyName} is now: ${status.replace('_', ' ').toUpperCase()}`,
        type: 'application',
        link: '/seeker/applications',
      });
    }
  }

  // --- SAVED JOBS API ---
  static async getSavedJobIds(userId: string): Promise<string[]> {
    const saved = getLocalData<{ [userId: string]: string[] }>(STORAGE_KEYS.SAVED_JOBS, {});
    return saved[userId] || [];
  }

  static async toggleSaveJob(userId: string, jobId: string): Promise<boolean> {
    const saved = getLocalData<{ [userId: string]: string[] }>(STORAGE_KEYS.SAVED_JOBS, {});
    const userList = saved[userId] || [];
    const exists = userList.includes(jobId);
    let updated: string[];

    if (exists) {
      updated = userList.filter((id) => id !== jobId);
    } else {
      updated = [...userList, jobId];
    }

    saved[userId] = updated;
    setLocalData(STORAGE_KEYS.SAVED_JOBS, saved);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'savedJobs', `${userId}_${jobId}`);
        if (exists) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { userId, jobId, savedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Firestore toggleSaveJob error:', err);
      }
    }

    return !exists;
  }

  static async saveJob(userId: string, jobId: string): Promise<void> {
    const saved = await this.getSavedJobIds(userId);
    if (!saved.includes(jobId)) {
      await this.toggleSaveJob(userId, jobId);
    }
  }

  static async unsaveJob(userId: string, jobId: string): Promise<void> {
    const saved = await this.getSavedJobIds(userId);
    if (saved.includes(jobId)) {
      await this.toggleSaveJob(userId, jobId);
    }
  }

  static async updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
    await this.updateJob(jobId, { status });
  }

  // --- USER PROFILE API ---
  static async getUserProfile(uid: string): Promise<ApolloUser | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          return snap.data() as ApolloUser;
        }
      } catch (err) {
        console.warn('Firestore getUserProfile error:', err);
      }
    }

    const users = getLocalData<{ [uid: string]: ApolloUser }>(STORAGE_KEYS.USERS, {});
    return users[uid] || null;
  }

  static async saveUserProfile(user: ApolloUser): Promise<void> {
    const now = new Date().toISOString();
    const updated = { ...user, updatedAt: now };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (err) {
        console.warn('Firestore saveUserProfile error:', err);
      }
    }

    const users = getLocalData<{ [uid: string]: ApolloUser }>(STORAGE_KEYS.USERS, {});
    users[user.uid] = updated;
    setLocalData(STORAGE_KEYS.USERS, users);
  }

  // --- REAL-TIME CONVERSATIONS & CHAT ---
  static async getConversations(userId: string): Promise<Conversation[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'conversations'), where('participants', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
      } catch (err) {
        console.warn('Firestore getConversations error:', err);
      }
    }

    const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    return convs.filter((c) => c.participants.includes(userId));
  }

  static async createOrGetConversation(
    initiator: ApolloUser,
    recipient: { uid: string; displayName: string; photoURL?: string; role: any; headline?: string },
    jobContext?: { jobId: string; jobTitle: string; companyName: string }
  ): Promise<Conversation> {
    const existingList = await this.getConversations(initiator.uid);
    const found = existingList.find((c) => c.participants.includes(recipient.uid));
    if (found) return found;

    const now = new Date().toISOString();
    const newId = 'conv_' + [initiator.uid, recipient.uid].sort().join('_');

    const conversation: Conversation = {
      id: newId,
      participants: [initiator.uid, recipient.uid],
      participantDetails: {
        [initiator.uid]: {
          name: initiator.displayName || 'Professional',
          photoURL: initiator.photoURL,
          role: initiator.role,
          headline: initiator.headline,
        },
        [recipient.uid]: {
          name: recipient.displayName || 'Recipient',
          photoURL: recipient.photoURL,
          role: recipient.role,
          headline: recipient.headline,
        },
      },
      jobContext,
      lastMessageText: 'Conversation started',
      lastMessageSenderId: initiator.uid,
      lastMessageTimestamp: now,
      unreadCount: {
        [initiator.uid]: 0,
        [recipient.uid]: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'conversations', newId), conversation);
      } catch (err) {
        console.warn('Firestore createConversation error:', err);
      }
    }

    const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    convs.unshift(conversation);
    setLocalData(STORAGE_KEYS.CONVERSATIONS, convs);

    return conversation;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'conversations', conversationId, 'messages'),
          orderBy('timestamp', 'asc'),
          firestoreLimit(100)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      } catch (err) {
        console.warn('Firestore getMessages error:', err);
      }
    }

    const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
    return allMsgs[conversationId] || [];
  }

  // Real-time message subscription with automatic unsubscribe
  static subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'conversations', conversationId, 'messages'),
          orderBy('timestamp', 'asc'),
          firestoreLimit(100)
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
            callback(msgs);
          },
          (err) => {
            console.warn('Firestore onSnapshot messages error:', err);
            // Fallback to local
            const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
            callback(allMsgs[conversationId] || []);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn('subscribeToMessages setup failed:', err);
      }
    }

    // Local / Offline Realtime listener via CustomEvent
    const handleLocalUpdate = () => {
      const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
      callback(allMsgs[conversationId] || []);
    };

    // Initial load
    handleLocalUpdate();
    window.addEventListener('apollo-message-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      window.removeEventListener('apollo-message-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  // Real-time conversations list subscription
  static subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', userId),
          firestoreLimit(50)
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const convs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
            convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            callback(convs);
          },
          (err) => {
            console.warn('Firestore onSnapshot conversations error:', err);
            const localConvs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
            callback(localConvs.filter((c) => c.participants.includes(userId)));
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn('subscribeToConversations setup failed:', err);
      }
    }

    const handleLocalUpdate = () => {
      const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
      callback(convs.filter((c) => c.participants.includes(userId)));
    };

    handleLocalUpdate();
    window.addEventListener('apollo-conversation-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      window.removeEventListener('apollo-conversation-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  static async sendMessage(conversationId: string, sender: ApolloUser, text: string, attachmentUrl?: string): Promise<Message> {
    const now = new Date().toISOString();
    const msgId = 'msg_' + Date.now();

    const message: Message = {
      id: msgId,
      conversationId,
      senderId: sender.uid,
      senderName: sender.displayName || 'User',
      senderPhoto: sender.photoURL,
      text: text.trim(),
      attachmentUrl: attachmentUrl || undefined,
      timestamp: now,
      read: false,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'conversations', conversationId, 'messages', msgId), message);
        await updateDoc(doc(db, 'conversations', conversationId), {
          lastMessageText: text.trim() || (attachmentUrl ? 'Sent an attachment' : ''),
          lastMessageSenderId: sender.uid,
          lastMessageTimestamp: now,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Firestore sendMessage error:', err);
      }
    }

    const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
    if (!allMsgs[conversationId]) allMsgs[conversationId] = [];
    allMsgs[conversationId].push(message);
    setLocalData(STORAGE_KEYS.MESSAGES, allMsgs);

    // Update conversation metadata
    const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const cIdx = convs.findIndex((c) => c.id === conversationId);
    if (cIdx !== -1) {
      convs[cIdx].lastMessageText = text.trim() || (attachmentUrl ? 'Sent an attachment' : '');
      convs[cIdx].lastMessageSenderId = sender.uid;
      convs[cIdx].lastMessageTimestamp = now;
      convs[cIdx].updatedAt = now;
      setLocalData(STORAGE_KEYS.CONVERSATIONS, convs);
    }

    // Trigger local realtime sync
    window.dispatchEvent(new CustomEvent('apollo-message-update', { detail: { conversationId } }));
    window.dispatchEvent(new CustomEvent('apollo-conversation-update', { detail: { conversationId } }));

    return message;
  }

  static async markConversationRead(conversationId: string, userId: string): Promise<void> {
    const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const cIdx = convs.findIndex((c) => c.id === conversationId);
    if (cIdx !== -1 && convs[cIdx].unreadCount) {
      convs[cIdx].unreadCount[userId] = 0;
      setLocalData(STORAGE_KEYS.CONVERSATIONS, convs);
      window.dispatchEvent(new CustomEvent('apollo-conversation-update', { detail: { conversationId } }));
    }
  }

  // --- NOTIFICATIONS API ---
  static async getNotifications(userId: string): Promise<ApolloNotification[]> {
    const notifs = getLocalData<ApolloNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Real-time notifications subscription
  static subscribeToNotifications(userId: string, callback: (notifications: ApolloNotification[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          firestoreLimit(30)
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ApolloNotification));
            callback(notifs);
          },
          (err) => {
            console.warn('Firestore onSnapshot notifications error:', err);
            const notifs = getLocalData<ApolloNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
            callback(notifs.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn('subscribeToNotifications setup failed:', err);
      }
    }

    const handleLocalUpdate = () => {
      const notifs = getLocalData<ApolloNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
      callback(notifs.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    handleLocalUpdate();
    window.addEventListener('apollo-notification-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      window.removeEventListener('apollo-notification-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  static async createNotification(item: Omit<ApolloNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const now = new Date().toISOString();
    const newNotif: ApolloNotification = {
      ...item,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      read: false,
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      } catch (err) {
        console.warn('Firestore createNotification error:', err);
      }
    }

    const notifs = getLocalData<ApolloNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift(newNotif);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    window.dispatchEvent(new CustomEvent('apollo-notification-update', { detail: { userId: item.userId } }));
  }

  static async markNotificationRead(notifId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'notifications', notifId), { read: true });
      } catch (err) {
        console.warn('Firestore markNotificationRead error:', err);
      }
    }

    const notifs = getLocalData<ApolloNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const idx = notifs.findIndex((n) => n.id === notifId);
    if (idx !== -1) {
      notifs[idx].read = true;
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifs);
      window.dispatchEvent(new CustomEvent('apollo-notification-update'));
    }
  }

  // --- TRUST & VERIFICATION API ---
  static async submitVerificationRequest(reqData: Omit<VerificationRequest, 'id' | 'status' | 'submittedAt'>): Promise<VerificationRequest> {
    const now = new Date().toISOString();
    const newId = 'verif_' + Date.now();

    const request: VerificationRequest = {
      ...reqData,
      id: newId,
      status: 'pending',
      submittedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'verificationRequests', newId), request);
      } catch (err) {
        console.warn('Firestore submitVerificationRequest error:', err);
      }
    }

    const list = getLocalData<VerificationRequest[]>(STORAGE_KEYS.VERIFICATIONS, []);
    list.unshift(request);
    setLocalData(STORAGE_KEYS.VERIFICATIONS, list);

    return request;
  }

  static async submitTrustReport(reportData: Omit<TrustReport, 'id' | 'status' | 'createdAt'>): Promise<TrustReport> {
    const now = new Date().toISOString();
    const newId = 'rep_' + Date.now();

    const report: TrustReport = {
      ...reportData,
      id: newId,
      status: 'received',
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'reports', newId), report);
      } catch (err) {
        console.warn('Firestore submitTrustReport error:', err);
      }
    }

    const list = getLocalData<TrustReport[]>(STORAGE_KEYS.REPORTS, []);
    list.unshift(report);
    setLocalData(STORAGE_KEYS.REPORTS, list);

    return report;
  }

  static async getCompanies(): Promise<Company[]> {
    this.initLocalStorage();
    return getLocalData<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  }
}

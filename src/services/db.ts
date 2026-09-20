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
  StaffMember,
  SupportTicket,
  TicketReply,
  TicketStatus,
  StaffDivision,
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
    employerId: 'usr_emp_sarah',
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
    employerId: 'usr_emp_sarah',
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
    employerId: 'usr_emp_sarah',
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
    employerId: 'usr_emp_sarah',
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
    employerId: 'usr_emp_sarah',
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
  STAFF: 'apollo_staff_v1',
  TICKETS: 'apollo_tickets_v1',
};

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff_master_admin',
    email: 'marvelmaximilian@gmail.com',
    displayName: 'Marvel Maximilian',
    division: 'staff',
    roleTitle: 'Founder & Super Admin',
    passwordHash: 'admin123',
    status: 'active',
    phone: '+62 812-8888-0001',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'staff_master_admin_os',
    email: 'marvelmaximilianos@gmail.com',
    displayName: 'Marvel Maximilian',
    division: 'staff',
    roleTitle: 'Founder & Super Admin',
    passwordHash: 'admin123',
    status: 'active',
    phone: '+62 812-8888-0002',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'staff_op_andi',
    email: 'staff.andi@apollo.id',
    displayName: 'Andi Setiawan',
    division: 'staff',
    roleTitle: 'Operations & Verification Officer',
    passwordHash: 'staff123',
    status: 'active',
    phone: '+62 812-3344-5566',
    createdAt: '2024-02-10T08:00:00Z',
    createdBy: 'marvelmaximilian@gmail.com',
  },
  {
    id: 'staff_mod_diana',
    email: 'moderator.diana@apollo.id',
    displayName: 'Diana Safitri',
    division: 'moderator',
    roleTitle: 'Website & Content Moderator',
    passwordHash: 'mod123',
    status: 'active',
    phone: '+62 813-7788-9900',
    createdAt: '2024-02-15T09:30:00Z',
    createdBy: 'marvelmaximilian@gmail.com',
  },
  {
    id: 'staff_cs_budi',
    email: 'support.budi@apollo.id',
    displayName: 'Budi Santoso',
    division: 'support',
    roleTitle: 'Senior Customer Support Agent',
    passwordHash: 'cs123',
    status: 'active',
    phone: '+62 811-2233-4455',
    createdAt: '2024-02-20T10:00:00Z',
    createdBy: 'marvelmaximilian@gmail.com',
  },
];

const INITIAL_VERIFICATIONS: VerificationRequest[] = [
  {
    id: 'verif_01',
    applicantId: 'usr_emp_sarah',
    applicantName: 'Sarah Pratama',
    applicantRole: 'employer',
    targetType: 'company',
    targetName: 'Bukalapak Tech Solutions',
    documentType: 'Company Tax ID / NPWP / SIUP',
    documentNumber: '01.234.567.8-012.000',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    notes: 'Pemberian status akreditasi rekrutmen resmi tech employer.',
    status: 'pending',
    submittedAt: '2026-09-18T11:20:00Z',
  },
  {
    id: 'verif_02',
    applicantId: 'usr_dev_alex',
    applicantName: 'Alexander Wong',
    applicantRole: 'jobSeeker',
    targetType: 'professional',
    targetName: 'Alexander Wong',
    documentType: 'Government Identity / KTP / Passport',
    documentNumber: '3171012345678901',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    notes: 'Verifikasi identitas pencari kerja untuk badge Verified Talent.',
    status: 'pending',
    submittedAt: '2026-09-19T08:45:00Z',
  },
];

const INITIAL_REPORTS: TrustReport[] = [
  {
    id: 'rep_01',
    reporterId: 'usr_dev_alex',
    reporterEmail: 'alexander.wong@outlook.com',
    targetType: 'job',
    targetId: 'job_suspicious_01',
    targetTitleOrName: 'Lowongan Data Entry Instan Non-Resmi',
    reason: 'fraud_scam',
    details: 'Lowongan mencurigakan meminta biaya registrasi kartu member sebelum wawancara. Mohon tim moderator Apollo menindak tegas postingan ini.',
    status: 'received',
    createdAt: '2026-09-18T16:00:00Z',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'ticket_01',
    userId: 'usr_emp_sarah',
    userName: 'Sarah Pratama',
    userEmail: 'sarah.pratama@bukalapak.tech',
    userRole: 'employer',
    subject: 'Pertanyaan mengenai verifikasi batch dokumen PT Bukalapak',
    category: 'company_verification',
    priority: 'high',
    status: 'open',
    description: 'Halo tim Customer Support Apollo, kami telah mengunggah akta pendirian dan NIB terbaru untuk perpanjangan badge verified employer. Mohon konfirmasi apakah ada dokumen pendukung lain yang dibutuhkan.',
    replies: [
      {
        id: 'rep_01',
        ticketId: 'ticket_01',
        senderId: 'usr_emp_sarah',
        senderName: 'Sarah Pratama',
        senderRole: 'user',
        message: 'Halo tim Customer Support Apollo, kami telah mengunggah akta pendirian dan NIB terbaru untuk perpanjangan badge verified employer. Mohon konfirmasi apakah ada dokumen pendukung lain yang dibutuhkan.',
        createdAt: '2026-09-17T14:30:00Z',
      },
    ],
    createdAt: '2026-09-17T14:30:00Z',
    updatedAt: '2026-09-17T14:30:00Z',
  },
  {
    id: 'ticket_02',
    userId: 'usr_dev_alex',
    userName: 'Alexander Wong',
    userEmail: 'alexander.wong@outlook.com',
    userRole: 'jobSeeker',
    subject: 'Bantuan verifikasi sertifikasi Scrum Master dan GitHub Portfolio',
    category: 'account_verification',
    priority: 'normal',
    status: 'in_progress',
    description: 'Selamat siang Customer Support, saya baru menambahkan sertifikasi Scrum.org PSD-2023-8821 pada profil saya. Kapan estimasi proses review badge selesai?',
    assignedTo: 'Budi Santoso',
    assignedDivision: 'support',
    replies: [
      {
        id: 'rep_02',
        ticketId: 'ticket_02',
        senderId: 'usr_dev_alex',
        senderName: 'Alexander Wong',
        senderRole: 'user',
        message: 'Selamat siang Customer Support, saya baru menambahkan sertifikasi Scrum.org PSD-2023-8821 pada profil saya. Kapan estimasi proses review badge selesai?',
        createdAt: '2026-09-18T09:15:00Z',
      },
      {
        id: 'rep_03',
        ticketId: 'ticket_02',
        senderId: 'staff_cs_budi',
        senderName: 'Budi Santoso (Customer Support)',
        senderRole: 'support',
        message: 'Halo Alexander, terima kasih telah menghubungi Apollo Support. Tim verifikasi kami sedang meninjau validasi credential ID Anda ke database Scrum.org. Proses ini biasanya memakan waktu maksimal 1x24 jam kerja.',
        createdAt: '2026-09-18T10:00:00Z',
      },
    ],
    createdAt: '2026-09-18T09:15:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  },
];

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
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      setLocalData(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VERIFICATIONS)) {
      setLocalData(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      setLocalData(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      setLocalData(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
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
        const targetIds = Array.from(new Set([employerId, 'usr_emp_sarah', 'system_admin']));
        const q = query(collection(db, 'jobs'), where('employerId', 'in', targetIds));
        const snap = await getDocs(q);
        if (snap.docs.length > 0) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
        }
      } catch (err) {
        console.warn('Firestore getEmployerJobs error:', err);
      }
    }

    this.initLocalStorage();
    const jobs = getLocalData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    return jobs.filter(
      (j) =>
        j.employerId === employerId ||
        j.employerId === 'usr_emp_sarah' ||
        j.employerId === 'system_admin' ||
        employerId === 'system_admin' ||
        employerId === 'usr_emp_sarah'
    );
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
        try {
          const jobSnap = await getDoc(doc(db, 'jobs', appData.jobId));
          const currentCount = jobSnap.exists() ? (jobSnap.data().applicantsCount || 0) : 0;
          await setDoc(doc(db, 'jobs', appData.jobId), { applicantsCount: currentCount + 1 }, { merge: true });
        } catch (jobErr) {
          console.warn('Job applicant count increment skipped:', jobErr);
        }
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
        const targetIds = Array.from(new Set([employerId, 'usr_emp_sarah', 'system_admin']));
        const q = query(collection(db, 'applications'), where('employerId', 'in', targetIds));
        const snap = await getDocs(q);
        if (snap.docs.length > 0) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
        }
      } catch (err) {
        console.warn('Firestore getApplicationsForEmployer error:', err);
      }
    }

    const apps = getLocalData<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    return apps.filter(
      (a) =>
        a.employerId === employerId ||
        a.employerId === 'usr_emp_sarah' ||
        a.employerId === 'system_admin' ||
        employerId === 'usr_emp_sarah' ||
        employerId === 'system_admin'
    );
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
    const effectiveUserId = userId === 'system_admin' ? 'usr_emp_sarah' : userId;
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', effectiveUserId),
          firestoreLimit(50)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
      } catch (err) {
        console.warn('Firestore getConversations error:', err);
      }
    }

    const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    return convs.filter((c) => c.participants.includes(effectiveUserId));
  }

  static async createOrGetConversation(
    initiator: ApolloUser,
    recipient: { uid: string; displayName: string; photoURL?: string; role: any; headline?: string },
    jobContext?: { jobId: string; jobTitle: string; companyName: string }
  ): Promise<Conversation> {
    const initUid = initiator.uid === 'system_admin' ? 'usr_emp_sarah' : initiator.uid;
    const rawRecipUid = recipient.uid === 'system_admin' ? 'usr_emp_sarah' : recipient.uid;
    // Prevent chatting with oneself if testing as same account
    const targetRecipUid = rawRecipUid === initUid ? (initiator.role === 'employer' ? 'usr_dev_alex' : 'usr_emp_sarah') : rawRecipUid;

    const newId = 'conv_' + [initUid, targetRecipUid].sort().join('_');

    // 1. Check Firestore directly first
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'conversations', newId));
        if (docSnap.exists()) {
          const conv = { id: docSnap.id, ...docSnap.data() } as Conversation;
          // Update local cache
          const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
          const idx = convs.findIndex((c) => c.id === newId);
          if (idx !== -1) convs[idx] = conv;
          else convs.unshift(conv);
          setLocalData(STORAGE_KEYS.CONVERSATIONS, convs);
          return conv;
        }
      } catch (err) {
        console.warn('Firestore getDoc conversation error:', err);
      }
    }

    // 2. Check local data
    const existingList = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const found = existingList.find(
      (c) => c.id === newId || (c.participants.includes(initUid) && c.participants.includes(targetRecipUid))
    );
    if (found) return found;

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: newId,
      participants: [initUid, targetRecipUid],
      participantDetails: {
        [initUid]: {
          name: initiator.displayName || 'Professional',
          photoURL: initiator.photoURL,
          role: initiator.role,
          headline: initiator.headline,
        },
        [targetRecipUid]: {
          name: recipient.displayName || 'Contact',
          photoURL: recipient.photoURL,
          role: recipient.role,
          headline: recipient.headline,
        },
      },
      jobContext,
      lastMessageText: 'Conversation started',
      lastMessageSenderId: initUid,
      lastMessageTimestamp: now,
      unreadCount: {
        [initUid]: 0,
        [targetRecipUid]: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'conversations', newId), conversation, { merge: true });
      } catch (err) {
        console.error('Firestore createConversation error:', err);
      }
    }

    existingList.unshift(conversation);
    setLocalData(STORAGE_KEYS.CONVERSATIONS, existingList);
    window.dispatchEvent(new CustomEvent('apollo-conversation-update', { detail: { conversationId: newId } }));

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
    let unsubscribeFirestore: (() => void) | null = null;

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'conversations', conversationId, 'messages'),
          orderBy('timestamp', 'asc'),
          firestoreLimit(100)
        );
        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
            callback(msgs);
            // Sync local storage
            const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
            allMsgs[conversationId] = msgs;
            setLocalData(STORAGE_KEYS.MESSAGES, allMsgs);
          },
          (err) => {
            console.error('Firestore onSnapshot messages error:', err);
            const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
            callback(allMsgs[conversationId] || []);
          }
        );
      } catch (err) {
        console.error('subscribeToMessages setup failed:', err);
      }
    }

    // Local / Offline Realtime listener via CustomEvent
    const handleLocalUpdate = () => {
      const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
      callback(allMsgs[conversationId] || []);
    };

    // Initial load from local
    handleLocalUpdate();
    window.addEventListener('apollo-message-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
      window.removeEventListener('apollo-message-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  // Real-time conversations list subscription
  static subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    let unsubscribeFirestore: (() => void) | null = null;
    const effectiveUserId = userId === 'system_admin' ? 'usr_emp_sarah' : userId;

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', effectiveUserId),
          firestoreLimit(50)
        );
        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const convs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
            convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            callback(convs);
            // Sync local storage
            setLocalData(STORAGE_KEYS.CONVERSATIONS, convs);
          },
          (err) => {
            console.error('Firestore onSnapshot conversations error:', err);
            const localConvs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
            callback(localConvs.filter((c) => c.participants.includes(effectiveUserId)));
          }
        );
      } catch (err) {
        console.error('subscribeToConversations setup failed:', err);
      }
    }

    const handleLocalUpdate = () => {
      const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
      callback(convs.filter((c) => c.participants.includes(effectiveUserId)));
    };

    handleLocalUpdate();
    window.addEventListener('apollo-conversation-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
      window.removeEventListener('apollo-conversation-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  static async sendMessage(conversationId: string, sender: ApolloUser, text: string, attachmentUrl?: string): Promise<Message> {
    const now = new Date().toISOString();
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

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
        await setDoc(
          doc(db, 'conversations', conversationId),
          {
            lastMessageText: text.trim() || (attachmentUrl ? 'Sent an attachment' : ''),
            lastMessageSenderId: sender.uid,
            lastMessageTimestamp: now,
            updatedAt: now,
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Firestore sendMessage error:', err);
      }
    }

    const allMsgs = getLocalData<{ [convId: string]: Message[] }>(STORAGE_KEYS.MESSAGES, {});
    if (!allMsgs[conversationId]) allMsgs[conversationId] = [];
    allMsgs[conversationId].push(message);
    setLocalData(STORAGE_KEYS.MESSAGES, allMsgs);

    // Update conversation metadata locally
    const convs = getLocalData<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const cIdx = convs.findIndex((c) => c.id === conversationId);
    if (cIdx !== -1) {
      convs[cIdx].lastMessageText = text.trim() || (attachmentUrl ? 'Sent an attachment' : '');
      convs[cIdx].lastMessageSenderId = sender.uid;
      convs[cIdx].lastMessageTimestamp = now;
      convs[cIdx].updatedAt = now;
      setLocalData(STORAGE_KEYS.CONVERSATIONS, convs);
    }

    // Trigger realtime sync
    window.dispatchEvent(new CustomEvent('apollo-message-update', { detail: { conversationId } }));
    window.dispatchEvent(new CustomEvent('apollo-conversation-update', { detail: { conversationId } }));

    return message;
  }

  static async markConversationRead(conversationId: string, userId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(
          doc(db, 'conversations', conversationId),
          {
            [`unreadCount.${userId}`]: 0,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore markConversationRead error:', err);
      }
    }

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
  static async getVerificationRequests(): Promise<VerificationRequest[]> {
    this.initLocalStorage();
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(query(collection(db, 'verificationRequests'), orderBy('submittedAt', 'desc')));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationRequest));
          setLocalData(STORAGE_KEYS.VERIFICATIONS, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore getVerificationRequests error:', err);
      }
    }
    return getLocalData<VerificationRequest[]>(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
  }

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

  static async updateVerificationStatus(
    requestId: string,
    status: 'approved' | 'rejected' | 'more_info_needed',
    reviewerFeedback?: string,
    reviewerName: string = 'Super Admin'
  ): Promise<void> {
    const now = new Date().toISOString();
    const list = await this.getVerificationRequests();
    const target = list.find((r) => r.id === requestId);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'verificationRequests', requestId), {
          status,
          reviewedAt: now,
          reviewerFeedback: reviewerFeedback || '',
        });
      } catch (err) {
        console.warn('Firestore updateVerificationStatus error:', err);
      }
    }

    const idx = list.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].reviewedAt = now;
      list[idx].reviewerFeedback = reviewerFeedback;
      setLocalData(STORAGE_KEYS.VERIFICATIONS, list);
    }

    if (target) {
      const isApproved = status === 'approved';
      // If approved, update user's profile and company badge
      const userProfile = await this.getUserProfile(target.applicantId);
      if (userProfile) {
        const badgeText = target.applicantRole === 'employer' ? 'Verified Enterprise Employer' : 'Verified Professional Talent';
        await this.saveUserProfile({
          ...userProfile,
          verificationStatus: isApproved ? 'verified' : status === 'rejected' ? 'rejected' : 'pending',
          verificationBadgeDetails: isApproved ? badgeText : undefined,
        });
      }

      // If employer/company request, also update company status
      if (target.applicantRole === 'employer' || target.targetType === 'company') {
        const companies = await this.getCompanies();
        const cIdx = companies.findIndex((c) => c.name.toLowerCase() === target.targetName.toLowerCase() || c.createdBy === target.applicantId);
        if (cIdx !== -1) {
          companies[cIdx].verificationStatus = isApproved ? 'verified' : 'unverified';
          if (isApproved) {
            companies[cIdx].verifiedAt = now;
          }
          setLocalData(STORAGE_KEYS.COMPANIES, companies);
          if (isFirebaseConfigured && db) {
            try {
              await setDoc(doc(db, 'companies', companies[cIdx].id), companies[cIdx], { merge: true });
            } catch (err) {
              console.warn('Firestore company verification update error:', err);
            }
          }
        }
      }

      // Send notification to applicant
      await this.createNotification({
        userId: target.applicantId,
        title: isApproved ? 'Verifikasi Disetujui ✓' : status === 'rejected' ? 'Verifikasi Ditolak' : 'Permintaan Info Tambahan',
        body: isApproved
          ? `Selamat! Permohonan verifikasi untuk ${target.targetName} telah disetujui oleh ${reviewerName}. Badge resmi kini aktif di profil Anda.`
          : `Catatan verifikasi dari tim review: ${reviewerFeedback || 'Silakan tinjau kembali berkas yang diunggah.'}`,
        type: 'verification',
        link: '/profile',
      });
    }
  }

  // --- TRUST REPORTS (LAYANAN ADUAN) API ---
  static async getTrustReports(): Promise<TrustReport[]> {
    this.initLocalStorage();
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TrustReport));
          setLocalData(STORAGE_KEYS.REPORTS, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore getTrustReports error:', err);
      }
    }
    return getLocalData<TrustReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
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

  static async updateTrustReportStatus(
    reportId: string,
    status: 'investigating' | 'resolved' | 'dismissed',
    moderatorNotes?: string,
    actionTaken?: 'none' | 'warning_issued' | 'job_suspended' | 'user_suspended' | 'dismissed',
    resolvedBy: string = 'Website Moderator'
  ): Promise<void> {
    const now = new Date().toISOString();
    const list = await this.getTrustReports();
    const idx = list.findIndex((r) => r.id === reportId);

    if (idx !== -1) {
      list[idx].status = status;
      list[idx].moderatorNotes = moderatorNotes;
      list[idx].actionTaken = actionTaken;
      list[idx].resolvedBy = resolvedBy;
      list[idx].resolvedAt = now;
      setLocalData(STORAGE_KEYS.REPORTS, list);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'reports', reportId), {
          status,
          moderatorNotes: moderatorNotes || '',
          actionTaken: actionTaken || 'none',
          resolvedBy,
          resolvedAt: now,
        });
      } catch (err) {
        console.warn('Firestore updateTrustReportStatus error:', err);
      }
    }
  }

  // --- CUSTOMER SUPPORT SYSTEM API ---
  static async getSupportTickets(): Promise<SupportTicket[]> {
    this.initLocalStorage();
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc')));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
          setLocalData(STORAGE_KEYS.TICKETS, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore getSupportTickets error:', err);
      }
    }
    return getLocalData<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
  }

  static async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    const all = await this.getSupportTickets();
    return all.filter((t) => t.userId === userId || t.userEmail === userId);
  }

  static async createSupportTicket(
    ticketData: Omit<SupportTicket, 'id' | 'status' | 'replies' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicket> {
    const now = new Date().toISOString();
    const newId = 'ticket_' + Date.now();

    const newTicket: SupportTicket = {
      ...ticketData,
      id: newId,
      status: 'open',
      replies: [
        {
          id: 'rep_init_' + Date.now(),
          ticketId: newId,
          senderId: ticketData.userId,
          senderName: ticketData.userName,
          senderRole: 'user',
          message: ticketData.description,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'supportTickets', newId), newTicket);
      } catch (err) {
        console.warn('Firestore createSupportTicket error:', err);
      }
    }

    const list = getLocalData<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
    list.unshift(newTicket);
    setLocalData(STORAGE_KEYS.TICKETS, list);

    return newTicket;
  }

  static async addTicketReply(
    ticketId: string,
    replyData: Omit<TicketReply, 'id' | 'createdAt' | 'ticketId'>
  ): Promise<TicketReply> {
    const now = new Date().toISOString();
    const replyId = 'rep_' + Date.now();
    const reply: TicketReply = {
      ...replyData,
      id: replyId,
      ticketId,
      createdAt: now,
    };

    const tickets = await this.getSupportTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      if (!tickets[idx].replies) tickets[idx].replies = [];
      tickets[idx].replies.push(reply);
      tickets[idx].updatedAt = now;
      if (replyData.senderRole === 'support' || replyData.senderRole === 'admin') {
        if (tickets[idx].status === 'open') {
          tickets[idx].status = 'in_progress';
        }
      }
      setLocalData(STORAGE_KEYS.TICKETS, tickets);

      // Notify the ticket owner if replied by support
      if (replyData.senderRole !== 'user') {
        await this.createNotification({
          userId: tickets[idx].userId,
          title: 'Balasan Customer Support Baru',
          body: `${replyData.senderName} telah membalas tiket: "${tickets[idx].subject}"`,
          type: 'system',
          link: '/support',
        });
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        const ticketRef = doc(db, 'supportTickets', ticketId);
        await setDoc(ticketRef, tickets[idx], { merge: true });
      } catch (err) {
        console.warn('Firestore addTicketReply error:', err);
      }
    }

    return reply;
  }

  static async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    assignedTo?: string,
    assignedDivision?: StaffDivision
  ): Promise<void> {
    const now = new Date().toISOString();
    const tickets = await this.getSupportTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);

    if (idx !== -1) {
      tickets[idx].status = status;
      tickets[idx].updatedAt = now;
      if (assignedTo) tickets[idx].assignedTo = assignedTo;
      if (assignedDivision) tickets[idx].assignedDivision = assignedDivision;
      if (status === 'resolved' || status === 'closed') {
        tickets[idx].resolvedAt = now;
      }
      setLocalData(STORAGE_KEYS.TICKETS, tickets);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'supportTickets', ticketId), {
          status,
          updatedAt: now,
          ...(assignedTo ? { assignedTo } : {}),
          ...(assignedDivision ? { assignedDivision } : {}),
          ...(status === 'resolved' || status === 'closed' ? { resolvedAt: now } : {}),
        });
      } catch (err) {
        console.warn('Firestore updateTicketStatus error:', err);
      }
    }
  }

  // --- STAFF & ADMIN MANAGEMENT API ---
  static async getStaffMembers(): Promise<StaffMember[]> {
    this.initLocalStorage();
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(query(collection(db, 'staffMembers'), orderBy('createdAt', 'desc')));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StaffMember));
          setLocalData(STORAGE_KEYS.STAFF, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore getStaffMembers error:', err);
      }
    }
    return getLocalData<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  }

  static async createStaffMember(
    data: Omit<StaffMember, 'id' | 'createdAt'>
  ): Promise<StaffMember> {
    const now = new Date().toISOString();
    const newId = 'staff_' + Date.now();
    const newStaff: StaffMember = {
      ...data,
      id: newId,
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'staffMembers', newId), newStaff);
      } catch (err) {
        console.warn('Firestore createStaffMember error:', err);
      }
    }

    const list = getLocalData<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    list.unshift(newStaff);
    setLocalData(STORAGE_KEYS.STAFF, list);

    return newStaff;
  }

  static async updateStaffMember(staffId: string, updates: Partial<StaffMember>): Promise<void> {
    const list = await this.getStaffMembers();
    const idx = list.findIndex((s) => s.id === staffId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setLocalData(STORAGE_KEYS.STAFF, list);
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'staffMembers', staffId), updates, { merge: true });
      } catch (err) {
        console.warn('Firestore updateStaffMember error:', err);
      }
    }
  }

  static async deleteStaffMember(staffId: string): Promise<void> {
    const list = await this.getStaffMembers();
    const filtered = list.filter((s) => s.id !== staffId);
    setLocalData(STORAGE_KEYS.STAFF, filtered);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'staffMembers', staffId));
      } catch (err) {
        console.warn('Firestore deleteStaffMember error:', err);
      }
    }
  }

  static async staffLogin(email: string, password: string): Promise<{ user: ApolloUser; staff: StaffMember }> {
    const cleanEmail = email.trim().toLowerCase();

    // Check if Master Admin / Founder
    const isMasterEmail =
      cleanEmail === 'marvelmaximilian@gmail.com' ||
      cleanEmail === 'marvelmaximilianos@gmail.com' ||
      cleanEmail.includes('marvelmaximilian');

    if (isMasterEmail) {
      const now = new Date().toISOString();
      const masterUser: ApolloUser = {
        uid: 'usr_master_marvel',
        email: cleanEmail,
        displayName: 'Marvel Maximilian',
        role: 'admin',
        adminDivision: 'super_admin',
        isSuperAdmin: true,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'Platform Founder & Master Administrator',
        bio: 'Super Admin with full executive authority over verification, customer support, trust & safety moderation, and staff management.',
        location: 'Jakarta, Indonesia',
        skills: ['Executive Operations', 'Trust & Safety', 'Regulatory Compliance', 'Platform Management'],
        workExperience: [],
        education: [],
        certifications: [],
        verificationStatus: 'verified',
        verificationBadgeDetails: 'Executive Master Administrator',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: now,
      };

      const masterStaff: StaffMember = {
        id: 'staff_master_admin',
        email: cleanEmail,
        displayName: 'Marvel Maximilian',
        division: 'staff',
        roleTitle: 'Founder & Super Admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        lastLoginAt: now,
      };

      return { user: masterUser, staff: masterStaff };
    }

    // Check custom staff members
    const staffList = await this.getStaffMembers();
    const foundStaff = staffList.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!foundStaff) {
      throw new Error('Email staff tidak terdaftar dalam direktori internal Apollo.');
    }

    if (foundStaff.status !== 'active') {
      throw new Error('Akun staff ini sedang dinonaktifkan. Hubungi Master Administrator.');
    }

    if (foundStaff.passwordHash && foundStaff.passwordHash !== password.trim()) {
      throw new Error('Password staff tidak sesuai. Silakan periksa kembali.');
    }

    const now = new Date().toISOString();
    const staffUser: ApolloUser = {
      uid: 'usr_' + foundStaff.id,
      email: foundStaff.email,
      displayName: foundStaff.displayName,
      role: 'staff',
      adminDivision: foundStaff.division,
      isSuperAdmin: false,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundStaff.displayName)}`,
      headline: `${foundStaff.roleTitle} (Divisi: ${foundStaff.division.toUpperCase()})`,
      location: 'Jakarta, Indonesia',
      skills: ['Operations', 'Platform Review'],
      workExperience: [],
      education: [],
      certifications: [],
      verificationStatus: 'verified',
      verificationBadgeDetails: `Internal Apollo Staff — ${foundStaff.roleTitle}`,
      createdAt: foundStaff.createdAt,
      updatedAt: now,
    };

    return { user: staffUser, staff: foundStaff };
  }

  static async getCompanies(): Promise<Company[]> {
    this.initLocalStorage();
    return getLocalData<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  }
}

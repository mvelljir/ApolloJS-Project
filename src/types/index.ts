export type UserRole = 'jobSeeker' | 'employer';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type WorkplaceType = 'remote' | 'hybrid' | 'onsite';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type JobStatus = 'active' | 'paused' | 'closed';

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrg: string;
  credentialId?: string;
  issueDate: string;
  expiryDate?: string;
  verificationStatus: VerificationStatus;
  documentUrl?: string;
}

export interface ApolloUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  resumeUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  preferredWorkplace?: WorkplaceType[];
  preferredEmployment?: EmploymentType[];
  expectedSalaryMin?: number;
  expectedSalaryCurrency?: string;
  verificationStatus: VerificationStatus;
  verificationBadgeDetails?: string;
  companyId?: string;
  companyName?: string;
  companyRoleTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string; // e.g. "50-200 employees"
  location: string;
  website: string;
  description: string;
  foundedYear: number;
  verificationStatus: VerificationStatus;
  verificationDocumentsCount?: number;
  verifiedAt?: string;
  createdBy: string; // employer user uid
  activeJobsCount?: number;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyVerificationStatus: VerificationStatus;
  employerId: string;
  department: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  salaryPeriod: 'monthly' | 'yearly';
  requiredSkills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  workingHours?: string;
  deadline?: string;
  status: JobStatus;
  applicantsCount: number;
  viewsCount: number;
  postedAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobLocation: string;
  jobWorkplaceType: WorkplaceType;
  companyName: string;
  companyLogo?: string;
  employerId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantHeadline?: string;
  applicantPhoto?: string;
  applicantLocation?: string;
  applicantSkills: string[];
  coverNote: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }[];
  employerNotes?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // [user1Uid, user2Uid]
  participantDetails: {
    [uid: string]: {
      name: string;
      photoURL?: string;
      role: UserRole;
      headline?: string;
    };
  };
  jobContext?: {
    jobId: string;
    jobTitle: string;
    companyName: string;
  };
  lastMessageText: string;
  lastMessageSenderId: string;
  lastMessageTimestamp: string;
  unreadCount: {
    [uid: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  attachmentUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface ApolloNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'application' | 'message' | 'verification' | 'job' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: UserRole;
  targetType: 'company' | 'professional' | 'certification';
  targetName: string;
  documentType: string;
  documentNumber?: string;
  documentUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_needed';
  submittedAt: string;
  reviewedAt?: string;
  reviewerFeedback?: string;
}

export interface TrustReport {
  id: string;
  reporterId: string;
  reporterEmail: string;
  targetType: 'job' | 'user' | 'company' | 'message';
  targetId: string;
  targetTitleOrName: string;
  reason: 'fraud_scam' | 'misleading_salary' | 'harassment' | 'offensive_content' | 'discriminatory' | 'other';
  details: string;
  status: 'received' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

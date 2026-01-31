// User roles
export type UserRole = 'admin' | 'agent' | 'user';

// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bankId?: string; // For agents only
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  bankId?: string; // For agents
}

// Bank types
export interface Bank {
  id: string;
  name: string;
  logo: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// Question types
export type QuestionType = 'text' | 'textarea' | 'mcq' | 'checkbox' | 'dropdown' | 'number' | 'date' | 'email' | 'phone';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  order: number;
  createdAt: string;
}

// Section types
export interface Section {
  id: string;
  bankId: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  questions: Question[];
  createdAt: string;
}

// Response types
export interface QuestionResponse {
  questionId: string;
  value: string | string[];
}

export interface FormResponse {
  id: string;
  userId: string;
  user?: User;
  sectionId: string;
  section?: Section;
  bankId: string;
  bank?: Bank;
  responses: QuestionResponse[];
  isSubmitted: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard stats
export interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalBanks: number;
  totalResponses: number;
  submittedResponses: number;
  pendingResponses: number;
}

export interface AgentStats {
  totalResponses: number;
  submittedResponses: number;
  pendingResponses: number;
  totalUsers: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

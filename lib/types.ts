export type Role =
  | "PREGNANT_MOTHER"
  | "MIDWIFE"
  | "DOCTOR"
  | "ADMIN"
  | "CONTENT_EDITOR"
  | "CLINICAL_REVIEWER";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "missed"
  | "cancelled"
  | "rescheduled";

export type User = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: Role;
  consentGranted?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: unknown;
};

export type PageResult<T> = {
  data: T[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type Appointment = {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  visitType?: string;
  providerName?: string;
  facilityName?: string;
  reminderStatus?: "pending" | "sent" | "failed" | "cancelled";
};

export type Journal = {
  id: string;
  entryDate: string;
  mood?: string;
  symptoms?: string[];
  notes?: string;
};

export type Education = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceVersion?: string;
  updatedAt: string;
};

export type UserRole = 'doctor' | 'patient' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  profileComplete?: boolean;
}

export interface Notification {
  id: string;
  type: 'approved' | 'rescheduled' | 'cancelled' | 'reminder' | 'booking';
  message: string;
  time: string;
  read: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  qualifications: string;
  location: string;
  rating: number;
  experience: string;
  available: boolean;
  about?: string;
  education?: string[];
  languages?: string[];
  consultationFee?: string;
}

export interface Appointment {
  id: string;
  doctorName?: string;
  patientName?: string;
  specialty?: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  type?: string;
  meetLink?: string;
  symptoms?: string;
}

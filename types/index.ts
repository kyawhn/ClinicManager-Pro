export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  phoneNumber: string;
  location: string;
  allergy: string;
  pastMedicalHistory: string;
  createdAt: string;
  updatedAt: string;
  clinicId: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  complaints: string;
  diagnosis: string;
  treatment: string;
  fee: number;
  followUpDate?: string;
  visitDate: string;
  clinicId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'failed';
  notes?: string;
  clinicId: string;
}

export interface IncomeRecord {
  id: string;
  visitId: string;
  patientName: string;
  amount: number;
  date: string;
  description: string;
  clinicId: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  clinicId: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppData {
  patients: Patient[];
  visits: Visit[];
  appointments: Appointment[];
  incomeRecords: IncomeRecord[];
  expenseRecords: ExpenseRecord[];
  clinics: Clinic[];
}
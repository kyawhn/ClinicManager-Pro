import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, Visit, Appointment, IncomeRecord, ExpenseRecord, AppData } from '@/types';

interface DataContextType {
  patients: Patient[];
  visits: Visit[];
  appointments: Appointment[];
  incomeRecords: IncomeRecord[];
  expenseRecords: ExpenseRecord[];
  loading: boolean;
  
  // Patient methods
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  
  // Visit methods
  addVisit: (visit: Omit<Visit, 'id'>) => Promise<void>;
  
  // Appointment methods
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  
  // Financial methods
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Data management
  syncData: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const keys = ['patients', 'visits', 'appointments', 'incomeRecords', 'expenseRecords'];
      const results = await AsyncStorage.multiGet(keys);
      
      results.forEach(([key, value]) => {
        if (value) {
          const data = JSON.parse(value);
          switch (key) {
            case 'patients':
              setPatients(data);
              break;
            case 'visits':
              setVisits(data);
              break;
            case 'appointments':
              setAppointments(data);
              break;
            case 'incomeRecords':
              setIncomeRecords(data);
              break;
            case 'expenseRecords':
              setExpenseRecords(data);
              break;
          }
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (key: string, data: any[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    await saveData('patients', updatedPatients);
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const updatedPatients = patients.map(patient =>
      patient.id === id ? { ...patient, ...updates, updatedAt: new Date().toISOString() } : patient
    );
    setPatients(updatedPatients);
    await saveData('patients', updatedPatients);
  };

  const addVisit = async (visitData: Omit<Visit, 'id'>) => {
    const newVisit: Visit = {
      ...visitData,
      id: Date.now().toString(),
    };
    
    const updatedVisits = [...visits, newVisit];
    setVisits(updatedVisits);
    await saveData('visits', updatedVisits);
    
    // Add income record
    const incomeRecord: IncomeRecord = {
      id: Date.now().toString() + '_income',
      visitId: newVisit.id,
      patientName: visitData.patientName,
      amount: visitData.fee,
      date: visitData.visitDate,
      description: `Visit fee - ${visitData.patientName}`,
      clinicId: visitData.clinicId,
    };
    
    const updatedIncomeRecords = [...incomeRecords, incomeRecord];
    setIncomeRecords(updatedIncomeRecords);
    await saveData('incomeRecords', updatedIncomeRecords);
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    await saveData('appointments', updatedAppointments);
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === id ? { ...appointment, ...updates } : appointment
    );
    setAppointments(updatedAppointments);
    await saveData('appointments', updatedAppointments);
  };

  const addExpense = async (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: Date.now().toString(),
    };
    
    const updatedExpenses = [...expenseRecords, newExpense];
    setExpenseRecords(updatedExpenses);
    await saveData('expenseRecords', updatedExpenses);
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseRecord>) => {
    const updatedExpenses = expenseRecords.map(expense =>
      expense.id === id ? { ...expense, ...updates } : expense
    );
    setExpenseRecords(updatedExpenses);
    await saveData('expenseRecords', updatedExpenses);
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenseRecords.filter(expense => expense.id !== id);
    setExpenseRecords(updatedExpenses);
    await saveData('expenseRecords', updatedExpenses);
  };

  const syncData = async () => {
    // Placeholder for Google Drive sync functionality
    console.log('Syncing data to Google Drive...');
  };

  const value = {
    patients,
    visits,
    appointments,
    incomeRecords,
    expenseRecords,
    loading,
    addPatient,
    updatePatient,
    addVisit,
    addAppointment,
    updateAppointment,
    addExpense,
    updateExpense,
    deleteExpense,
    syncData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}